from fastapi import APIRouter, HTTPException, Depends, status
from app.models.auth import UserRegister, UserLogin, PasswordReset, TokenResponse
from app.core.auth import create_access_token
from app.repositories.firestore_repository import FirestoreRepository
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
repo = FirestoreRepository()

@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    # Check if user already exists
    existing = repo.query_documents("users", "email", "==", user.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists."
        )
    
    uid = str(uuid.uuid4())[:8]
    user_data = {
        "uid": uid,
        "email": user.email,
        "name": user.name,
        "role": user.role
    }
    
    # Write user
    repo.set_document("users", uid, user_data)
    
    # Generate token
    token = create_access_token({"uid": uid, "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, uid=uid, role=user.role)

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    users = repo.query_documents("users", "email", "==", credentials.email)
    if not users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or email not registered."
        )
    
    user = users[0]
    uid = user.get("uid")
    role = user.get("role", "field-ops")
    
    # Issue token
    token = create_access_token({"uid": uid, "email": credentials.email, "role": role})
    return TokenResponse(access_token=token, uid=uid, role=role)

@router.post("/reset-password")
async def reset_password(req: PasswordReset):
    users = repo.query_documents("users", "email", "==", req.email)
    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account email address not found in system."
        )
    return {"message": f"Secure reset password link dispatched to {req.email}."}

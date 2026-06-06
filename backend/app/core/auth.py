from datetime import datetime, timedelta
from typing import Optional, List
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

class UserPayload:
    def __init__(self, uid: str, email: str, role: str):
        self.uid = uid
        self.email = email
        self.role = role

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[UserPayload]:
    try:
        # Check if it looks like a Firebase ID Token or standard JWT
        # Firebase tokens have specific payload structures. Standard JWT uses local secret.
        try:
            # First try standard JWT
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
            uid = payload.get("uid")
            email = payload.get("email")
            role = payload.get("role", "field-ops")
            if uid and email:
                return UserPayload(uid, email, role)
        except jwt.PyJWTError:
            # Fallback: Try Firebase auth verify
            decoded_token = firebase_auth.verify_id_token(token)
            uid = decoded_token.get("uid")
            email = decoded_token.get("email")
            # Read custom claims for roles
            role = decoded_token.get("role", "field-ops")
            if uid and email:
                return UserPayload(uid, email, role)
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
    return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserPayload:
    token = credentials.credentials
    user_payload = verify_token(token)
    if not user_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid security token or session expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_payload

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: UserPayload = Depends(get_current_user)):
        # super-admin bypasses all checks
        if current_user.role == "super-admin":
            return current_user
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required permissions: {self.allowed_roles}",
            )
        return current_user

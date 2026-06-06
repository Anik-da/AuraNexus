from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List
from app.core.auth import get_current_user, RoleChecker, UserPayload
from app.services.ai_models_service import AIModelsService
from app.repositories.firestore_repository import FirestoreRepository
from app.core.config import settings
from datetime import datetime
import uuid
import io

router = APIRouter(prefix="/ai", tags=["AI Core & Computer Vision"])
repo = FirestoreRepository()
ai_models = AIModelsService(settings.HUGGINGFACE_API_TOKEN)
ops_or_admin = RoleChecker(["field-ops", "crop-intelligence", "super-admin"])

class TTSInput(BaseModel):
    text: str

@router.post("/detect-plant")
async def detect_plant(file: UploadFile = File(...), current_user: UserPayload = Depends(ops_or_admin)):
    """Detect plant disease status using Hugging Face classifiers."""
    try:
        content = await file.read()
        res = ai_models.detect_plant_disease(content)
        
        # Save to Firebase
        doc_id = str(uuid.uuid4())[:8]
        log_data = {
            "id": doc_id,
            "plant": res["plant"],
            "status": res["status"],
            "confidence": res["confidence"],
            "timestamp": str(datetime.utcnow())
        }
        repo.set_document("plant_detections", doc_id, log_data)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/object-detection")
async def object_detection(file: UploadFile = File(...), current_user: UserPayload = Depends(ops_or_admin)):
    """Run YOLOv8 Nano object tracker on frame uploads."""
    try:
        content = await file.read()
        res = ai_models.detect_objects(content)
        
        # Save to Firebase
        for obj in res["objects"]:
            doc_id = str(uuid.uuid4())[:8]
            repo.set_document("object_detections", doc_id, {
                "id": doc_id,
                "label": obj["label"],
                "confidence": obj["confidence"],
                "timestamp": str(datetime.utcnow())
            })
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...), current_user: UserPayload = Depends(ops_or_admin)):
    """Transcribe audio command recordings using Whisper."""
    try:
        content = await file.read()
        res = ai_models.speech_to_text(content)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/speak")
async def speak_text(req: TTSInput, current_user: UserPayload = Depends(ops_or_admin)):
    """Synthesize speech audio from text using TTS."""
    try:
        audio_data = ai_models.speak_text(req.text)
        return StreamingResponse(io.BytesIO(audio_data), media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/navigation-vision")
async def navigation_vision(file: UploadFile = File(...), current_user: UserPayload = Depends(ops_or_admin)):
    """Run DINO landmark and hallway label visual inspections."""
    try:
        content = await file.read()
        res = ai_models.navigation_vision(content)
        
        # Save to Firebase
        doc_id = str(uuid.uuid4())[:8]
        repo.set_document("navigation_logs", doc_id, {
            "id": doc_id,
            "location": res["location"],
            "confidence": res["confidence"],
            "timestamp": str(datetime.utcnow())
        })
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_ai_history(limit: int = 50):
    """Retrieve history of AI classifications."""
    detections = repo.list_documents("plant_detections", limit=limit)
    return detections

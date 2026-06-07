from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime
import uuid
import os
import logging
from app.repositories.firestore_repository import FirestoreRepository
from app.services.ai_models_service import AIModelsService
from app.core.config import settings
from app.core.firebase import bucket
from app.core.websocket_manager import ws_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/esp32", tags=["ESP32 Hardware Integration"])

# Dependencies
repo = FirestoreRepository()
ai_service = AIModelsService(settings.HUGGINGFACE_API_TOKEN)

# In-memory queues for ESP32 commands
_CURRENT_TASK = "Idle - Waiting for Operative Directive"
_NAV_COMMAND = "Bearing: 0.0, Speed: 0.0"

class ESP32SensorInput(BaseModel):
    temperature: float
    humidity: float
    soil_moisture: float

@router.post("/image")
async def receive_esp32_image(file: UploadFile = File(...)):
    """Capture plant snapshots, trigger diagnostics & navigation vision, and logs to dataset."""
    global _CURRENT_TASK
    _CURRENT_TASK = "Analyzing Plant Bioscan Snapshot"
    
    try:
        image_bytes = await file.read()
        
        # Execute Models
        plant_result = ai_service.detect_plant_disease(image_bytes)
        nav_vision = ai_service.navigation_vision(image_bytes)
        
        # Save image locally or upload to Firebase Storage
        image_uuid = str(uuid.uuid4())
        image_url = ""
        
        if bucket:
            try:
                blob = bucket.blob(f"self_learning_dataset/{image_uuid}.jpg")
                blob.upload_from_string(image_bytes, content_type="image/jpeg")
                blob.make_public()
                image_url = blob.public_url
            except Exception as e:
                logger.warning(f"Firebase Storage upload failed, falling back to local dataset: {e}")
                
        if not image_url:
            # Fallback to local files
            os.makedirs(settings.LOCAL_DATASET_DIR, exist_ok=True)
            local_path = os.path.join(settings.LOCAL_DATASET_DIR, f"{image_uuid}.jpg")
            with open(local_path, "wb") as f:
                f.write(image_bytes)
            image_url = f"/dataset/{image_uuid}.jpg"

        # Log AI results to Firebase collections
        plant_log_id = str(uuid.uuid4())[:8]
        plant_log = {
            "id": plant_log_id,
            "plant": plant_result["plant"],
            "status": plant_result["status"],
            "confidence": plant_result["confidence"],
            "image_url": image_url,
            "timestamp": str(datetime.utcnow())
        }
        repo.set_document("plant_detections", plant_log_id, plant_log)

        nav_log_id = str(uuid.uuid4())[:8]
        nav_log = {
            "id": nav_log_id,
            "location": nav_vision["location"],
            "confidence": nav_vision["confidence"],
            "timestamp": str(datetime.utcnow())
        }
        repo.set_document("navigation_logs", nav_log_id, nav_log)

        # Self-Learning Dataset System logging
        dataset_log_id = str(uuid.uuid4())[:8]
        repo.set_document("self_learning_dataset", dataset_log_id, {
            "id": dataset_log_id,
            "image_url": image_url,
            "prediction": plant_result,
            "confidence_score": plant_result["confidence"],
            "timestamp": str(datetime.utcnow())
        })

        # Broadcast WebSockets update
        ws_payload = {
            "type": "plant_disease_detection",
            "data": plant_log,
            "navigation": nav_log
        }
        await ws_manager.broadcast(ws_payload)

        _CURRENT_TASK = "Idle - Scan Completed"
        return {
            "status": "success",
            "plant": plant_result,
            "navigation": nav_vision,
            "image_url": image_url
        }

    except Exception as e:
        logger.error(f"Error handling ESP32 image upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/frame")
async def receive_esp32_frame(file: UploadFile = File(...)):
    """Receive live frames from ESP32 camera, trigger YOLOv8 object detections."""
    try:
        frame_bytes = await file.read()
        
        # Run YOLOv8 Nano object detection model
        yolo_result = ai_service.detect_objects(frame_bytes)
        
        # Log to Firebase
        for obj in yolo_result["objects"]:
            det_id = str(uuid.uuid4())[:8]
            det_data = {
                "id": det_id,
                "label": obj["label"],
                "confidence": obj["confidence"],
                "timestamp": str(datetime.utcnow())
            }
            repo.set_document("object_detections", det_id, det_data)

        # Broadcast WebSocket updates
        await ws_manager.broadcast({
            "type": "live_ai_detections",
            "detections": yolo_result["objects"],
            "timestamp": str(datetime.utcnow())
        })

        return yolo_result
    except Exception as e:
        logger.error(f"Error executing ESP32 frame YOLO scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio")
async def receive_esp32_audio(file: UploadFile = File(...)):
    """Receive speech voice recordings, runs Whisper Speech-to-Text command extractor."""
    global _CURRENT_TASK
    _CURRENT_TASK = "Compiling Speech Commands"
    
    try:
        audio_bytes = await file.read()
        
        # Run Speech-to-Text Whisper Tiny
        stt_result = ai_service.speech_to_text(audio_bytes)
        
        # Log to Firebase
        cmd_id = str(uuid.uuid4())[:8]
        cmd_data = {
            "id": cmd_id,
            "command_text": stt_result["text"],
            "timestamp": str(datetime.utcnow())
        }
        repo.set_document("voice_commands", cmd_id, cmd_data)
        
        # Broadcast text command update
        await ws_manager.broadcast({
            "type": "voice_command_received",
            "command": stt_result["text"],
            "timestamp": str(datetime.utcnow())
        })
        
        _CURRENT_TASK = f"Executing Command: {stt_result['text']}"
        return stt_result
    except Exception as e:
        logger.error(f"Error processing ESP32 audio command: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sensor-data")
async def receive_esp32_sensors(data: ESP32SensorInput):
    """Receive environment telemetry, executes Random Forest recommendation model."""
    try:
        recommendation = ai_service.analyze_environment(
            data.temperature,
            data.humidity,
            data.soil_moisture
        )

        # Log sensors
        log_id = str(uuid.uuid4())[:8]
        log_data = {
            "id": log_id,
            "reading": {
                "temp": data.temperature,
                "humidity": data.humidity,
                "soil_moisture": data.soil_moisture,
                "obstacle_distance": 10.0,
                "light_level": 400,
                "methane": 0.05
            },
            "timestamp": str(datetime.utcnow())
        }
        repo.set_document("sensor_logs", log_id, log_data)
        
        # Update robot's live sensors
        repo.set_document("robots", "AURA-1", {
            "sensors_live": log_data["reading"]
        })

        # Broadcast live telemetry update
        await ws_manager.broadcast({
            "type": "sensor_updates",
            "sensors": log_data["reading"],
            "recommendation": recommendation["recommendation"],
            "timestamp": str(datetime.utcnow())
        })

        return {
            "status": "success",
            "recommendation": recommendation["recommendation"]
        }
    except Exception as e:
        logger.error(f"Error analyzing ESP32 environmental sensors: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/navigation-command")
async def get_navigation_command():
    """Return motor commands for ESP32 traversal."""
    return {"command": _NAV_COMMAND}

@router.post("/navigation-command")
async def set_navigation_command(payload: Dict[str, Any]):
    """Set active traversal command for physical ESP32."""
    global _NAV_COMMAND
    command = payload.get("command", "STOP")
    _NAV_COMMAND = command
    
    # Broadcast to dashboard clients
    await ws_manager.broadcast({
        "type": "navigation_update",
        "command": _NAV_COMMAND,
        "timestamp": str(datetime.utcnow())
    })
    
    return {"status": "success", "command": _NAV_COMMAND}

@router.get("/current-task")
async def get_current_task():
    """Return the current active mission schedule task."""
    return {"current_task": _CURRENT_TASK}

@router.get("/status")
async def get_esp32_status():
    """Return system connection status logs."""
    return {
        "status": "active",
        "robot_id": "AURA-1",
        "last_ping": str(datetime.utcnow())
    }

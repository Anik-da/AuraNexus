from fastapi import APIRouter, Depends, HTTPException, status
from app.models.sensor import SensorReading, SensorLogCreate, SensorLogResponse
from app.core.auth import get_current_user, RoleChecker, UserPayload
from app.repositories.firestore_repository import FirestoreRepository
from datetime import datetime
import uuid

router = APIRouter(prefix="/sensor", tags=["Environmental Sensors"])
repo = FirestoreRepository()
ops_or_admin = RoleChecker(["field-ops", "super-admin"])

@router.get("/live", response_model=SensorReading)
async def get_live_sensors():
    robot_data = repo.get_document("robots", "AURA-1")
    if not robot_data or "sensors_live" not in robot_data:
        # Fallback default
        return SensorReading(temp=23.5, humidity=52.0, soil_moisture=41.5, obstacle_distance=9.2, light_level=350, methane=0.08)
    return SensorReading(**robot_data["sensors_live"])

@router.get("/history", response_model=list[SensorLogResponse])
async def get_sensors_history(limit: int = 50):
    logs = repo.list_documents("sensor_logs", limit=limit)
    res = []
    for log in logs:
        try:
            # Safely format timestamp string to datetime object if needed
            ts = log.get("timestamp")
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            res.append(SensorLogResponse(
                id=log.get("id"),
                robot_id=log.get("robot_id", "AURA-1"),
                reading=SensorReading(**log.get("reading", {})),
                timestamp=ts or datetime.utcnow()
            ))
        except Exception:
            continue
    return res

@router.post("/upload", response_model=SensorLogResponse)
async def upload_sensor_log(log_input: SensorLogCreate, current_user: UserPayload = Depends(ops_or_admin)):
    log_id = str(uuid.uuid4())[:8]
    data = {
        "id": log_id,
        "robot_id": log_input.robot_id,
        "reading": log_input.reading.model_dump(),
        "timestamp": str(log_input.timestamp)
    }
    
    # Save log
    repo.set_document("sensor_logs", log_id, data)
    
    # Update live sensors on the robot
    repo.set_document("robots", log_input.robot_id, {
        "sensors_live": log_input.reading.model_dump()
    })
    
    return SensorLogResponse(
        id=log_id,
        robot_id=log_input.robot_id,
        reading=log_input.reading,
        timestamp=log_input.timestamp
    )

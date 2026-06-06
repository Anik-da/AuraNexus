import logging
from typing import Dict, List, Any, Optional
from google.cloud.firestore_v1 import Client
from datetime import datetime
from app.core.firebase import db

logger = logging.getLogger(__name__)

# Fallback in-memory database if Firebase client is not initialized
_MEM_DB: Dict[str, Dict[str, Any]] = {
    "users": {},
    "robots": {
        "AURA-1": {
            "robot_id": "AURA-1",
            "battery_level": 89,
            "connectivity": "online",
            "signal_strength: ": 94,
            "mode": "manual",
            "coordinates": {"x": 20.0, "y": 0.0, "z": 75.0, "lat": 34.0522, "lng": -118.2437},
            "heading": 45,
            "speed": 0.0,
            "sensors_live": {"temp": 24.2, "humidity": 55.0, "soil_moisture": 42.0, "obstacle_distance": 8.0, "light_level": 320, "methane": 0.12}
        }
    },
    "sensor_logs": {},
    "activity_logs": {},
    "ai_detections": {},
    "navigation_routes": {},
    "plant_detections": {},
    "object_detections": {},
    "navigation_logs": {},
    "voice_commands": {},
    "self_learning_dataset": {},
    "locations": {
        "dock": {"id": "dock", "name": "Base Charge Station", "x": 20.0, "y": 0.0, "z": 75.0, "lat": 34.0522, "lng": -118.2437},
        "greenhouse-a": {"id": "greenhouse-a", "name": "Greenhouse Alpha", "x": 80.0, "y": 0.0, "z": 25.0, "lat": 34.0526, "lng": -118.2431}
    },
    "missions": {
        "MIS-402": {"id": "MIS-402", "name": "Bio-Greenhouse Area Sweep", "status": "completed", "duration": "45m 12s", "efficiency": 94.2, "date": "2026-06-04"}
    },
    "alerts": {},
    "settings": {}
}

class FirestoreRepository:
    def __init__(self):
        self.db: Optional[Client] = db
        if not self.db:
            logger.warning("Firestore Client is offline. Using local memory mock store.")

    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        try:
            if self.db:
                doc_ref = self.db.collection(collection).document(doc_id)
                doc = doc_ref.get()
                if doc.exists:
                    return {"id": doc.id, **doc.to_dict()}
            else:
                return _MEM_DB.get(collection, {}).get(doc_id)
        except Exception as e:
            logger.error(f"Firestore get_document error in collection '{collection}': {e}")
        return None

    def list_documents(self, collection: str, limit: int = 50) -> List[Dict[str, Any]]:
        try:
            if self.db:
                docs = self.db.collection(collection).limit(limit).stream()
                return [{"id": doc.id, **doc.to_dict()} for doc in docs]
            else:
                return list(_MEM_DB.get(collection, {}).values())[:limit]
        except Exception as e:
            logger.error(f"Firestore list_documents error in collection '{collection}': {e}")
        return []

    def set_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        try:
            if self.db:
                self.db.collection(collection).document(doc_id).set(data, merge=True)
                return True
            else:
                if collection not in _MEM_DB:
                    _MEM_DB[collection] = {}
                _MEM_DB[collection][doc_id] = {"id": doc_id, **data}
                return True
        except Exception as e:
            logger.error(f"Firestore set_document error in collection '{collection}': {e}")
        return False

    def add_document(self, collection: str, data: Dict[str, Any]) -> Optional[str]:
        try:
            if self.db:
                update_time, doc_ref = self.db.collection(collection).add(data)
                return doc_ref.id
            else:
                import uuid
                doc_id = str(uuid.uuid4())[:8]
                if collection not in _MEM_DB:
                    _MEM_DB[collection] = {}
                _MEM_DB[collection][doc_id] = {"id": doc_id, **data}
                return doc_id
        except Exception as e:
            logger.error(f"Firestore add_document error in collection '{collection}': {e}")
        return None

    def query_documents(self, collection: str, field: str, op: str, value: Any, limit: int = 50) -> List[Dict[str, Any]]:
        try:
            if self.db:
                docs = self.db.collection(collection).where(field, op, value).limit(limit).stream()
                return [{"id": doc.id, **doc.to_dict()} for doc in docs]
            else:
                results = []
                for item in _MEM_DB.get(collection, {}).values():
                    item_val = item.get(field)
                    if op == "==" and item_val == value:
                        results.append(item)
                    elif op == ">" and item_val is not None and item_val > value:
                        results.append(item)
                    elif op == "<" and item_val is not None and item_val < value:
                        results.append(item)
                return results[:limit]
        except Exception as e:
            logger.error(f"Firestore query_documents error: {e}")
        return []

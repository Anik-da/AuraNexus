import logging
import random
from typing import Dict, Any, List
from datetime import datetime
from app.repositories.firestore_repository import FirestoreRepository

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, repo: FirestoreRepository):
        self.repo = repo

    def detect_plant_health(self) -> Dict[str, Any]:
        diseases = [
            {"detected": False, "disease_type": "None (Healthy Maize)", "confidence": 98.4, "remedy_suggestions": []},
            {"detected": True, "disease_type": "Corn Leaf Blight", "confidence": 84.2, "remedy_suggestions": ["Apply organic copper fungicide", "Increase rows spacing"]},
            {"detected": True, "disease_type": "Soybean Rust", "confidence": 76.8, "remedy_suggestions": ["Prune infected lower foliage", "Introduce protective neem spray"]}
        ]
        
        result = random.choice(diseases)
        result["timestamp"] = str(datetime.utcnow())
        
        # Log to repository
        self.repo.add_document("ai_detections", {
            "category": "plant_health",
            "detected": result["detected"],
            "label": result["disease_type"],
            "confidence": result["confidence"],
            "timestamp": result["timestamp"]
        })
        
        return result

    def object_detection(self) -> Dict[str, Any]:
        labels = ["Weed Intrusion", "Agricultural Obstacle", "Tool Cart", "Patrol Operative"]
        count = random.randint(1, 3)
        detections = []
        
        for i in range(count):
            label = random.choice(labels)
            conf = float(random.randint(70, 99))
            box = {
                "x": float(random.randint(10, 60)),
                "y": float(random.randint(10, 60)),
                "width": float(random.randint(15, 30)),
                "height": float(random.randint(15, 40))
            }
            detections.append({
                "label": label,
                "confidence": conf,
                "box": box
            })
            
            # Log
            self.repo.add_document("ai_detections", {
                "category": "object_detection",
                "label": label,
                "confidence": conf,
                "timestamp": str(datetime.utcnow())
            })

        return {
            "target_count": count,
            "detections": detections,
            "timestamp": str(datetime.utcnow())
        }

    def navigation_analysis(self, lidar_grid: List[float]) -> Dict[str, Any]:
        # If any element in lidar grid is small, path is blocked
        blocked = any(val < 1.5 for val in lidar_grid) if lidar_grid else False
        
        return {
            "path_blocked": blocked,
            "suggested_bearing": 90.0 if blocked else 0.0,
            "alternative_coordinates": [(21.5, 76.0)] if blocked else [],
            "timestamp": str(datetime.utcnow())
        }

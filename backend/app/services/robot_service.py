import logging
from typing import Dict, Any, Optional
from app.repositories.firestore_repository import FirestoreRepository

logger = logging.getLogger(__name__)

class RobotService:
    def __init__(self, repo: FirestoreRepository):
        self.repo = repo

    def get_status(self, robot_id: str) -> Optional[Dict[str, Any]]:
        status = self.repo.get_document("robots", robot_id)
        if not status:
            # Create default if missing
            default_status = {
                "robot_id": robot_id,
                "battery_level": 100,
                "connectivity": "online",
                "signal_strength": 98,
                "mode": "manual",
                "coordinates": {"x": 20.0, "y": 0.0, "z": 75.0, "lat": 34.0522, "lng": -118.2437},
                "heading": 0,
                "speed": 0.0,
                "sensors_live": {"temp": 22.0, "humidity": 50.0, "soil_moisture": 40.0, "obstacle_distance": 10.0, "light_level": 400, "methane": 0.05}
            }
            self.repo.set_document("robots", robot_id, default_status)
            return default_status
        return status

    def update_movement(self, robot_id: str, direction: str, target_speed: float) -> Dict[str, Any]:
        status = self.get_status(robot_id)
        
        # Calculate speed vectors
        new_speed = target_speed if direction != "stop" else 0.0
        new_heading = status.get("heading", 0)
        
        if direction == "left":
            new_heading = (new_heading - 15) % 360
        elif direction == "right":
            new_heading = (new_heading + 15) % 360
            
        coords = status.get("coordinates", {"x": 20.0, "y": 0.0, "z": 75.0, "lat": 34.0522, "lng": -118.2437})
        
        # Log action to activity_logs
        self.repo.add_document("activity_logs", {
            "type": "robot_move",
            "robot_id": robot_id,
            "details": f"Direction: {direction}, Speed: {new_speed} m/s, Heading: {new_heading}°",
            "timestamp": str(datetime.utcnow()) if 'datetime' in globals() else "2026-06-04T16:40:00Z"
        })

        update_data = {
            "speed": new_speed,
            "heading": new_heading,
            "coordinates": coords
        }
        self.repo.set_document("robots", robot_id, update_data)
        
        # Return merged
        return {**status, **update_data}

    def set_mode(self, robot_id: str, mode: str) -> Dict[str, Any]:
        self.repo.set_document("robots", robot_id, {"mode": mode})
        self.repo.add_document("activity_logs", {
            "type": "robot_mode",
            "robot_id": robot_id,
            "details": f"Swapped mode to {mode.upper()}",
            "timestamp": "2026-06-04T16:40:00Z"
        })
        return self.get_status(robot_id)

    def pan_camera(self, robot_id: str, angle: int) -> Dict[str, Any]:
        # pan
        self.repo.add_document("activity_logs", {
            "type": "camera_pan",
            "robot_id": robot_id,
            "details": f"Camera Pan set to {angle}°",
            "timestamp": "2026-06-04T16:40:00Z"
        })
        return {"robot_id": robot_id, "camera_pan": angle}

    def tilt_camera(self, robot_id: str, angle: int) -> Dict[str, Any]:
        # tilt
        self.repo.add_document("activity_logs", {
            "type": "camera_tilt",
            "robot_id": robot_id,
            "details": f"Camera Tilt set to {angle}°",
            "timestamp": "2026-06-04T16:40:00Z"
        })
        return {"robot_id": robot_id, "camera_tilt": angle}

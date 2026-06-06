from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class WaypointCreate(BaseModel):
    name: str
    x: float
    y: float
    z: float
    lat: float
    lng: float

class WaypointResponse(BaseModel):
    id: str
    name: str
    x: float
    y: float
    z: float
    lat: float
    lng: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StartNavigation(BaseModel):
    target_waypoint_id: str
    autonomous_override: Optional[bool] = True

class RoutePoint(BaseModel):
    x: float
    z: float

class NavigationHistoryResponse(BaseModel):
    id: str
    robot_id: str
    origin_name: str
    destination_name: str
    path: List[RoutePoint]
    duration_seconds: int
    success: bool
    timestamp: datetime

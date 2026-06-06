from pydantic import BaseModel, Field
from typing import Literal, Dict, Any

class RobotMove(BaseModel):
    direction: Literal["forward", "backward", "left", "right", "stop"]
    speed: float = Field(default=1.0, ge=0.0, le=5.0)

class CameraPan(BaseModel):
    angle: int = Field(..., ge=-170, le=170)

class CameraTilt(BaseModel):
    angle: int = Field(..., ge=-30, le=85)

class RobotMode(BaseModel):
    mode: Literal["manual", "autonomous", "agriculture", "navigation", "surveillance"]

class Coordinate(BaseModel):
    x: float
    y: float
    z: float
    lat: float
    lng: float

class RobotStatusResponse(BaseModel):
    robot_id: str
    battery_level: int
    connectivity: str
    signal_strength: int
    mode: str
    coordinates: Coordinate
    heading: int
    speed: float
    sensors_live: Dict[str, Any]

from pydantic import BaseModel, Field
from typing import List, Tuple
from datetime import datetime

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class DetectionResult(BaseModel):
    label: str
    confidence: float = Field(..., ge=0.0, le=100.0)
    box: BoundingBox

class PlantDiseaseResponse(BaseModel):
    detected: bool
    disease_type: str
    confidence: float
    remedy_suggestions: List[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ObjectDetectionResponse(BaseModel):
    target_count: int
    detections: List[DetectionResult]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class NavigationAnalysisRequest(BaseModel):
    lidar_grid: List[float]
    current_x: float
    current_z: float
    target_x: float
    target_z: float

class NavigationAnalysisResponse(BaseModel):
    path_blocked: bool
    suggested_bearing: float
    alternative_coordinates: List[Tuple[float, float]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

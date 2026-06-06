from pydantic import BaseModel, Field
from datetime import datetime

class SensorReading(BaseModel):
    temp: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Humidity percentage")
    soil_moisture: float = Field(..., description="Soil moisture percentage")
    obstacle_distance: float = Field(..., description="Lidar obstacle clearance in meters")
    light_level: int = Field(..., description="Light lux index")
    methane: float = Field(..., description="Methane gas concentration ppm")

class SensorLogCreate(BaseModel):
    robot_id: str
    reading: SensorReading
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SensorLogResponse(BaseModel):
    id: str
    robot_id: str
    reading: SensorReading
    timestamp: datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import random
import logging
from datetime import datetime
from app.core.websocket_manager import ws_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ws", tags=["Realtime Streaming WebSockets"])

# Mock frame broadcaster for real-time telemetry
@router.websocket("/telemetry")
async def websocket_telemetry_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    
    # State tracking for coordinates drift
    x = 20.0
    z = 75.0
    lat = 34.0522
    lng = -118.2437
    battery = 89
    
    try:
        while True:
            # Vibrate data slightly to simulate movement
            x += random.uniform(-0.2, 0.2)
            z += random.uniform(-0.2, 0.2)
            lat += random.uniform(-0.00001, 0.00001)
            lng += random.uniform(-0.00001, 0.00001)
            
            # Slow battery discharge simulation
            if random.random() < 0.05:
                battery = max(1, battery - 1)
                
            # Compile telemetry payload
            payload = {
                "timestamp": str(datetime.utcnow()),
                "battery_level": battery,
                "connectivity": "online",
                "signal_strength": random.randint(90, 99),
                "speed": round(random.uniform(0.0, 1.8), 2),
                "heading": random.randint(0, 359),
                "coordinates": {
                    "x": round(x, 2),
                    "y": 0.0,
                    "z": round(z, 2),
                    "lat": round(lat, 6),
                    "lng": round(lng, 6)
                },
                "sensors": {
                    "temp": round(random.uniform(22.0, 25.5), 1),
                    "humidity": round(random.uniform(50.0, 60.0), 1),
                    "soilMoisture": round(random.uniform(40.0, 45.0), 1),
                    "obstacleDistance": round(random.uniform(6.0, 12.0), 1),
                    "methane": round(random.uniform(0.05, 0.15), 2)
                },
                "detections": [
                    {
                        "id": "det-1",
                        "label": "WEED INTRUSION (CLASSIFIER)",
                        "confidence": round(random.uniform(85.0, 98.0), 1),
                        "box": [random.randint(10, 40), random.randint(10, 40), 20, 20],
                        "timestamp": datetime.utcnow().strftime("%H:%M:%S")
                    }
                ],
                "logs": [
                    {
                        "id": "log-1",
                        "text": f"Lidar range sweep clear at bearing: {random.randint(0, 360)}°",
                        "type": "info",
                        "timestamp": datetime.utcnow().strftime("%H:%M:%S")
                    }
                ]
            }
            
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(1.0)
            
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket telemetry streaming error: {e}")
        ws_manager.disconnect(websocket)

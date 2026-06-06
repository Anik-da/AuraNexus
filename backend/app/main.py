from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, robot, sensors, ai, navigation, streaming, esp32
import logging

# Configure system logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Scalable operations control gateway for AURA robotic platforms.",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set CORS middleware parameters
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router Modules
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(robot.router, prefix=settings.API_V1_STR)
app.include_router(sensors.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(navigation.router, prefix=settings.API_V1_STR)
app.include_router(streaming.router, prefix=settings.API_V1_STR)
app.include_router(esp32.router, prefix=settings.API_V1_STR)

@app.get("/", status_code=status.HTTP_200_OK, tags=["System Health"])
async def root_gateway():
    return {
        "status": "online",
        "gateway": "AURA NEXUS CORE API GATEWAY v2.4",
        "supported_protocols": ["HTTP/1.1", "WebSockets"],
        "telemetry_stream": "/api/v1/ws/telemetry"
    }

@app.get("/health", status_code=status.HTTP_200_OK, tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2026-06-04T16:41:00Z",
        "firmware_compatibility": "v2.0+"
    }

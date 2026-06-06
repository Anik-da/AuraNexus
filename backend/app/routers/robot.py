from fastapi import APIRouter, Depends, HTTPException, status
from app.models.robot import RobotMove, CameraPan, CameraTilt, RobotMode, RobotStatusResponse
from app.core.auth import get_current_user, RoleChecker, UserPayload
from app.services.robot_service import RobotService
from app.repositories.firestore_repository import FirestoreRepository

router = APIRouter(prefix="/robot", tags=["Robotics Core"])
repo = FirestoreRepository()
robot_service = RobotService(repo)

# Role check dependencies
ops_or_admin = RoleChecker(["field-ops", "super-admin"])

@router.post("/move", response_model=RobotStatusResponse)
async def move(cmd: RobotMove, current_user: UserPayload = Depends(ops_or_admin)):
    # Standard robot id default is AURA-1
    robot_id = "AURA-1"
    updated_state = robot_service.update_movement(robot_id, cmd.direction, cmd.speed)
    return RobotStatusResponse(**updated_state)

@router.post("/stop", response_model=RobotStatusResponse)
async def stop(current_user: UserPayload = Depends(ops_or_admin)):
    robot_id = "AURA-1"
    updated_state = robot_service.update_movement(robot_id, "stop", 0.0)
    return RobotStatusResponse(**updated_state)

@router.post("/camera/pan")
async def pan_camera(cmd: CameraPan, current_user: UserPayload = Depends(ops_or_admin)):
    robot_id = "AURA-1"
    res = robot_service.pan_camera(robot_id, cmd.angle)
    return res

@router.post("/camera/tilt")
async def tilt_camera(cmd: CameraTilt, current_user: UserPayload = Depends(ops_or_admin)):
    robot_id = "AURA-1"
    res = robot_service.tilt_camera(robot_id, cmd.angle)
    return res

@router.post("/mode", response_model=RobotStatusResponse)
async def set_mode(cmd: RobotMode, current_user: UserPayload = Depends(ops_or_admin)):
    robot_id = "AURA-1"
    updated_state = robot_service.set_mode(robot_id, cmd.mode)
    return RobotStatusResponse(**updated_state)

@router.get("/status", response_model=RobotStatusResponse)
async def get_status(robot_id: str = "AURA-1"):
    state = robot_service.get_status(robot_id)
    if not state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Robot {robot_id} status could not be recovered."
        )
    return RobotStatusResponse(**state)

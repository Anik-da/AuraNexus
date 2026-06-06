from fastapi import APIRouter, Depends, HTTPException, status
from app.models.navigation import WaypointCreate, WaypointResponse, StartNavigation, NavigationHistoryResponse
from app.core.auth import get_current_user, RoleChecker, UserPayload
from app.services.navigation_service import NavigationService
from app.repositories.firestore_repository import FirestoreRepository
from datetime import datetime

router = APIRouter(prefix="/navigation", tags=["SLAM Navigation"])
repo = FirestoreRepository()
nav_service = NavigationService(repo)
ops_or_admin = RoleChecker(["field-ops", "super-admin"])

@router.post("/location", response_model=WaypointResponse)
async def create_location(waypoint: WaypointCreate, current_user: UserPayload = Depends(ops_or_admin)):
    doc_id = nav_service.create_waypoint(
        name=waypoint.name,
        x=waypoint.x,
        y=waypoint.y,
        z=waypoint.z,
        lat=waypoint.lat,
        lng=waypoint.lng
    )
    return WaypointResponse(id=doc_id, **waypoint.model_dump())

@router.post("/start")
async def start_navigation(cmd: StartNavigation, current_user: UserPayload = Depends(ops_or_admin)):
    robot_id = "AURA-1"
    res = nav_service.start_route(robot_id, cmd.target_waypoint_id)
    if "error" in res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res["error"])
    return res

@router.post("/stop")
async def stop_navigation(current_user: UserPayload = Depends(ops_or_admin)):
    robot_id = "AURA-1"
    res = nav_service.stop_route(robot_id)
    return res

@router.get("/history", response_model=list[NavigationHistoryResponse])
async def get_navigation_history(limit: int = 50):
    routes = repo.list_documents("navigation_routes", limit=limit)
    res = []
    for r in routes:
        try:
            ts = r.get("timestamp")
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            res.append(NavigationHistoryResponse(
                id=r.get("id"),
                robot_id=r.get("robot_id", "AURA-1"),
                origin_name=r.get("origin_name", "Start Node"),
                destination_name=r.get("destination_name", "End Node"),
                path=r.get("path", []),
                duration_seconds=r.get("duration_seconds", 0),
                success=r.get("success", True),
                timestamp=ts or datetime.utcnow()
            ))
        except Exception:
            continue
    return res

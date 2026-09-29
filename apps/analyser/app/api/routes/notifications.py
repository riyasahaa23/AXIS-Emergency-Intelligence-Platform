from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.auth.dependencies import require_scope
from app.models.incident_actions import Notification
from app.notifications.service import list_notifications, mark_notification_read

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def actor(request: Request) -> str:
    context = getattr(request.state, "auth", None)
    return context.subject if context else "anonymous"


@router.get("", response_model=list[Notification], dependencies=[Depends(require_scope("read"))])
async def notifications(request: Request, unread_only: bool = Query(default=False)):
    return await list_notifications(request, actor(request), unread_only)


@router.post("/{notification_id}/read", response_model=Notification, dependencies=[Depends(require_scope("read"))])
async def mark_read(notification_id: str, request: Request):
    if not await mark_notification_read(request, notification_id, actor(request)):
        raise HTTPException(status_code=404, detail="Notification not found")
    items = await list_notifications(request, actor(request))
    for item in items:
        if item.id == notification_id:
            return item
    raise HTTPException(status_code=404, detail="Notification not found")

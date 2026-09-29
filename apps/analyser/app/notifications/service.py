from __future__ import annotations

from app.models.incident_actions import Notification
import logging


logger = logging.getLogger(__name__)


async def create_notification(request, notification: Notification) -> Notification:
    """Store an in-app notification and persist it when durable storage exists."""
    request.app.state.notifications.append(notification)
    engine = getattr(request.app.state, "database_engine", None)
    if engine is not None:
        from sqlalchemy import text

        async with engine.begin() as connection:
            await connection.execute(text("""INSERT INTO notifications
                (id, recipient, title, message, severity, incident_id, read, created_at)
                VALUES (:id, :recipient, :title, :message, :severity, :incident_id, :read, :created_at)"""), notification.model_dump(mode="python"))
    webhook_url = getattr(getattr(request.app.state, "settings", None), "notification_webhook_url", "")
    http_client = getattr(request.app.state, "http_client", None)
    if webhook_url and http_client is not None:
        try:
            response = await http_client.post(webhook_url, json=notification.model_dump(mode="json"), timeout=5.0)
            response.raise_for_status()
        except Exception as exc:  # noqa: BLE001 - external notification must not break incident writes
            logger.warning("Notification webhook delivery failed: %s", exc)
    return notification


async def list_notifications(request, recipient: str, unread_only: bool = False) -> list[Notification]:
    engine = getattr(request.app.state, "database_engine", None)
    if engine is None:
        items = [item for item in request.app.state.notifications if item.recipient in {recipient, "*"}]
        return [item for item in items if not unread_only or not item.read]
    from sqlalchemy import text

    condition = "AND read=false" if unread_only else ""
    async with engine.connect() as connection:
        rows = (await connection.execute(text(f"SELECT * FROM notifications WHERE recipient IN (:recipient, '*') {condition} ORDER BY created_at DESC LIMIT 200"), {"recipient": recipient})).mappings().all()
    return [Notification.model_validate(dict(row)) for row in rows]


async def mark_notification_read(request, notification_id: str, recipient: str) -> bool:
    engine = getattr(request.app.state, "database_engine", None)
    if engine is None:
        for item in request.app.state.notifications:
            if item.id == notification_id and item.recipient in {recipient, "*"}:
                item.read = True
                return True
        return False
    from sqlalchemy import text

    async with engine.begin() as connection:
        result = await connection.execute(text("UPDATE notifications SET read=true WHERE id=:id AND recipient IN (:recipient, '*')"), {"id": notification_id, "recipient": recipient})
    return result.rowcount > 0

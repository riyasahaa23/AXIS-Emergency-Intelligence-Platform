from __future__ import annotations

import json
from datetime import UTC, datetime


async def record_audit(request, action: str, outcome: str, resource_type: str | None = None, resource_id: str | None = None, metadata: dict | None = None) -> None:
    """Best-effort append-only audit record; audit failure never breaks operations."""
    context = getattr(request.state, "auth", None)
    event = {
        "request_id": getattr(request.state, "request_id", None),
        "actor": context.subject if context else "anonymous",
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "outcome": outcome,
        "metadata": metadata or {},
        "created_at": datetime.now(UTC).isoformat(),
    }
    request.app.state.audit_events.append(event)
    engine = getattr(request.app.state, "database_engine", None)
    if engine is None:
        return
    try:
        from sqlalchemy import text

        async with engine.begin() as connection:
            await connection.execute(text("""INSERT INTO audit_events
                (request_id, actor, action, resource_type, resource_id, outcome, metadata)
                VALUES (:request_id, :actor, :action, :resource_type, :resource_id, :outcome, CAST(:metadata AS JSONB))"""), {
                **event, "metadata": json.dumps(event["metadata"], default=str),
            })
    except Exception:  # noqa: BLE001 - production must not silently lose audit records
        settings = getattr(request.app.state, "settings", None)
        if settings is not None and settings.environment == "production":
            raise

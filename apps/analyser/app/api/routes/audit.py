import csv
import io

from fastapi import APIRouter, Depends, Query, Request, Response

from app.auth.dependencies import require_scope

router = APIRouter(prefix="/api/audit", tags=["audit"])


async def _events(request: Request, limit: int, action: str | None):
    engine = getattr(request.app.state, "database_engine", None)
    if engine is None:
        items = list(reversed(request.app.state.audit_events))
        if action:
            items = [item for item in items if item.get("action") == action]
        return items[:limit]
    from sqlalchemy import text

    condition = "AND action=:action" if action else ""
    async with engine.connect() as connection:
        rows = (await connection.execute(text(f"SELECT request_id, actor, action, resource_type, resource_id, outcome, metadata, created_at FROM audit_events WHERE 1=1 {condition} ORDER BY created_at DESC LIMIT :limit"), {"action": action, "limit": limit})).mappings().all()
    return [dict(row) for row in rows]


@router.get("", dependencies=[Depends(require_scope("read"))])
async def list_audit_events(request: Request, limit: int = Query(default=100, ge=1, le=1000), action: str | None = Query(default=None, max_length=100)):
    return {"events": await _events(request, limit, action)}


@router.get("/export", dependencies=[Depends(require_scope("read"))])
async def export_audit_events(request: Request, limit: int = Query(default=1000, ge=1, le=5000)):
    events = await _events(request, limit, None)
    output = io.StringIO()
    fields = ["request_id", "actor", "action", "resource_type", "resource_id", "outcome", "metadata", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    for event in events:
        writer.writerow({field: event.get(field, "") for field in fields})
    return Response(content=output.getvalue(), media_type="text/csv", headers={"content-disposition": "attachment; filename=axis-audit.csv"})

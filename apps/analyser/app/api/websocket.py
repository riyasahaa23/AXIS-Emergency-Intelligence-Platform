import asyncio
import json
import secrets
from urllib.parse import parse_qs

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["events"])


@router.websocket("/api/ws")
async def events_socket(websocket: WebSocket) -> None:
    settings = websocket.app.state.settings
    credential = websocket.headers.get("x-api-key") or _query_api_key(websocket)
    valid = any(
        credential and configured and secrets.compare_digest(credential, configured)
        for configured in (settings.api_key_readonly, settings.api_key_operator, settings.api_key_admin)
    )
    if settings.environment == "production" and not valid:
        await websocket.close(code=1008, reason="Authentication required")
        return
    if settings.environment == "development" and not settings.allow_anonymous_demo and not valid:
        await websocket.close(code=1008, reason="Authentication required")
        return
    limiter = getattr(websocket.app.state, "websocket_limiter", None)
    if limiter is not None:
        identity = websocket.client.host if websocket.client else "unknown"
        allowed, _ = limiter.allow(identity)
        if not allowed:
            await websocket.close(code=1013, reason="Connection rate limit exceeded")
            return
    await websocket.accept()
    publisher = websocket.app.state.events
    if settings.redis_url:
        await _redis_events(websocket, settings.redis_url)
        return
    subscriber = publisher.subscribe()
    try:
        while True:
            try:
                event = await asyncio.wait_for(subscriber.get(), timeout=30)
                await websocket.send_json(event.model_dump(mode="json"))
            except TimeoutError:
                await websocket.send_json({"event_type": "HEARTBEAT"})
    except WebSocketDisconnect:
        pass
    finally:
        publisher.unsubscribe(subscriber)


def _query_api_key(websocket: WebSocket) -> str | None:
    values = parse_qs(websocket.scope.get("query_string", b"").decode())
    return values.get("api_key", [None])[0]


async def _redis_events(websocket: WebSocket, redis_url: str) -> None:
    try:
        from redis.asyncio import Redis

        client = Redis.from_url(redis_url, decode_responses=True)
        last_id = "$"
        try:
            while True:
                records = await client.xread({"axis.events": last_id}, block=30_000, count=20)
                for _, messages in records:
                    for stream_id, fields in messages:
                        last_id = stream_id
                        event = fields.get("event")
                        if event:
                            await websocket.send_json(json.loads(event))
        finally:
            await client.aclose()
    except WebSocketDisconnect:
        return

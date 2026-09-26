import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["events"])


@router.websocket("/api/ws")
async def events_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    publisher = websocket.app.state.events
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

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class QueueMessage:
    stream_id: str
    job_id: str


class RedisJobQueue:
    """Redis Streams queue using a consumer group and explicit acknowledgements."""

    def __init__(self, redis_url: str, stream: str = "axis.jobs", group: str = "axis-workers", consumer: str = "axis-worker") -> None:
        self.redis_url = redis_url
        self.stream = stream
        self.group = group
        self.consumer = consumer
        self.client = None

    async def connect(self) -> None:
        try:
            from redis.asyncio import Redis
            from redis.exceptions import ResponseError
        except ImportError as exc:
            raise RuntimeError("Install the 'events' extra to use Redis Streams") from exc
        self.client = Redis.from_url(self.redis_url, decode_responses=True)
        await self.client.ping()
        try:
            await self.client.xgroup_create(self.stream, self.group, id="0", mkstream=True)
        except ResponseError as exc:
            if "BUSYGROUP" not in str(exc):
                raise

    async def publish(self, job_id: str) -> str:
        return await self.client.xadd(self.stream, {"job_id": job_id})

    async def consume(self, block_ms: int = 1_000) -> list[QueueMessage]:
        records = await self.client.xreadgroup(
            self.group,
            self.consumer,
            streams={self.stream: ">"},
            count=1,
            block=block_ms,
        )
        return [
            QueueMessage(stream_id=stream_id, job_id=fields["job_id"])
            for _, messages in records
            for stream_id, fields in messages
        ]

    async def recover_pending(self, min_idle_ms: int = 60_000) -> list[QueueMessage]:
        """Reclaim messages left pending by a worker that stopped unexpectedly."""
        result = await self.client.xautoclaim(
            self.stream, self.group, self.consumer,
            min_idle_time=min_idle_ms, start_id="0-0", count=10,
        )
        messages = result[1] if len(result) > 1 else []
        return [QueueMessage(stream_id=stream_id, job_id=fields["job_id"]) for stream_id, fields in messages]

    async def acknowledge(self, stream_id: str) -> None:
        await self.client.xack(self.stream, self.group, stream_id)

    async def dead_letter(self, job_id: str, error: str) -> None:
        await self.client.xadd(f"{self.stream}.dead", {"job_id": job_id, "error": error})

    async def publish_event(self, event_json: str) -> None:
        await self.client.xadd("axis.events", {"event": event_json})

    async def close(self) -> None:
        if self.client is not None:
            await self.client.aclose()

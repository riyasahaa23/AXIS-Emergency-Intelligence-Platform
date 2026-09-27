from __future__ import annotations

import asyncio
from uuid import uuid4

from app.ingestion.service import IngestionService
from app.jobs.queue import RedisJobQueue


class IngestionWorker:
    """Redis Streams worker with an in-memory development fallback."""

    def __init__(self, service: IngestionService, redis_url: str = "") -> None:
        self.service = service
        self.redis_url = redis_url
        self.redis_queue: RedisJobQueue | None = None
        self.local_queue: asyncio.Queue[str] = asyncio.Queue()
        self.worker_task: asyncio.Task[None] | None = None
        self.stopping = False
        self.attempts: dict[str, int] = {}

    async def start(self) -> None:
        if self.redis_url:
            try:
                candidate = RedisJobQueue(self.redis_url, stream="axis.ingestion.jobs", group="axis-ingestion-workers", consumer=f"axis-ingestion-{uuid4().hex[:8]}")
                await candidate.connect()
                self.redis_queue = candidate
            except Exception:  # noqa: BLE001 - optional Redis falls back to local execution
                self.redis_queue = None
        self.worker_task = asyncio.create_task(self._run())

    async def stop(self) -> None:
        self.stopping = True
        if self.worker_task is not None:
            try:
                await asyncio.wait_for(self.worker_task, timeout=30)
            except TimeoutError:
                self.worker_task.cancel()
                await asyncio.gather(self.worker_task, return_exceptions=True)
        if self.redis_queue is not None:
            await self.redis_queue.close()

    async def enqueue(self, source_id: str, request) -> str:
        run_id = await self.service.enqueue(source_id, request)
        if self.redis_queue is not None:
            await self.redis_queue.publish(run_id)
        else:
            await self.local_queue.put(run_id)
        return run_id

    async def _run(self) -> None:
        while not self.stopping:
            if self.redis_queue is not None:
                messages = await self.redis_queue.recover_pending()
                messages.extend(await self.redis_queue.consume())
                for message in messages:
                    try:
                        await self.service.process_run(message.job_id)
                    except Exception as exc:  # noqa: BLE001 - provider failures are retriable
                        await self._retry_or_dead_letter(message.job_id, str(exc))
                    finally:
                        if self.redis_queue is not None:
                            await self.redis_queue.acknowledge(message.stream_id)
                continue
            try:
                run_id = await asyncio.wait_for(self.local_queue.get(), timeout=1)
            except TimeoutError:
                continue
            try:
                await self.service.process_run(run_id)
            except Exception as exc:  # noqa: BLE001 - provider failures are retriable
                await self._retry_or_dead_letter(run_id, str(exc))
            finally:
                self.local_queue.task_done()

    async def _retry_or_dead_letter(self, run_id: str, error: str) -> None:
        attempt = self.attempts.get(run_id, 0) + 1
        self.attempts[run_id] = attempt
        if attempt < 3:
            await self.service._update_run(run_id, "queued", error=error)
            if self.redis_queue is not None:
                await self.redis_queue.publish(run_id)
            else:
                await self.local_queue.put(run_id)
        elif self.redis_queue is not None:
            await self.redis_queue.dead_letter(run_id, error)

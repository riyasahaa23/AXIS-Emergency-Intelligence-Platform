from __future__ import annotations

import time
from collections import defaultdict, deque


class SlidingWindowRateLimiter:
    """Small process-local limiter used as a safe fallback when Redis is absent."""

    def __init__(self, limit: int, window_seconds: int = 60) -> None:
        self.limit = max(1, limit)
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> tuple[bool, int]:
        now = time.monotonic()
        events = self._events[key]
        cutoff = now - self.window_seconds
        while events and events[0] <= cutoff:
            events.popleft()
        if len(events) >= self.limit:
            retry_after = max(1, int(self.window_seconds - (now - events[0])))
            return False, retry_after
        events.append(now)
        return True, 0

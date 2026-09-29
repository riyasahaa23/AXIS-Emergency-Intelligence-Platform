from __future__ import annotations

import time
from collections import Counter, defaultdict


class Metrics:
    """Small Prometheus text-format collector with no runtime dependency."""

    def __init__(self) -> None:
        self.requests: Counter[tuple[str, str, str]] = Counter()
        self.request_seconds: defaultdict[tuple[str, str], float] = defaultdict(float)

    def observe_request(self, method: str, path: str, status: int, elapsed: float) -> None:
        self.requests[(method, path, str(status))] += 1
        self.request_seconds[(method, path)] += elapsed

    def render(self) -> str:
        lines = [
            "# HELP axis_http_requests_total Total HTTP requests.",
            "# TYPE axis_http_requests_total counter",
        ]
        for (method, path, status), count in sorted(self.requests.items()):
            lines.append(f'axis_http_requests_total{{method="{method}",path="{path}",status="{status}"}} {count}')
        lines.extend([
            "# HELP axis_http_request_duration_seconds_total Cumulative HTTP request duration.",
            "# TYPE axis_http_request_duration_seconds_total counter",
        ])
        for (method, path), elapsed in sorted(self.request_seconds.items()):
            lines.append(f'axis_http_request_duration_seconds_total{{method="{method}",path="{path}"}} {elapsed:.6f}')
        return "\n".join(lines) + "\n"


async def instrument_request(request, call_next, metrics: Metrics):
    started = time.perf_counter()
    response = await call_next(request)
    metrics.observe_request(request.method, request.url.path, response.status_code, time.perf_counter() - started)
    return response

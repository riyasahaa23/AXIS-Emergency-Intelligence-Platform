"""Small dependency-free HTTP load probe for deployment smoke testing.

Example:
  uv run --directory apps/analyser python scripts/load_test.py \
    --url http://127.0.0.1:8000/health/live --requests 200 --concurrency 20
"""

from __future__ import annotations

import argparse
import asyncio
import statistics
import time

import httpx


async def run_probe(url: str, client: httpx.AsyncClient, semaphore: asyncio.Semaphore) -> tuple[int, float]:
    async with semaphore:
        started = time.perf_counter()
        try:
            response = await client.get(url)
            return response.status_code, (time.perf_counter() - started) * 1000
        except httpx.HTTPError:
            return 0, (time.perf_counter() - started) * 1000


async def main() -> int:
    parser = argparse.ArgumentParser(description="Run a bounded AXIS HTTP load probe")
    parser.add_argument("--url", default="http://127.0.0.1:8000/health/live")
    parser.add_argument("--requests", type=int, default=100)
    parser.add_argument("--concurrency", type=int, default=10)
    args = parser.parse_args()
    if args.requests < 1 or args.concurrency < 1:
        parser.error("--requests and --concurrency must be positive")

    semaphore = asyncio.Semaphore(args.concurrency)
    limits = httpx.Limits(max_connections=args.concurrency, max_keepalive_connections=args.concurrency)
    async with httpx.AsyncClient(timeout=10, limits=limits) as client:
        results = await asyncio.gather(
            *(run_probe(args.url, client, semaphore) for _ in range(args.requests))
        )

    statuses = [status for status, _ in results]
    latencies = sorted(latency for _, latency in results)
    p95_index = min(len(latencies) - 1, max(0, int(len(latencies) * 0.95) - 1))
    success_count = sum(200 <= status < 400 for status in statuses)
    print(f"url={args.url}")
    print(f"requests={len(results)} concurrency={args.concurrency}")
    print(f"successes={success_count} failures={len(results) - success_count}")
    print(f"latency_ms_avg={statistics.mean(latencies):.2f} latency_ms_p95={latencies[p95_index]:.2f}")
    print(f"status_counts={dict((status, statuses.count(status)) for status in sorted(set(statuses)))}")
    return 0 if success_count == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

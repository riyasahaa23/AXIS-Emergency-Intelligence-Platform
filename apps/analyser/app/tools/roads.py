from typing import Protocol


class RoadProvider(Protocol):
    async def nearby(self, location: str) -> list[dict[str, object]]:
        ...


class UnconfiguredRoadProvider:
    async def nearby(self, location: str) -> list[dict[str, object]]:
        return []

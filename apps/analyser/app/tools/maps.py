from typing import Protocol


class MapProvider(Protocol):
    async def locate(self, location: str) -> dict[str, object]:
        ...


class UnconfiguredMapProvider:
    async def locate(self, location: str) -> dict[str, object]:
        return {"location": location, "available": False, "reason": "No map provider configured"}

from typing import Protocol


class PopulationProvider(Protocol):
    async def estimate(self, location: str) -> int | None:
        ...


class UnconfiguredPopulationProvider:
    async def estimate(self, location: str) -> int | None:
        return None

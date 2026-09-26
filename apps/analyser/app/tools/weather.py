from typing import Protocol


class WeatherProvider(Protocol):
    async def current(self, location: str) -> dict[str, object]:
        ...


class UnconfiguredWeatherProvider:
    async def current(self, location: str) -> dict[str, object]:
        return {"location": location, "available": False, "reason": "No weather provider configured"}

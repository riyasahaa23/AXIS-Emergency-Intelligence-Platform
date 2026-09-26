from typing import Literal

from pydantic import BaseModel, Field


class UserIntent(BaseModel):
    intent: Literal["analyze", "scenario", "response", "unknown"]
    location: str | None = None
    incident_id: str | None = None
    command: str = Field(min_length=1)


def parse_command(command: str) -> UserIntent:
    normalized = command.strip()
    lowered = normalized.lower()
    intent: Literal["analyze", "scenario", "response", "unknown"] = "unknown"
    if "scenario" in lowered or "what if" in lowered:
        intent = "scenario"
    elif "response" in lowered or "evacuat" in lowered:
        intent = "response"
    elif "analy" in lowered or "assess" in lowered:
        intent = "analyze"
    return UserIntent(intent=intent, command=normalized)

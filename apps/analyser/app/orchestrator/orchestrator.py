from collections.abc import Callable
from typing import Any

from app.models.incident import Incident
from app.models.risk import RiskAssessment
from app.nlp.intent import UserIntent


class Orchestrator:
    """Routes structured intent to deterministic domain services."""

    def __init__(self, risk_engine) -> None:
        self.risk_engine = risk_engine
        self._tools: dict[str, Callable[..., Any]] = {
            "assess_risk": self.risk_engine.assess,
        }

    @property
    def tools(self) -> tuple[str, ...]:
        return tuple(sorted(self._tools))

    def register_tool(self, name: str, tool: Callable[..., Any]) -> None:
        if not name or not name.replace("_", "").isalnum():
            raise ValueError("Tool names must be non-empty snake_case identifiers")
        self._tools[name] = tool

    def invoke(self, name: str, **arguments: Any) -> Any:
        tool = self._tools.get(name)
        if tool is None:
            raise KeyError(f"Unregistered tool: {name}")
        return tool(**arguments)

    def analyze(self, intent: UserIntent, incident: Incident) -> RiskAssessment:
        if intent.intent not in {"analyze", "unknown"}:
            raise ValueError(f"Intent {intent.intent} is not an analysis request")
        return self.invoke("assess_risk", incident=incident)

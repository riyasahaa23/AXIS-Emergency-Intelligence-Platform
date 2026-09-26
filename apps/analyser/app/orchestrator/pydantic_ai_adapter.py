from app.core.errors import ExternalServiceUnavailable
from app.models.incident import Incident
from app.nlp.intent import UserIntent


class PydanticAIIntentProvider:
    """Optional structured-intent provider.

    The deterministic parser remains the default. PydanticAI can be enabled
    later without changing the orchestrator or domain service contracts.
    """

    def __init__(self, model: str) -> None:
        self.model = model

    async def parse(self, command: str, incident: Incident | None = None) -> UserIntent:
        try:
            from pydantic_ai import Agent  # type: ignore[import-not-found]
        except ImportError as exc:
            raise ExternalServiceUnavailable("Install the 'ai' extra to use PydanticAI") from exc

        agent = Agent(self.model, output_type=UserIntent)
        result = await agent.run(command)
        return result.output

from app.core.errors import ExternalServiceUnavailable


class OllamaProvider:
    """Optional Ollama boundary; deterministic services remain authoritative."""

    def __init__(self, base_url: str, model: str) -> None:
        self.base_url = base_url
        self.model = model

    async def generate(self, prompt: str) -> str:
        try:
            from ollama import AsyncClient  # type: ignore[import-not-found]
        except ImportError as exc:
            raise ExternalServiceUnavailable("Install the 'ai' extra to use Ollama") from exc
        client = AsyncClient(host=self.base_url)
        response = await client.generate(model=self.model, prompt=prompt)
        return response["response"]

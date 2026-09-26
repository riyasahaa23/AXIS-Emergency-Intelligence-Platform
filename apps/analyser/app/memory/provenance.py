from datetime import UTC, datetime
from typing import Any


def provenance(source: str, detail: str, **metadata: Any) -> dict[str, Any]:
    return {
        "source": source,
        "detail": detail,
        "recorded_at": datetime.now(UTC).isoformat(),
        "metadata": metadata,
    }

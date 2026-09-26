from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python scripts/tool.py <command> [args...]")

    project_root = Path(__file__).resolve().parents[1]
    bin_dir = project_root / (".venv/Scripts" if os.name == "nt" else ".venv/bin")
    command = bin_dir / sys.argv[1]
    if not command.exists():
        command = Path(sys.argv[1])
    return subprocess.call([str(command), *sys.argv[2:]], cwd=project_root)


if __name__ == "__main__":
    raise SystemExit(main())

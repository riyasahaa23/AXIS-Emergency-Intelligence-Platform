from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    os.chdir(project_root)
    raise SystemExit(subprocess.call([sys.executable, "-m", "alembic", "upgrade", "head", *sys.argv[1:]]))


if __name__ == "__main__":
    main()

from __future__ import annotations

import os
import socket
import sys
from pathlib import Path


def find_port(host: str, requested_port: int, explicit: bool) -> int:
    """Return an available port, preserving explicitly requested ports."""
    if explicit:
        return requested_port

    for port in range(requested_port, requested_port + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            if probe.connect_ex((host, port)) != 0:
                if port != requested_port:
                    print(
                        f"Port {requested_port} is in use; using available port {port}.",
                        flush=True,
                    )
                return port

    raise RuntimeError(f"No available port found between {requested_port} and {requested_port + 19}.")


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    venv_python = project_root / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    python = venv_python if venv_python.exists() else Path(sys.executable)
    host = os.environ.get("AXIS_HOST", "127.0.0.1")
    port_was_explicit = "AXIS_PORT" in os.environ
    requested_port = int(os.environ.get("AXIS_PORT", "8000"))
    port = find_port(host, requested_port, port_was_explicit)
    os.execv(
        str(python),
        [
            str(python),
            "-m",
            "uvicorn",
            "app.main:app",
            "--reload",
            "--host",
            host,
            "--port",
            str(port),
        ],
    )


if __name__ == "__main__":
    main()

"""Compatibility entrypoint for the modernized service.

The legacy production unit runs `gunicorn ... wsgi:app` from this directory.
Keeping this shim lets that shape continue to work when the repository root is
deployed with the new `src/` package.
"""

from pathlib import Path
import sys

repo_root = Path(__file__).resolve().parents[1]
src_root = repo_root / "src"
if str(src_root) not in sys.path:
    sys.path.insert(0, str(src_root))

from workplace_readiness_service import create_app

app = create_app()

if __name__ == "__main__":
    app.run()

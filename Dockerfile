FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

COPY apps/analyser/pyproject.toml apps/analyser/README.md ./
COPY apps/analyser/app ./app
COPY apps/analyser/migrations ./migrations
COPY apps/analyser/alembic.ini ./alembic.ini
COPY apps/analyser/scripts ./scripts

RUN pip install --no-cache-dir ".[database]" \
    && useradd --create-home --uid 10001 axis

USER axis
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health/live', timeout=3)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

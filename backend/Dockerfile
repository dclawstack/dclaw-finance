FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir -e ".[dev]"

COPY app/ ./app/

EXPOSE 8100

CMD ["uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "8100"]

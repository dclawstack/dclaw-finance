"""Tests for the TestSprite plugin integration."""
import pytest
from httpx import ASGITransport, AsyncClient
from fastapi import FastAPI

from app.api.v1.testsprite import router as testsprite_router


@pytest.fixture
async def client():
    app = FastAPI()
    app.include_router(testsprite_router, prefix="/api/v1")
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c


@pytest.mark.asyncio
async def test_testsprite_health_unconfigured(client: AsyncClient):
    """Health check should 503 when TESTSPRITE_API_KEY is not set."""
    resp = await client.get("/api/v1/testsprite/health")
    assert resp.status_code == 503
    assert "not configured" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_testsprite_generate_unconfigured(client: AsyncClient):
    """Generate should 503 when TESTSPRITE_API_KEY is not set."""
    resp = await client.post(
        "/api/v1/testsprite/generate",
        json={
            "url": "https://example.com",
            "description": "Test the login flow",
            "framework": "playwright",
        },
    )
    assert resp.status_code == 503


@pytest.mark.asyncio
async def test_testsprite_run_unconfigured(client: AsyncClient):
    """Run creation should 503 when TESTSPRITE_API_KEY is not set."""
    resp = await client.post(
        "/api/v1/testsprite/run",
        json={"url": "https://example.com"},
    )
    assert resp.status_code == 503


@pytest.mark.asyncio
async def test_testsprite_status_unconfigured(client: AsyncClient):
    """Status poll should 503 when TESTSPRITE_API_KEY is not set."""
    resp = await client.get("/api/v1/testsprite/status/run_123")
    assert resp.status_code == 503


@pytest.mark.asyncio
async def test_testsprite_runs_unconfigured(client: AsyncClient):
    """Runs list should 503 when TESTSPRITE_API_KEY is not set."""
    resp = await client.get("/api/v1/testsprite/runs")
    assert resp.status_code == 503


@pytest.mark.asyncio
async def test_testsprite_generate_validation(client: AsyncClient):
    """Generate should validate missing fields."""
    resp = await client.post("/api/v1/testsprite/generate", json={})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_testsprite_generate_invalid_framework(client: AsyncClient):
    """Generate should reject unsupported frameworks."""
    resp = await client.post(
        "/api/v1/testsprite/generate",
        json={
            "url": "https://example.com",
            "description": "test",
            "framework": "robot",
        },
    )
    assert resp.status_code == 422

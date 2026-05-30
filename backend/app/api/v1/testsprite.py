"""
TestSprite plugin router — AI-powered E2E testing integration.

Provides endpoints to:
  1. Generate tests from a URL + description
  2. Trigger test runs
  3. Poll run status / results
  4. List historical runs
"""
from __future__ import annotations
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, HttpUrl

from app.core.config import settings
from app.services.testsprite_client import TestSpriteClient, TestSpriteError

router = APIRouter(prefix="/testsprite", tags=["testsprite"])


def _require_key() -> None:
    if not settings.testsprite_api_key:
        raise HTTPException(
            status_code=503,
            detail="TestSprite is not configured. Set TESTSPRITE_API_KEY in .env.",
        )


# ── Request / Response schemas ──────────────────────────────────────────────

class GenerateTestsRequest(BaseModel):
    url: HttpUrl = Field(..., description="Target URL to test")
    description: str = Field(
        ..., min_length=1, max_length=2000,
        description="What should be tested (natural language)"
    )
    framework: str = Field(default="playwright", pattern="^(playwright|cypress|selenium)$")


class GenerateTestsResponse(BaseModel):
    success: bool
    data: dict[str, Any]


class CreateRunRequest(BaseModel):
    url: HttpUrl = Field(..., description="URL to run tests against")
    test_ids: list[str] | None = Field(default=None, description="Pre-generated test IDs")
    configurations: list[dict] | None = Field(
        default=None,
        description="Browser/device configs, e.g. [{'browser':'chromium','viewport':'1920x1080'}]"
    )


class CreateRunResponse(BaseModel):
    run_id: str
    status: str
    url: str


class RunStatusResponse(BaseModel):
    run_id: str
    status: str
    results: dict[str, Any] | None = None


class ListRunsResponse(BaseModel):
    runs: list[dict[str, Any]]
    total: int


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/generate", response_model=GenerateTestsResponse)
async def generate_tests(payload: GenerateTestsRequest) -> GenerateTestsResponse:
    """
    Use TestSprite AI to generate test scenarios from a URL and description.
    """
    _require_key()
    client = TestSpriteClient()
    try:
        data = await client.generate_tests(
            url=str(payload.url),
            description=payload.description,
            framework=payload.framework,
        )
    except TestSpriteError as exc:
        raise HTTPException(status_code=exc.status_code or 502, detail=str(exc.detail))
    return GenerateTestsResponse(success=True, data=data)


@router.post("/run", response_model=CreateRunResponse)
async def create_run(payload: CreateRunRequest) -> CreateRunResponse:
    """
    Start a new test run on TestSprite infrastructure.
    """
    _require_key()
    client = TestSpriteClient()
    try:
        data = await client.create_run(
            url=str(payload.url),
            test_ids=payload.test_ids,
            configurations=payload.configurations,
        )
    except TestSpriteError as exc:
        raise HTTPException(status_code=exc.status_code or 502, detail=str(exc.detail))

    return CreateRunResponse(
        run_id=data.get("run_id") or data.get("id", ""),
        status=data.get("status", "queued"),
        url=str(payload.url),
    )


@router.get("/status/{run_id}", response_model=RunStatusResponse)
async def get_run_status(run_id: str) -> RunStatusResponse:
    """
    Poll the status of a running or completed test run.
    """
    _require_key()
    client = TestSpriteClient()
    try:
        data = await client.get_run(run_id)
    except TestSpriteError as exc:
        raise HTTPException(status_code=exc.status_code or 502, detail=str(exc.detail))

    return RunStatusResponse(
        run_id=run_id,
        status=data.get("status", "unknown"),
        results=data.get("results"),
    )


@router.get("/runs", response_model=ListRunsResponse)
async def list_runs(limit: int = 20, offset: int = 0) -> ListRunsResponse:
    """
    List recent TestSprite test runs.
    """
    _require_key()
    client = TestSpriteClient()
    try:
        data = await client.list_runs(limit=limit, offset=offset)
    except TestSpriteError as exc:
        raise HTTPException(status_code=exc.status_code or 502, detail=str(exc.detail))

    runs = data.get("runs") or data.get("items") or data.get("data", [])
    total = data.get("total") or len(runs)
    return ListRunsResponse(runs=runs, total=total)


@router.get("/health")
async def health_check() -> dict[str, Any]:
    """
    Verify that the TestSprite API key is valid and the service is reachable.
    """
    _require_key()
    client = TestSpriteClient()
    try:
        result = await client.validate_connection()
    except TestSpriteError as exc:
        raise HTTPException(status_code=exc.status_code or 502, detail=str(exc.detail))
    return {"connected": True, "detail": result}

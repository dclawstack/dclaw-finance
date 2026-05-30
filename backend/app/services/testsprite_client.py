"""
Async client for the TestSprite AI testing platform.

TestSprite is an AI-driven E2E testing service that generates and runs
visual + functional tests from natural-language descriptions and URLs.

Docs: https://www.testsprite.com/dashboard
"""
from __future__ import annotations

from typing import Any
import httpx

from app.core.config import settings


class TestSpriteError(Exception):
    """Raised when TestSprite returns a non-2xx response."""

    def __init__(self, message: str, status_code: int = 0, detail: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.detail = detail


class TestSpriteClient:
    """Thin async wrapper around the TestSprite REST API."""

    def __init__(self, api_key: str | None = None, base_url: str | None = None):
        self._api_key = api_key or settings.testsprite_api_key
        self._base = (base_url or settings.testsprite_base_url).rstrip("/")
        self._headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=self._base,
            headers=self._headers,
            timeout=httpx.Timeout(60.0, connect=10.0),
        )

    async def _request(
        self, method: str, path: str, json: dict | None = None
    ) -> dict[str, Any]:
        async with self._client() as c:
            resp = await c.request(method, path, json=json)
        if resp.status_code >= 400:
            try:
                detail = resp.json()
            except Exception:
                detail = resp.text
            raise TestSpriteError(
                f"TestSprite API error {resp.status_code}: {detail}",
                status_code=resp.status_code,
                detail=detail,
            )
        return resp.json() if resp.content else {}

    # ── Core endpoints (mapping to TestSprite v1 API) ─────────────────────────

    async def generate_tests(
        self, url: str, description: str, framework: str = "playwright"
    ) -> dict[str, Any]:
        """
        Ask TestSprite AI to generate test scenarios for a web page.

        Args:
            url: The target URL to test.
            description: Natural-language description of what to test.
            framework: Target test framework (playwright, cypress, selenium).
        """
        return await self._request(
            "POST",
            "/v1/tests/generate",
            json={
                "url": url,
                "description": description,
                "framework": framework,
            },
        )

    async def create_run(
        self,
        url: str,
        test_ids: list[str] | None = None,
        configurations: list[dict] | None = None,
    ) -> dict[str, Any]:
        """
        Trigger a test run on TestSprite infrastructure.

        Args:
            url: The URL to run tests against.
            test_ids: Optional list of previously-generated test IDs.
            configurations: Browser / device configurations.
        """
        payload: dict[str, Any] = {"url": url}
        if test_ids:
            payload["test_ids"] = test_ids
        if configurations:
            payload["configurations"] = configurations
        return await self._request("POST", "/v1/runs", json=payload)

    async def get_run(self, run_id: str) -> dict[str, Any]:
        """Fetch the status and results of a test run."""
        return await self._request("GET", f"/v1/runs/{run_id}")

    async def list_runs(
        self, limit: int = 20, offset: int = 0
    ) -> dict[str, Any]:
        """List recent test runs."""
        return await self._request(
            "GET",
            f"/v1/runs?limit={limit}&offset={offset}",
        )

    async def validate_connection(self) -> dict[str, Any]:
        """
        Lightweight health-check to verify the API key works.
        Falls back to a generic 200 probe if the dedicated endpoint
        is not available.
        """
        try:
            return await self._request("GET", "/v1/health")
        except TestSpriteError as exc:
            # Some accounts don't expose /v1/health; try /v1/runs as a probe
            if exc.status_code == 404:
                return await self._request("GET", "/v1/runs?limit=1")
            raise


# Convenience singleton
testsprite = TestSpriteClient()

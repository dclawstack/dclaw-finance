from typing import Optional
from functools import lru_cache

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

_bearer = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _fetch_jwks() -> dict:
    """Download JWKS from Logto once per process and cache it."""
    url = f"{settings.logto_endpoint.rstrip('/')}/oidc/jwks"
    with httpx.Client(timeout=10) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.json()


async def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    """
    JWT validation dependency.
    - When LOGTO_ENDPOINT is not configured: passes through (dev/test mode).
    - When configured: validates Bearer JWT via Logto JWKS.
    """
    if not settings.logto_endpoint:
        return {}  # dev mode — no auth required

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        jwks = _fetch_jwks()
        audience = settings.logto_resource or settings.logto_endpoint
        payload = jwt.decode(
            credentials.credentials,
            jwks,
            algorithms=["RS256"],
            audience=audience,
        )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

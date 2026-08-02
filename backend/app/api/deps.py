import logging
import uuid
from dataclasses import dataclass
from functools import lru_cache

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


@dataclass
class AuthUser:
    id: uuid.UUID
    email: str


@lru_cache
def _get_jwks_client() -> PyJWKClient:
    jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    return PyJWKClient(jwks_url)


@lru_cache
def _get_http_client() -> httpx.Client:
    return httpx.Client(timeout=10.0)


def _decode_token_locally(token: str) -> dict:
    """Verify JWT locally via JWKS (ES256) or legacy HS256 secret."""
    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as jwks_error:
        logger.debug("JWKS verification failed: %s", jwks_error)
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )


def _verify_token_with_supabase(token: str) -> AuthUser:
    """Ask Supabase to validate the token — works for all signing key types."""
    response = _get_http_client().get(
        f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": settings.supabase_anon_key,
        },
    )

    if response.status_code != 200:
        logger.warning(
            "Supabase token verification failed (%s): %s",
            response.status_code,
            response.text,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    data = response.json()
    user_id = data.get("id")
    email = data.get("email")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return AuthUser(id=uuid.UUID(user_id), email=email)


def _extract_email(payload: dict) -> str | None:
    email = payload.get("email")
    if email:
        return email

    user_metadata = payload.get("user_metadata")
    if isinstance(user_metadata, dict):
        return user_metadata.get("email")

    return None


def _user_from_payload(payload: dict) -> AuthUser:
    user_id = payload.get("sub")
    email = _extract_email(payload)

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return AuthUser(id=uuid.UUID(user_id), email=email)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = credentials.credentials

    # 1. Fast local JWKS verification (ES256)
    try:
        payload = _decode_token_locally(token)
        return _user_from_payload(payload)
    except jwt.PyJWTError as local_error:
        logger.info("Local JWT verification failed, trying Supabase API: %s", local_error)

    # 2. Supabase API verification
    try:
        return _verify_token_with_supabase(token)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Supabase API verification error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc

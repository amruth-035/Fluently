import logging
import uuid

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class StorageUploadError(Exception):
    """Raised when Supabase Storage upload fails."""


def build_audio_path(user_id: uuid.UUID, session_id: uuid.UUID, extension: str) -> str:
    safe_ext = extension if extension.startswith(".") else f".{extension}"
    return f"{user_id}/{session_id}{safe_ext}"


def upload_session_audio(
    user_id: uuid.UUID,
    session_id: uuid.UUID,
    audio_bytes: bytes,
    content_type: str,
    extension: str,
) -> str:
    """Upload audio to Supabase Storage and return the object path."""
    path = build_audio_path(user_id, session_id, extension)
    bucket = settings.supabase_storage_bucket
    url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/{bucket}/{path}"

    headers = {
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "apikey": settings.supabase_service_key,
        "Content-Type": content_type or "application/octet-stream",
        "x-upsert": "true",
    }

    logger.info("Uploading audio to %s/%s", bucket, path)
    response = httpx.post(url, content=audio_bytes, headers=headers, timeout=60.0)

    if response.status_code not in (200, 201):
        logger.error("Storage upload failed (%s): %s", response.status_code, response.text)
        raise StorageUploadError(f"Storage upload failed: {response.status_code}")

    logger.info("Audio uploaded to %s", path)
    return path

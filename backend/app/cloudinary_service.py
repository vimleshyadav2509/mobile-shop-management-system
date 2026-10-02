import os
import uuid
import re
import logging
from typing import Dict, Any, Optional
import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import HTTPException, status
from app.config import (
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    IS_PRODUCTION,
    PRODUCT_UPLOAD_DIR
)

logger = logging.getLogger(__name__)

# Allowed MIME types and extensions
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB strict limit

# Configure Cloudinary if credentials provided
if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True
    )
    logger.info("[CLOUDINARY] Cloudinary initialized successfully.")


def is_cloudinary_configured() -> bool:
    """Check if valid Cloudinary credentials are provided in environment variables."""
    return bool(
        CLOUDINARY_CLOUD_NAME
        and CLOUDINARY_API_KEY
        and CLOUDINARY_API_SECRET
        and CLOUDINARY_CLOUD_NAME != "CHANGE_ME"
    )


def is_valid_image_bytes(data: bytes) -> bool:
    """Validate image magic bytes (header signatures)."""
    if len(data) < 12:
        return False
    # JPEG magic bytes: FF D8 FF
    if data[:3] == b"\xff\xd8\xff":
        return True
    # PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    # WebP magic bytes: RIFF....WEBP
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True
    return False


def extract_cloudinary_public_id(url_or_id: str) -> Optional[str]:
    """
    Extract the Cloudinary public_id from a Cloudinary URL or return the public_id as-is.
    Example:
    https://res.cloudinary.com/demo/image/upload/v12345/amit_mobile_shop/products/sample.jpg
    -> amit_mobile_shop/products/sample
    """
    if not url_or_id or not isinstance(url_or_id, str):
        return None
    url = url_or_id.strip()

    # Local paths or uploads paths are not Cloudinary assets
    if "/static/uploads" in url or url.startswith("/"):
        return None

    if not url.startswith("http://") and not url.startswith("https://"):
        # Already a public_id
        return url

    # Parse Cloudinary URL
    # Format: https://res.cloudinary.com/<cloud_name>/image/upload/(v<version>/)?<public_id>.<ext>
    match = re.search(r"/image/upload/(?:v\d+/)?(.+?)(?:\.[a-zA-Z0-9]+)?$", url)
    if match:
        return match.group(1)
    return None


def upload_product_image_data(
    contents: bytes,
    filename: Optional[str] = None,
    content_type: Optional[str] = None,
    folder: str = "amit_mobile_shop/products"
) -> Dict[str, Any]:
    """
    Validate and upload product image.
    In Production or when Cloudinary is configured: Uploads to Cloudinary and returns secure URL.
    In Local Development (if no Cloudinary credentials): Falls back to local disk storage.
    """
    # 1. Validate File Size
    if not contents or len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty."
        )
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file size exceeds maximum limit of 5MB."
        )

    # 2. Validate MIME Type & Extension
    if content_type and content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format '{content_type}'. Please upload JPEG, PNG, or WebP images."
        )

    if filename:
        _, file_ext = os.path.splitext(filename)
        if file_ext and file_ext.lower() not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension '{file_ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
            )

    # 3. Validate Magic Bytes
    if not is_valid_image_bytes(contents):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image data. File header does not match a valid image format."
        )

    # 4. Upload to Cloudinary if configured
    if is_cloudinary_configured():
        try:
            unique_name = f"prod_{uuid.uuid4().hex}"
            result = cloudinary.uploader.upload(
                contents,
                folder=folder,
                public_id=unique_name,
                resource_type="image",
                overwrite=True
            )
            secure_url = result.get("secure_url")
            public_id = result.get("public_id")
            return {
                "success": True,
                "url": secure_url,
                "public_id": public_id,
                "storage": "cloudinary",
                "size_bytes": len(contents),
                "format": result.get("format")
            }
        except Exception as e:
            logger.error(f"[CLOUDINARY] Upload error: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Cloudinary image upload failed: {str(e)}"
            )

    # 5. Fail if in production without Cloudinary
    if IS_PRODUCTION:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are required in production."
        )

    # 6. Local Development Fallback ONLY
    ext_map = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    }
    ext = ext_map.get(content_type, ".jpg")
    safe_filename = f"prod_{uuid.uuid4().hex}{ext}"
    os.makedirs(PRODUCT_UPLOAD_DIR, exist_ok=True)
    dest_path = os.path.join(PRODUCT_UPLOAD_DIR, safe_filename)

    with open(dest_path, "wb") as f:
        f.write(contents)

    relative_url = f"/static/uploads/products/{safe_filename}"
    return {
        "success": True,
        "url": relative_url,
        "public_id": safe_filename,
        "storage": "local_dev",
        "size_bytes": len(contents),
        "filename": safe_filename
    }


def delete_product_image_asset(image_url_or_id: str) -> bool:
    """
    Safely delete product image asset.
    Handles Cloudinary assets as well as local legacy uploaded files.
    Never throws an unhandled exception or breaks product CRUD.
    """
    if not image_url_or_id or not isinstance(image_url_or_id, str):
        return False

    target = image_url_or_id.strip()

    # Cloudinary asset deletion
    if "cloudinary.com" in target or (is_cloudinary_configured() and not target.startswith("/")):
        public_id = extract_cloudinary_public_id(target)
        if public_id:
            try:
                res = cloudinary.uploader.destroy(public_id, invalidate=True)
                logger.info(f"[CLOUDINARY] Destroy asset '{public_id}': {res}")
                return True
            except Exception as e:
                logger.warning(f"[CLOUDINARY] Failed to destroy asset '{public_id}': {e}")
                return False

    # Local file deletion fallback
    if target.startswith("/static/uploads/") or target.startswith("static/uploads/"):
        filename = os.path.basename(target)
        local_path = os.path.join(PRODUCT_UPLOAD_DIR, filename)
        try:
            if os.path.isfile(local_path):
                os.remove(local_path)
                logger.info(f"[LOCAL_IMAGE] Removed local image: {local_path}")
                return True
        except Exception as e:
            logger.warning(f"[LOCAL_IMAGE] Could not remove {local_path}: {e}")
            return False

    return False

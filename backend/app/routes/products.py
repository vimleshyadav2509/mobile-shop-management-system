import os
import uuid
from fastapi import APIRouter, Query, HTTPException, Depends, status, UploadFile, File
from typing import List, Optional, Dict, Any
from app.models import Product, ProductCreate, ProductUpdate, ProductDeleteResponse
from app.database import (
    fetch_all_products,
    fetch_product_by_id,
    create_product,
    update_product,
    delete_product,
    is_image_url_in_use
)
from app.dependencies import get_current_admin
from app.config import PRODUCT_UPLOAD_DIR

router = APIRouter(prefix="/api/products", tags=["Products"])

# Configurable static product upload directory (supports persistent volumes)
UPLOAD_DIR = PRODUCT_UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Allowed image MIME types, extensions and max size (5MB)
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024


def _is_valid_image_bytes(contents: bytes) -> bool:
    """Validate minimum byte length and image file magic numbers."""
    if len(contents) < 12:
        return False
    # JPEG signature: FF D8 FF
    if contents.startswith(b"\xff\xd8\xff"):
        return True
    # PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if contents.startswith(b"\x89PNG\r\n\x1a\n"):
        return True
    # GIF signature: GIF87a or GIF89a
    if contents.startswith(b"GIF87a") or contents.startswith(b"GIF89a"):
        return True
    # WebP signature: RIFF....WEBP
    if contents.startswith(b"RIFF") and contents[8:12] == b"WEBP":
        return True
    return False


def _safe_remove_local_product_image(image_url: Optional[str], exclude_product_id: Optional[str] = None) -> bool:
    """
    Safely remove a locally stored product image from backend/static/uploads/products/.
    Never deletes external URLs (e.g. Unsplash, HTTP/HTTPS) or paths outside UPLOAD_DIR.
    Protects against path traversal attacks.
    Skips deletion if another active product record is referencing the same image URL.
    """
    if not image_url or not isinstance(image_url, str):
        return False

    clean_url = image_url.strip().split("?")[0].split("#")[0]
    prefix = "/static/uploads/products/"
    if prefix in clean_url:
        idx = clean_url.find(prefix)
        filename = clean_url[idx + len(prefix):]
    elif clean_url.startswith("static/uploads/products/"):
        filename = clean_url[len("static/uploads/products/"):]
    else:
        return False

    filename = os.path.basename(filename)
    if not filename or filename in (".", ".."):
        return False

    # Check if another product is still referencing this image URL
    if is_image_url_in_use(image_url, exclude_product_id=exclude_product_id):
        print(f"[IMAGE CLEANUP] Retaining {filename} as it is referenced by another product.")
        return False

    upload_dir_abs = os.path.abspath(UPLOAD_DIR)
    full_path = os.path.abspath(os.path.join(upload_dir_abs, filename))

    # Path traversal safeguard: verify destination is directly inside upload_dir_abs
    if os.path.dirname(full_path) != upload_dir_abs:
        return False
    if not full_path.startswith(upload_dir_abs + os.sep):
        return False

    if os.path.isfile(full_path):
        try:
            os.remove(full_path)
            return True
        except Exception as e:
            print(f"[IMAGE CLEANUP] Warning: failed to remove {full_path}: {e}")
            return False

    return False


@router.get("", response_model=List[Product])
def get_products(
    condition: Optional[str] = Query(None, description="'new' or 'refurbished' / 'second_hand'"),
    brand: Optional[str] = Query(None, description="Filter by brand: Samsung, Apple, Vivo, etc."),
    category: Optional[str] = Query(None, description="Filter by category e.g. Smartphones"),
    search: Optional[str] = Query(None, description="Search by title, brand, or model"),
    include_out_of_stock: bool = Query(False, description="Set True for admin panel to see full inventory")
):
    """
    Public catalogue endpoint. By default returns only in-stock items.
    Pass include_out_of_stock=true to retrieve all inventory items for management.
    """
    try:
        products = fetch_all_products(
            condition=condition,
            brand=brand,
            category=category,
            search=search,
            include_out_of_stock=include_out_of_stock
        )
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str):
    """
    Retrieve single product details by ID.
    """
    product = fetch_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' was not found in catalogue."
        )
    return product


@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
def add_product(
    payload: ProductCreate,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Create and register a new product in the store database.
    Requires verified admin JWT token.
    """
    try:
        created = create_product(payload.model_dump())
        if not created:
            raise HTTPException(status_code=500, detail="Failed to persist product to database.")
        return created
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error during product creation: {str(e)}")


@router.put("/{product_id}", response_model=Product)
def full_update_product(
    product_id: str,
    payload: ProductUpdate,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Update product details.
    Requires verified admin JWT token.
    Cleans up old locally uploaded image if replaced.
    """
    existing = fetch_product_by_id(product_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' was not found to update."
        )
    
    update_data = payload.model_dump(exclude_unset=True)
    old_image_url = existing.get("image_url")
    new_image_url = update_data.get("image_url")

    updated = update_product(product_id, update_data)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update product in database.")

    # Safe orphan cleanup: only remove previous image file if replacement succeeded and URL changed
    if new_image_url and old_image_url and new_image_url != old_image_url:
        _safe_remove_local_product_image(old_image_url, exclude_product_id=product_id)

    return updated


@router.patch("/{product_id}", response_model=Product)
def partial_update_product(
    product_id: str,
    payload: ProductUpdate,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Quick partial update (price change, stock toggle, etc.).
    Requires verified admin JWT token.
    Cleans up old locally uploaded image if replaced.
    """
    existing = fetch_product_by_id(product_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' was not found to update."
        )
    
    update_data = payload.model_dump(exclude_unset=True)
    old_image_url = existing.get("image_url")
    new_image_url = update_data.get("image_url")

    updated = update_product(product_id, update_data)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update product in database.")

    # Safe orphan cleanup: only remove previous image file if replacement succeeded and URL changed
    if new_image_url and old_image_url and new_image_url != old_image_url:
        _safe_remove_local_product_image(old_image_url, exclude_product_id=product_id)

    return updated


@router.delete("/{product_id}", response_model=ProductDeleteResponse)
def remove_product(
    product_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Delete product from store database.
    Requires verified admin JWT token.
    Safely removes local image file upon deletion.
    """
    existing = fetch_product_by_id(product_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' does not exist or has already been deleted."
        )
        
    old_image_url = existing.get("image_url")
    success = delete_product(product_id)
    if not success:
        raise HTTPException(status_code=500, detail="Database error during product deletion.")
        
    # Safe orphan cleanup: remove local image if deletion from DB succeeded
    if old_image_url:
        _safe_remove_local_product_image(old_image_url, exclude_product_id=product_id)

    return ProductDeleteResponse(
        success=True,
        message=f"Product '{existing.get('title', product_id)}' deleted successfully.",
        id=product_id
    )


@router.delete("/{product_id}/image", response_model=Product)
def remove_product_image(
    product_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Delete an individual product's image and unlink the file.
    Requires verified admin JWT token.
    """
    existing = fetch_product_by_id(product_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' does not exist."
        )
    old_image_url = existing.get("image_url")
    updated = update_product(product_id, {"image_url": None})
    if old_image_url:
        _safe_remove_local_product_image(old_image_url, exclude_product_id=product_id)
    return updated


@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Upload product photograph directly from counter camera/storage.
    Validates MIME type, file extension, magic bytes, and size <= 5MB.
    Saves safely with UUID to /static/uploads/products/.
    """
    # 1. Validate Content-Type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format '{file.content_type}'. Please upload JPEG, PNG, or WebP images."
        )

    # 2. Validate File Extension if filename is provided
    if file.filename:
        _, file_ext = os.path.splitext(file.filename)
        if file_ext.lower() not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension '{file_ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
            )

    contents = await file.read()

    # 3. Validate Minimum Size & Maximum Size (5MB)
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty."
        )
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file size exceeds maximum limit of 5MB."
        )

    # 4. Validate Image Magic Bytes (Header Signature)
    if not _is_valid_image_bytes(contents):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image data. File header does not match a valid image format."
        )

    # Determine safe file extension
    ext_map = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif"
    }
    ext = ext_map.get(file.content_type, ".jpg")
    safe_filename = f"prod_{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(dest_path, "wb") as f:
        f.write(contents)

    relative_url = f"/static/uploads/products/{safe_filename}"
    return {
        "success": True,
        "url": relative_url,
        "filename": safe_filename,
        "size_bytes": len(contents)
    }


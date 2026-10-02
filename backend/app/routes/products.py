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
from app.cloudinary_service import (
    upload_product_image_data,
    delete_product_image_asset,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE
)

router = APIRouter(prefix="/api/products", tags=["Products"])

# Configurable static product upload directory (supports local dev fallback)
UPLOAD_DIR = PRODUCT_UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _safe_remove_product_image(image_url: Optional[str], exclude_product_id: Optional[str] = None) -> bool:
    """
    Safely remove a product image from Cloudinary or local storage.
    Protects against deleting external Unsplash images or shared images.
    Skips deletion if another active product record is referencing the same image URL.
    """
    if not image_url or not isinstance(image_url, str):
        return False

    # Check if another product is still referencing this image URL
    if is_image_url_in_use(image_url, exclude_product_id=exclude_product_id):
        print(f"[IMAGE CLEANUP] Retaining {image_url} as it is referenced by another product.")
        return False

    return delete_product_image_asset(image_url)


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
        _safe_remove_product_image(old_image_url, exclude_product_id=product_id)

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
    Cleans up old image if replaced.
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
        _safe_remove_product_image(old_image_url, exclude_product_id=product_id)

    return updated


@router.delete("/{product_id}", response_model=ProductDeleteResponse)
def remove_product(
    product_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Delete product from store database.
    Requires verified admin JWT token.
    Safely removes image asset upon deletion.
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
        
    # Safe orphan cleanup: remove image if deletion from DB succeeded
    if old_image_url:
        _safe_remove_product_image(old_image_url, exclude_product_id=product_id)

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
        _safe_remove_product_image(old_image_url, exclude_product_id=product_id)
    return updated


@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Upload product photograph.
    Validates MIME type, file extension, magic bytes, and size <= 5MB.
    Uploads directly to Cloudinary (production) or local dev fallback.
    """
    contents = await file.read()
    result = upload_product_image_data(
        contents=contents,
        filename=file.filename,
        content_type=file.content_type
    )
    return {
        "success": True,
        "url": result["url"],
        "filename": result.get("filename") or result.get("public_id"),
        "public_id": result.get("public_id"),
        "storage": result.get("storage"),
        "size_bytes": result.get("size_bytes", len(contents))
    }



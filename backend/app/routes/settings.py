from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from app.models import ShopSettings, ShopSettingsUpdate
from app.database import fetch_shop_settings, update_shop_settings
from app.dependencies import get_current_admin

router = APIRouter(prefix="/api/settings", tags=["Shop Settings"])

@router.get("", response_model=ShopSettings)
def get_store_settings():
    """
    Public storefront & Admin endpoint: Fetch current Amit Mobile Shop contact & operation details.
    """
    try:
        return fetch_shop_settings()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve shop settings."
        )

@router.put("", response_model=ShopSettings)
def modify_store_settings(
    settings_in: ShopSettingsUpdate,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Update Amit Mobile Shop store hours, address, phone numbers, WhatsApp, etc.
    Requires valid admin JWT token.
    """
    try:
        data = settings_in.model_dump(exclude_unset=True) if hasattr(settings_in, 'model_dump') else settings_in.dict(exclude_unset=True)
        return update_shop_settings(data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update shop settings."
        )

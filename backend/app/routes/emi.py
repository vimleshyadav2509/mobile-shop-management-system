from fastapi import APIRouter, HTTPException, Path, Query, Depends, status
from typing import Dict, Any, List, Optional
from app.models import EmiPlan, EmiPlanCreate, EmiPlanUpdate, MessageResponse
from app.database import (
    fetch_all_emi_plans,
    fetch_emi_plan_by_id,
    create_emi_plan,
    update_emi_plan,
    delete_emi_plan
)
from app.dependencies import get_current_admin

router = APIRouter(prefix="/api/emi", tags=["EMI Management"])

@router.get("", response_model=List[EmiPlan])
def list_emi_plans(
    product_id: Optional[str] = Query(None, description="Optional product filter"),
    all_plans: bool = Query(False, description="Include unavailable plans (admin)")
):
    """
    Public / Customer endpoint: Retrieve active financing & EMI plans.
    """
    available_only = not all_plans
    return fetch_all_emi_plans(product_id=product_id, available_only=available_only)

@router.get("/{plan_id}", response_model=EmiPlan)
def get_single_emi_plan(plan_id: str = Path(..., description="EMI plan ID")):
    plan = fetch_emi_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"EMI plan with ID '{plan_id}' not found."
        )
    return plan

@router.post("", response_model=EmiPlan, status_code=status.HTTP_201_CREATED)
def create_new_emi_plan(
    plan_in: EmiPlanCreate,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Create a new store EMI / financing plan.
    """
    try:
        created = create_emi_plan(plan_in.model_dump() if hasattr(plan_in, 'model_dump') else plan_in.dict())
        return created
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create EMI plan."
        )

@router.put("/{plan_id}", response_model=EmiPlan)
def update_existing_emi_plan(
    plan_id: str,
    plan_in: EmiPlanUpdate,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Update an existing EMI plan.
    """
    data = plan_in.model_dump(exclude_unset=True) if hasattr(plan_in, 'model_dump') else plan_in.dict(exclude_unset=True)
    updated = update_emi_plan(plan_id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"EMI plan '{plan_id}' not found."
        )
    return updated

@router.delete("/{plan_id}", response_model=MessageResponse)
def remove_emi_plan(
    plan_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Delete an EMI plan.
    """
    deleted = delete_emi_plan(plan_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"EMI plan '{plan_id}' not found."
        )
    return MessageResponse(success=True, message="EMI plan deleted successfully.")

from fastapi import APIRouter, HTTPException, Path, Query, Depends, status
from typing import Dict, Any, List, Optional
from app.models import RepairJob, RepairJobCreate, RepairStatusUpdate, RepairStatusHistoryItem
from app.database import (
    fetch_repair_job,
    create_new_repair_job,
    fetch_all_repairs,
    update_repair_status,
    fetch_repair_history
)
from app.dependencies import get_current_admin

router = APIRouter(prefix="/api/repairs", tags=["Repair Tracking"])

# Supported canonical repair statuses across Amit Mobile Shop portal & tracking
VALID_REPAIR_STATUSES = {
    "received": "Received",
    "diagnosing": "Diagnosing",
    "diagnosis": "Diagnosing",
    "in repair": "In Repair",
    "waiting for parts": "Waiting for Parts",
    "waiting for approval": "Waiting for Approval",
    "approval": "Waiting for Approval",
    "quality check": "Quality Check",
    "ready for pickup": "Ready for Pickup",
    "ready": "Ready for Pickup",
    "delivered": "Delivered",
    "completed": "Delivered",
    "cancelled": "Cancelled"
}

@router.get("", response_model=List[RepairJob])
def get_all_repairs(limit: int = Query(50, ge=1, le=200, description="Max records to return")):
    """
    Retrieve list of repair jobs from Amit Mobile Shop service center.
    """
    try:
        return fetch_all_repairs(limit=limit)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve repair jobs. Please try again later."
        )


@router.get("/{job_sheet_id}", response_model=RepairJob)
def get_repair_status(
    job_sheet_id: str = Path(..., description="Job Sheet ID e.g. AMS-101")
):
    job = fetch_repair_job(job_sheet_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job Sheet '{job_sheet_id}' not found. Please verify the ID on your receipt from Amit Mobile Shop."
        )
    return job


@router.get("/{job_sheet_id}/history", response_model=List[RepairStatusHistoryItem])
def get_repair_history_endpoint(
    job_sheet_id: str = Path(..., description="Job Sheet ID e.g. AMS-101")
):
    """
    Customer & Admin timeline tracking: Returns chronological history of repair status changes.
    """
    job = fetch_repair_job(job_sheet_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job Sheet '{job_sheet_id}' not found."
        )
    return fetch_repair_history(job_sheet_id)


@router.post("", response_model=RepairJob)
def book_repair_job(job_in: RepairJobCreate):
    try:
        created = create_new_repair_job(job_in.dict())
        return created
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create repair booking. Please try again later."
        )


@router.patch("/{repair_id}/status", response_model=RepairJob)
def update_repair_status_endpoint(
    repair_id: str,
    payload: RepairStatusUpdate,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: Update repair job status and optional technician notes.
    Requires verified admin JWT token.
    Persists updates to SQLite database.
    """
    clean_status_key = payload.status.strip().lower()
    canonical_status = VALID_REPAIR_STATUSES.get(clean_status_key)
    if not canonical_status:
        allowed_list = ", ".join(sorted(set(VALID_REPAIR_STATUSES.values())))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Allowed statuses: {allowed_list}."
        )

    try:
        updated = update_repair_status(
            repair_id=repair_id,
            new_status=canonical_status,
            technician_notes=payload.technician_notes,
            final_cost=payload.final_cost
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while updating repair status. Please try again."
        )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Repair ticket with ID '{repair_id}' was not found in the service database."
        )

    return updated

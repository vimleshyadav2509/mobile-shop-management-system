from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.models import DashboardStatsResponse
from app.database import get_admin_dashboard_stats
from app.dependencies import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(current_admin: Dict[str, Any] = Depends(get_current_admin)):
    """
    Protected endpoint to fetch real database metrics for the admin dashboard.
    Counts total products, in-stock items, total repair jobs, and pending repair jobs.
    """
    stats = get_admin_dashboard_stats()
    return DashboardStatsResponse(**stats)

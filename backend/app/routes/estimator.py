from fastapi import APIRouter, HTTPException
from app.models import EstimateRequest, EstimateResponse
from app.ai_service import estimate_repair_cost

router = APIRouter(prefix="/api/estimate", tags=["AI Repair Estimator"])

@router.post("", response_model=EstimateResponse)
async def get_repair_estimate(req: EstimateRequest):
    try:
        res = await estimate_repair_cost(
            brand=req.brand,
            model=req.model,
            issue=req.issue,
            notes=req.notes
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Estimation failed: {str(e)}")

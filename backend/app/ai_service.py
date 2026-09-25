import json
import urllib.parse
from typing import Dict, Any
from app.config import GEMINI_API_KEY, SHOP_PHONE_1, SHOP_LOCATION
from app.models import EstimateResponse, CostBreakdown

# Domain-specific heuristics for Indian market repairs (Amit Mobile Shop)
BASE_REPAIR_RATES = {
    "screen": {
        "budget": (1200, 1800, 300, "1 - 2 Hours", "High Quality AAA+ Grade Display with 3 Months Touch Warranty"),
        "mid": (2200, 3200, 400, "1 - 3 Hours", "Original Quality OLED/AMOLED Folder with 6 Months Warranty"),
        "flagship": (4500, 9500, 600, "2 - 4 Hours", "100% Original OEM Display with TrueTone/Fingerprint calibration")
    },
    "battery": {
        "budget": (750, 1100, 250, "30 - 45 Minutes", "Certified High-Density Battery with 6 Months Replacement Guarantee"),
        "mid": (1200, 1600, 300, "45 Minutes", "Original Spec Grade A+ Battery with 6 Months Warranty"),
        "flagship": (1800, 3200, 400, "1 Hour", "Genuine OEM Battery with Battery Health Indicator support")
    },
    "charging": {
        "all": (350, 750, 200, "30 Minutes", "Original Sub-Board / Type-C Pin with Fast Charging & OTG Support")
    },
    "speaker": {
        "all": (350, 650, 200, "30 - 45 Minutes", "Original Ear-Speaker / Loudspeaker Ringer")
    },
    "camera": {
        "budget": (600, 1200, 300, "1 - 2 Hours", "Tested Original Camera Module with Clean Focus"),
        "flagship": (1800, 4500, 500, "2 Hours", "Genuine OIS Camera Module with factory calibration")
    },
    "water": {
        "all": (600, 1500, 500, "3 - 5 Hours", "Microscopic Ultrasonic Motherboard De-oxidation & Circuit Diagnostic")
    },
    "motherboard": {
        "all": (1200, 3500, 600, "4 - 8 Hours", "Advanced Chip-Level IC Reballing (Charging IC, Power IC, Network IC)")
    }
}

def determine_tier(brand: str, model: str) -> str:
    brand_lower = brand.lower()
    model_lower = model.lower()
    
    if "iphone" in model_lower or "pro max" in model_lower or "ultra" in model_lower or "fold" in model_lower or "flip" in model_lower:
        return "flagship"
    if brand_lower in ["apple"]:
        return "flagship"
    if brand_lower in ["oneplus"] or "pro" in model_lower or "plus" in model_lower or "gt" in model_lower or "reno" in model_lower:
        return "mid"
    return "budget"

def classify_issue_category(issue: str) -> str:
    issue_lower = issue.lower()
    if any(k in issue_lower for k in ["screen", "display", "glass", "touch", "folder", "combo"]):
        return "screen"
    if any(k in issue_lower for k in ["battery", "backup", "drain", "swollen"]):
        return "battery"
    if any(k in issue_lower for k in ["charge", "charging", "port", "pin", "sub-board"]):
        return "charging"
    if any(k in issue_lower for k in ["speaker", "mic", "sound", "ringer", "audio", "earpiece"]):
        return "speaker"
    if any(k in issue_lower for k in ["camera", "lens", "blur", "focus"]):
        return "camera"
    if any(k in issue_lower for k in ["water", "liquid", "wet", "rain", "drown"]):
        return "water"
    return "motherboard"

def generate_offline_estimate(brand: str, model: str, issue: str) -> EstimateResponse:
    category = classify_issue_category(issue)
    tier = determine_tier(brand, model)
    
    config = BASE_REPAIR_RATES.get(category, BASE_REPAIR_RATES["screen"])
    if tier in config:
        min_p, max_p, labor, time_est, quality_info = config[tier]
    elif "all" in config:
        min_p, max_p, labor, time_est, quality_info = config["all"]
    else:
        min_p, max_p, labor, time_est, quality_info = (800, 1600, 300, "1 - 2 Hours", "Quality Tested Part with Shop Warranty")

    total_min = min_p + labor
    total_max = max_p + labor

    wa_text = f"Hello Amit Mobile Shop, I checked online repair estimation for my {brand} {model} with issue: '{issue}'. Estimated cost: Rs.{int(total_min)} - Rs.{int(total_max)}. Can I bring it today for repair?"
    wa_url = f"https://wa.me/91{SHOP_PHONE_1}?text={urllib.parse.quote(wa_text)}"

    breakdown = CostBreakdown(
        part_cost_min=float(min_p),
        part_cost_max=float(max_p),
        service_charge=float(labor),
        estimated_min_total=float(total_min),
        estimated_max_total=float(total_max),
        estimated_turnaround_time=time_est,
        warranty_provided="Up to 6 Months Warranty + Instant Testing at Store Counter"
    )

    tips = {
        "screen": "Do not press hard on the broken glass to prevent damage to the underlying OLED/AMOLED touch layer.",
        "battery": "Avoid charging with third-party unauthorized adapters; original 100% capacity cells will restore full day battery life.",
        "charging": "Inspect the Type-C/Lightning slot for lint before socket replacement; Amit technicians use anti-static safe soldering.",
        "water": "IMPORTANT: Do NOT plug your phone into a charger if dropped in water. Bring directly to Amit Mobile Shop for ultrasonic drying.",
        "motherboard": "Chip-level repairs are performed under a trinocular microscope with genuine stencil reballing."
    }

    return EstimateResponse(
        brand=brand,
        model=model,
        issue=issue,
        estimated_min_cost=float(total_min),
        estimated_max_cost=float(total_max),
        turnaround_time=time_est,
        part_quality=quality_info,
        confidence="95% Accurate Local Market Benchmark",
        ai_generated=False,
        summary=f"Estimated repair for {brand} {model} ({issue}) is ₹{int(total_min):,} – ₹{int(total_max):,}. Ready in approximately {time_est}.",
        technician_tip=tips.get(category, "Visit Amit Mobile Shop (Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312) for 15-minute free diagnostics."),
        breakdown=breakdown,
        whatsapp_link=wa_url
    )

async def estimate_repair_cost(brand: str, model: str, issue: str, notes: str = None) -> EstimateResponse:
    if not GEMINI_API_KEY:
        return generate_offline_estimate(brand, model, issue)

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model_instance = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
You are the Chief Technician and Cost Estimator at "Amit Mobile Shop", located at {SHOP_LOCATION}.
Given the following customer device repair query:
Device Brand: {brand}
Device Model: {model}
Reported Issue: {issue}
Additional Notes: {notes or 'None'}

Provide an accurate, realistic Indian Rupees (INR) repair cost estimate based on current Indian market component rates and labor costs.
Output ONLY a valid JSON object strictly matching this schema with NO markdown wrapping:
{{
  "part_cost_min": <float>,
  "part_cost_max": <float>,
  "service_charge": <float>,
  "estimated_min_total": <float>,
  "estimated_max_total": <float>,
  "turnaround_time": "<string e.g. '1 - 2 Hours' or '45 Minutes'>",
  "part_quality": "<string description of the replacement component quality and warranty>",
  "confidence": "<string e.g. 'High' or 'Medium'>",
  "summary": "<1-2 sentence technician explanation of what work is needed>",
  "technician_tip": "<practical tip for the customer regarding this issue>",
  "warranty_provided": "<warranty detail e.g. '3 to 6 Months Warranty'>"
}}
"""
        response = await model_instance.generate_content_async(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        data = json.loads(text)
        
        wa_text = f"Hello Amit Mobile Shop, I ran an estimate for my {brand} {model} with issue '{issue}'. Estimated cost: Rs.{int(data['estimated_min_total'])} - Rs.{int(data['estimated_max_total'])}. I want to schedule this repair."
        wa_url = f"https://wa.me/91{SHOP_PHONE_1}?text={urllib.parse.quote(wa_text)}"

        breakdown = CostBreakdown(
            part_cost_min=float(data.get("part_cost_min", 1000)),
            part_cost_max=float(data.get("part_cost_max", 2000)),
            service_charge=float(data.get("service_charge", 300)),
            estimated_min_total=float(data.get("estimated_min_total", 1300)),
            estimated_max_total=float(data.get("estimated_max_total", 2300)),
            estimated_turnaround_time=data.get("turnaround_time", "1 - 2 Hours"),
            warranty_provided=data.get("warranty_provided", "6 Months Shop Warranty")
        )

        return EstimateResponse(
            brand=brand,
            model=model,
            issue=issue,
            estimated_min_cost=float(data.get("estimated_min_total", 1300)),
            estimated_max_cost=float(data.get("estimated_max_total", 2300)),
            turnaround_time=data.get("turnaround_time", "1 - 2 Hours"),
            part_quality=data.get("part_quality", "Original Quality with Warranty"),
            confidence=data.get("confidence", "High"),
            ai_generated=True,
            summary=data.get("summary", f"Professional repair for {brand} {model}"),
            technician_tip=data.get("technician_tip", "Visit Amit Mobile Shop for fast service."),
            breakdown=breakdown,
            whatsapp_link=wa_url
        )
    except Exception as e:
        print(f"[AI Service] Gemini call fallback triggered: {e}")
        return generate_offline_estimate(brand, model, issue)

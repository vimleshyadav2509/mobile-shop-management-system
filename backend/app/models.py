from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class Product(BaseModel):
    id: str
    title: str
    brand: str
    model: str
    condition: str # 'new', 'like_new', 'good', 'fair'
    category: Optional[str] = "Smartphones"
    variant: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    ram_storage: Optional[str] = None
    color: Optional[str] = None
    battery_health: Optional[str] = None
    warranty_info: str = "Shop Warranty Included"
    emi_bajaj: bool = True
    emi_tvs: bool = True
    emi_samsung: bool = True
    image_url: Optional[str] = None
    in_stock: bool = True
    stock_count: Optional[int] = 1
    stock_status: Optional[str] = "IN STOCK"
    featured: bool = False
    description: Optional[str] = None
    created_at: Optional[str] = None

class ProductCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Product title/name")
    brand: str = Field(..., min_length=1, max_length=100, description="Brand name e.g. Samsung, Apple, Vivo")
    model: Optional[str] = Field(None, max_length=150, description="Device model e.g. Galaxy S24 Ultra")
    category: Optional[str] = Field("Smartphones", max_length=100)
    variant: Optional[str] = Field(None, max_length=100, description="Variant / edition e.g. 5G Indian Retail")
    condition: str = Field("new", description="'new', 'like_new', 'good', or 'fair'")
    price: float = Field(..., ge=0, description="Selling price in INR")
    original_price: Optional[float] = Field(None, ge=0, description="Original MRP for discount calculation")
    ram_storage: Optional[str] = Field(None, description="e.g. 8GB / 128GB")
    color: Optional[str] = Field(None, description="Color variant e.g. Titanium Black")
    battery_health: Optional[str] = Field(None, description="Battery health e.g. 100% or 89%")
    warranty_info: Optional[str] = Field("Shop Warranty Included", description="Warranty details")
    emi_bajaj: bool = True
    emi_tvs: bool = True
    emi_samsung: bool = True
    image_url: Optional[str] = None
    in_stock: bool = True
    stock_count: Optional[int] = Field(1, ge=0)
    stock_status: Optional[str] = Field(None, description="Stock status e.g. 'IN STOCK', 'LOW STOCK', 'OUT OF STOCK', 'COMING SOON'")
    featured: bool = False
    description: Optional[str] = None

    @field_validator("condition")
    @classmethod
    def validate_condition(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ["new", "like_new", "good", "fair", "refurbished", "second_hand"]:
            raise ValueError("Condition must be one of: 'new', 'like_new', 'good', 'fair'")
        if clean == "refurbished":
            return "like_new"
        if clean == "second_hand":
            return "good"
        return clean

class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    model: Optional[str] = Field(None, max_length=150)
    category: Optional[str] = Field(None, max_length=100)
    condition: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    original_price: Optional[float] = Field(None, ge=0)
    ram_storage: Optional[str] = None
    color: Optional[str] = None
    battery_health: Optional[str] = None
    warranty_info: Optional[str] = None
    emi_bajaj: Optional[bool] = None
    emi_tvs: Optional[bool] = None
    emi_samsung: Optional[bool] = None
    image_url: Optional[str] = None
    in_stock: Optional[bool] = None
    stock_count: Optional[int] = Field(None, ge=0)
    variant: Optional[str] = None
    stock_status: Optional[str] = None
    featured: Optional[bool] = None
    description: Optional[str] = None

    @field_validator("condition")
    @classmethod
    def validate_condition(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        clean = v.strip().lower()
        if clean not in ["new", "like_new", "good", "fair", "refurbished", "second_hand"]:
            raise ValueError("Condition must be one of: 'new', 'like_new', 'good', 'fair'")
        if clean == "refurbished":
            return "like_new"
        if clean == "second_hand":
            return "good"
        return clean

class ProductDeleteResponse(BaseModel):
    success: bool = True
    message: str = "Product deleted successfully"
    id: str

class RepairStatusHistoryItem(BaseModel):
    id: str
    repair_id: str
    old_status: Optional[str] = None
    new_status: str
    note: Optional[str] = None
    created_at: Optional[str] = None

class RepairJob(BaseModel):
    id: str
    job_sheet_id: str
    customer_name: str
    customer_phone: str
    device_brand: str
    device_model: str
    issue_type: str
    issue_description: Optional[str] = None
    status: str = "Received" # 'Received', 'In Repair', 'Waiting for Parts', 'Waiting for Approval', 'Ready for Pickup', 'Delivered'
    estimated_cost: float
    final_cost: Optional[float] = None
    technician_notes: Optional[str] = None
    technician_name: str = "Amit Mobile Shop Expert"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    history: Optional[List[RepairStatusHistoryItem]] = None

class RepairJobCreate(BaseModel):
    customer_name: str
    customer_phone: str
    device_brand: str
    device_model: str
    issue_type: str
    issue_description: Optional[str] = None
    estimated_cost: Optional[float] = None

class RepairStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1, max_length=50, description="New repair status e.g. 'In Repair', 'Ready for Pickup'")
    technician_notes: Optional[str] = Field(None, description="Optional technician notes update")
    final_cost: Optional[float] = Field(None, ge=0, description="Optional final repair cost in INR")

class EstimateRequest(BaseModel):
    brand: str = Field(..., example="Samsung")
    model: str = Field(..., example="Galaxy M31")
    issue: str = Field(..., example="Cracked Screen / Display combo broken")
    notes: Optional[str] = None

class CostBreakdown(BaseModel):
    part_cost_min: float
    part_cost_max: float
    service_charge: float
    estimated_min_total: float
    estimated_max_total: float
    estimated_turnaround_time: str
    warranty_provided: str

class EstimateResponse(BaseModel):
    brand: str
    model: str
    issue: str
    estimated_min_cost: float
    estimated_max_cost: float
    turnaround_time: str
    part_quality: str
    confidence: str
    ai_generated: bool
    summary: str
    technician_tip: str
    breakdown: CostBreakdown
    whatsapp_link: str

# --- Admin & Authentication Models ---
class LoginRequest(BaseModel):
    username: str = Field(..., example="Amit_MS2026")
    password: str = Field(..., example="your_password")

class AdminUserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    role: str = "admin"
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminUserResponse

class DashboardStatsResponse(BaseModel):
    total_products: int
    in_stock_products: int
    total_repairs: int
    pending_repairs: int
    low_stock_products: Optional[int] = 0
    out_of_stock_products: Optional[int] = 0
    status_breakdown: Optional[Dict[str, int]] = None
    recent_products: Optional[List[Dict[str, Any]]] = None
    recent_repairs: Optional[List[Dict[str, Any]]] = None

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, description="Current administrator password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password (minimum 8 characters)")

class MessageResponse(BaseModel):
    success: bool = True
    message: str

# --- Customer Authentication & Mobile OTP Models ---
class CustomerResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone_verified: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class CustomerTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    customer: CustomerResponse

class OTPRequest(BaseModel):
    phone: str = Field(..., description="Indian mobile number e.g. 9876543210 or +919876543210")

class OTPVerify(BaseModel):
    phone: str = Field(..., description="Indian mobile number used to request OTP")
    otp: str = Field(..., min_length=4, max_length=10, description="Verification OTP code")

class CustomerProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=150)
    address: Optional[str] = Field(None, max_length=300)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)

class ChangePhoneRequest(BaseModel):
    new_phone: str = Field(..., description="New Indian mobile number to verify")

class ChangePhoneVerify(BaseModel):
    new_phone: str = Field(..., description="New Indian mobile number")
    otp: str = Field(..., min_length=4, max_length=10, description="Verification OTP code")

# --- EMI Models ---
class EmiPlan(BaseModel):
    id: str
    product_id: Optional[str] = None
    provider: str
    duration_months: int
    down_payment: float = 0.0
    monthly_emi: float
    processing_fee: float = 0.0
    interest_rate: float = 0.0
    available: bool = True
    created_at: Optional[str] = None

class EmiPlanCreate(BaseModel):
    product_id: Optional[str] = None
    provider: str = Field(..., min_length=2, max_length=100)
    duration_months: int = Field(..., ge=1, le=60)
    down_payment: float = Field(0.0, ge=0)
    monthly_emi: float = Field(..., ge=0)
    processing_fee: float = Field(0.0, ge=0)
    interest_rate: float = Field(0.0, ge=0)
    available: bool = True

class EmiPlanUpdate(BaseModel):
    product_id: Optional[str] = None
    provider: Optional[str] = Field(None, min_length=2, max_length=100)
    duration_months: Optional[int] = Field(None, ge=1, le=60)
    down_payment: Optional[float] = Field(None, ge=0)
    monthly_emi: Optional[float] = Field(None, ge=0)
    processing_fee: Optional[float] = Field(None, ge=0)
    interest_rate: Optional[float] = Field(None, ge=0)
    available: Optional[bool] = None

# --- Shop Settings Models ---
class ShopSettings(BaseModel):
    id: str = "default"
    shop_name: str
    tagline: Optional[str] = None
    phone1: Optional[str] = None
    phone2: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    weekly_off: Optional[str] = None
    google_maps_url: Optional[str] = None
    updated_at: Optional[str] = None

class ShopSettingsUpdate(BaseModel):
    shop_name: Optional[str] = Field(None, min_length=1, max_length=200)
    tagline: Optional[str] = Field(None, max_length=300)
    phone1: Optional[str] = Field(None, max_length=50)
    phone2: Optional[str] = Field(None, max_length=50)
    whatsapp: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    opening_time: Optional[str] = Field(None, max_length=50)
    closing_time: Optional[str] = Field(None, max_length=50)
    weekly_off: Optional[str] = Field(None, max_length=50)
    google_maps_url: Optional[str] = Field(None, max_length=500)




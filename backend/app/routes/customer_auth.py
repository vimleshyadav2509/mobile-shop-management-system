import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.models import (
    CustomerResponse,
    CustomerTokenResponse,
    OTPRequest,
    OTPVerify,
    CustomerProfileUpdate,
    ChangePhoneRequest,
    ChangePhoneVerify,
    MessageResponse
)
from app.database import (
    get_customer_by_phone,
    get_customer_by_id,
    create_or_get_customer,
    update_customer_profile,
    update_customer_phone,
    save_customer_otp,
    get_latest_active_otp,
    increment_otp_attempts,
    mark_otp_consumed,
    invalidate_customer_otps,
    count_recent_otp_requests,
    get_customer_repair_jobs
)
from app.sms_service import (
    normalize_phone_number,
    generate_otp,
    hash_otp,
    verify_otp_hash,
    send_otp_sms
)
from app.security import create_access_token
from app.dependencies import get_current_customer
from app.config import CUSTOMER_TOKEN_EXPIRE_DAYS

router = APIRouter(prefix="/api/auth/customer", tags=["Customer Mobile OTP Authentication"])

# Anti-Abuse Rate Limiters (In-Memory IP & Cooldown Trackers)
_ip_request_timestamps: Dict[str, List[float]] = {}
IP_WINDOW_SECONDS = 600  # 10 minutes
IP_MAX_REQUESTS = 10

_phone_last_request_time: Dict[str, float] = {}
COOLDOWN_SECONDS = 60
OTP_EXPIRY_MINUTES = 5
MAX_OTP_ATTEMPTS = 5
MAX_HOURLY_PHONE_REQUESTS = 5


def _check_ip_rate_limit(client_ip: str) -> None:
    now = time.time()
    recent = [t for t in _ip_request_timestamps.get(client_ip, []) if now - t < IP_WINDOW_SECONDS]
    _ip_request_timestamps[client_ip] = recent
    if len(recent) >= IP_MAX_REQUESTS:
        wait_time = int(IP_WINDOW_SECONDS - (now - recent[0]))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many OTP requests from your network. Please wait {max(1, wait_time)} seconds.",
            headers={"Retry-After": str(max(1, wait_time))}
        )


def _record_ip_request(client_ip: str) -> None:
    now = time.time()
    recent = _ip_request_timestamps.get(client_ip, [])
    recent.append(now)
    _ip_request_timestamps[client_ip] = [t for t in recent if now - t < IP_WINDOW_SECONDS]


@router.post("/request-otp", response_model=MessageResponse)
def request_customer_otp(req: OTPRequest, request: Request):
    """
    Step 1: Request 6-digit OTP for customer mobile authentication.
    - Standardizes Indian mobile number (+91XXXXXXXXXX)
    - Enforces rate limits (IP limit, 60s cooldown, hourly limit per phone)
    - Cryptographically hashes OTP (never plaintext in DB)
    - Dispatches via SMS provider
    - Never returns OTP in HTTP response
    """
    # 1. Normalize Phone Number
    try:
        phone = normalize_phone_number(req.phone)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # 2. IP Rate Limit
    forwarded = request.headers.get("x-forwarded-for")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "127.0.0.1")
    _check_ip_rate_limit(client_ip)

    # 3. Cooldown Check (60 seconds)
    now = time.time()
    last_req = _phone_last_request_time.get(phone, 0)
    if now - last_req < COOLDOWN_SECONDS:
        remaining = int(COOLDOWN_SECONDS - (now - last_req))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining} seconds before requesting a new OTP.",
            headers={"Retry-After": str(remaining)}
        )

    # 4. Hourly Limit per Phone
    recent_cnt = count_recent_otp_requests(phone, window_seconds=3600)
    if recent_cnt >= MAX_HOURLY_PHONE_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Maximum hourly OTP requests exceeded for this number. Please try again later."
        )

    # 5. Invalidate existing active OTPs for this phone
    invalidate_customer_otps(phone)

    # 6. Generate cryptographically secure OTP & hash
    otp = generate_otp(6)
    otp_hash = hash_otp(phone, otp)
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)).isoformat()

    # 7. Persist OTP in database
    save_customer_otp(phone, otp_hash, expires_at, max_attempts=MAX_OTP_ATTEMPTS)
    _phone_last_request_time[phone] = now
    _record_ip_request(client_ip)

    # 8. Send SMS via configured provider
    delivered, msg = send_otp_sms(phone, otp)
    if not delivered:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"SMS Gateway Error: {msg}"
        )

    return MessageResponse(
        success=True,
        message=f"OTP sent successfully to {phone[:6]}****{phone[-2:]}. Valid for 5 minutes."
    )


@router.post("/verify-otp", response_model=CustomerTokenResponse)
def verify_customer_otp(req: OTPVerify):
    """
    Step 2: Verify 6-digit OTP and authenticate customer.
    - Matches active cryptographic hash
    - Checks expiry and attempt limit
    - Creates new customer account if not present or finds existing
    - Issues JWT customer access token
    - Single-use: marks OTP consumed immediately
    """
    try:
        phone = normalize_phone_number(req.phone)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    clean_otp = req.otp.strip()
    if not clean_otp or len(clean_otp) != 6 or not clean_otp.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP format. Please enter a 6-digit numeric OTP."
        )

    # 1. Fetch latest active OTP
    active_otp = get_latest_active_otp(phone)
    if not active_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active OTP request found for this mobile number. Please request a new OTP."
        )

    # 2. Check Expiry
    try:
        expires_at = datetime.fromisoformat(active_otp["expires_at"])
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            mark_otp_consumed(active_otp["id"])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired. Please request a new one."
            )
    except (ValueError, TypeError):
        pass

    # 3. Check Attempt Limit
    attempts = active_otp.get("attempts", 0)
    max_attempts = active_otp.get("max_attempts", MAX_OTP_ATTEMPTS)
    if attempts >= max_attempts:
        mark_otp_consumed(active_otp["id"])
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum verification attempts exceeded. This OTP has been invalidated. Please request a new one."
        )

    # 4. Verify Hash (Constant Time)
    is_valid = verify_otp_hash(phone, clean_otp, active_otp["otp_hash"])
    if not is_valid:
        new_attempts = increment_otp_attempts(active_otp["id"])
        remaining = max(0, max_attempts - new_attempts)
        if remaining <= 0:
            mark_otp_consumed(active_otp["id"])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP. Maximum attempts reached; please request a new OTP."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP code. {remaining} attempt(s) remaining."
        )

    # 5. Invalidate OTP (single-use)
    mark_otp_consumed(active_otp["id"])

    # 6. Find or create customer account
    customer = create_or_get_customer(phone)

    # 7. Issue JWT Token with 30-day expiry
    token = create_access_token(
        data={
            "sub": customer["id"],
            "role": "customer",
            "phone": customer["phone"]
        },
        expires_delta=timedelta(days=CUSTOMER_TOKEN_EXPIRE_DAYS)
    )

    customer_resp = CustomerResponse(
        id=customer["id"],
        name=customer["name"],
        phone=customer["phone"],
        email=customer.get("email"),
        address=customer.get("address"),
        city=customer.get("city"),
        state=customer.get("state"),
        pincode=customer.get("pincode"),
        phone_verified=bool(customer.get("phone_verified", True)),
        created_at=customer.get("created_at"),
        updated_at=customer.get("updated_at")
    )

    return CustomerTokenResponse(
        access_token=token,
        token_type="bearer",
        customer=customer_resp
    )


@router.get("/me", response_model=CustomerResponse)
def get_customer_profile(current_customer: Dict[str, Any] = Depends(get_current_customer)):
    """Return currently authenticated customer profile."""
    return CustomerResponse(
        id=current_customer["id"],
        name=current_customer["name"],
        phone=current_customer["phone"],
        email=current_customer.get("email"),
        address=current_customer.get("address"),
        city=current_customer.get("city"),
        state=current_customer.get("state"),
        pincode=current_customer.get("pincode"),
        phone_verified=bool(current_customer.get("phone_verified", True)),
        created_at=current_customer.get("created_at"),
        updated_at=current_customer.get("updated_at")
    )


@router.put("/profile", response_model=CustomerResponse)
def update_profile(
    payload: CustomerProfileUpdate,
    current_customer: Dict[str, Any] = Depends(get_current_customer)
):
    """
    Update customer profile information (Name, Email, Delivery Address, Pincode).
    Mobile number change requires separate OTP verification to prevent account hijacking.
    """
    updated = update_customer_profile(current_customer["id"], payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update customer profile."
        )

    return CustomerResponse(
        id=updated["id"],
        name=updated["name"],
        phone=updated["phone"],
        email=updated.get("email"),
        address=updated.get("address"),
        city=updated.get("city"),
        state=updated.get("state"),
        pincode=updated.get("pincode"),
        phone_verified=bool(updated.get("phone_verified", True)),
        created_at=updated.get("created_at"),
        updated_at=updated.get("updated_at")
    )


@router.post("/change-phone/request-otp", response_model=MessageResponse)
def request_change_phone_otp(
    req: ChangePhoneRequest,
    current_customer: Dict[str, Any] = Depends(get_current_customer)
):
    """
    Request OTP to update existing customer's mobile number.
    OTP is sent to the NEW mobile number to verify ownership before updating.
    """
    try:
        new_phone = normalize_phone_number(req.new_phone)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if new_phone == current_customer["phone"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new mobile number is identical to your current number."
        )

    # Check if number already registered to another account
    existing = get_customer_by_phone(new_phone)
    if existing and existing["id"] != current_customer["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This mobile number is already registered to another customer account."
        )

    # Invalidate previous OTPs
    invalidate_customer_otps(new_phone)

    # Generate OTP
    otp = generate_otp(6)
    otp_hash = hash_otp(new_phone, otp)
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)).isoformat()

    save_customer_otp(new_phone, otp_hash, expires_at, max_attempts=MAX_OTP_ATTEMPTS)

    delivered, msg = send_otp_sms(new_phone, otp)
    if not delivered:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"SMS Gateway Error: {msg}"
        )

    return MessageResponse(
        success=True,
        message=f"Verification code sent to {new_phone[:6]}****{new_phone[-2:]}."
    )


@router.post("/change-phone/verify-otp", response_model=CustomerResponse)
def verify_change_phone_otp(
    req: ChangePhoneVerify,
    current_customer: Dict[str, Any] = Depends(get_current_customer)
):
    """
    Verify OTP sent to new mobile number and update customer's record.
    Keeps stable customer account ID unchanged.
    """
    try:
        new_phone = normalize_phone_number(req.new_phone)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    clean_otp = req.otp.strip()
    active_otp = get_latest_active_otp(new_phone)
    if not active_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active OTP request found for the new mobile number."
        )

    # Check Expiry
    try:
        expires_at = datetime.fromisoformat(active_otp["expires_at"])
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            mark_otp_consumed(active_otp["id"])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired. Please request a new one."
            )
    except (ValueError, TypeError):
        pass

    # Check Attempt Limit
    attempts = active_otp.get("attempts", 0)
    max_attempts = active_otp.get("max_attempts", MAX_OTP_ATTEMPTS)
    if attempts >= max_attempts:
        mark_otp_consumed(active_otp["id"])
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum verification attempts exceeded. Please request a new OTP."
        )

    if not verify_otp_hash(new_phone, clean_otp, active_otp["otp_hash"]):
        new_attempts = increment_otp_attempts(active_otp["id"])
        remaining = max(0, max_attempts - new_attempts)
        if remaining <= 0:
            mark_otp_consumed(active_otp["id"])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP. Maximum attempts reached; please request a new OTP."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP for new mobile number. {remaining} attempt(s) remaining."
        )

    mark_otp_consumed(active_otp["id"])
    updated = update_customer_phone(current_customer["id"], new_phone)

    return CustomerResponse(
        id=updated["id"],
        name=updated["name"],
        phone=updated["phone"],
        email=updated.get("email"),
        address=updated.get("address"),
        city=updated.get("city"),
        state=updated.get("state"),
        pincode=updated.get("pincode"),
        phone_verified=bool(updated.get("phone_verified", True)),
        created_at=updated.get("created_at"),
        updated_at=updated.get("updated_at")
    )


@router.get("/repairs")
def get_my_repairs(current_customer: Dict[str, Any] = Depends(get_current_customer)):
    """
    Fetch repair jobs associated with the authenticated customer's phone number.
    Server-side authorization prevents Customer A from seeing Customer B's repair bookings.
    """
    return get_customer_repair_jobs(current_customer["phone"])


@router.post("/logout")
def customer_logout(current_customer: Dict[str, Any] = Depends(get_current_customer)):
    """Confirm customer logout. Client clears stored token."""
    return {"message": "Customer logged out successfully"}

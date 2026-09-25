import time
from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Dict, Any, List
from app.models import (
    LoginRequest,
    TokenResponse,
    AdminUserResponse,
    ChangePasswordRequest,
    MessageResponse
)
from app.database import get_admin_by_username, update_admin_password
from app.security import verify_password, hash_password, create_access_token
from app.dependencies import get_current_admin

router = APIRouter(prefix="/api/auth", tags=["Admin Authentication"])

# In-memory Rate Limiter for Login Attempts (IP -> list of timestamps)
_failed_login_attempts: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW = 300  # 5 minutes
MAX_FAILED_ATTEMPTS = 5

COMMON_WEAK_PASSWORDS = {
    "password", "password123", "admin123", "12345678", "123456789",
    "adminadmin", "qwerty123", "letmein123", "welcome123"
}

def _check_rate_limit(client_ip: str) -> None:
    now = time.time()
    attempts = _failed_login_attempts.get(client_ip, [])
    recent_attempts = [t for t in attempts if now - t < RATE_LIMIT_WINDOW]
    _failed_login_attempts[client_ip] = recent_attempts
    if len(recent_attempts) >= MAX_FAILED_ATTEMPTS:
        retry_after = int(RATE_LIMIT_WINDOW - (now - recent_attempts[0]))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please wait {max(1, retry_after)} seconds before trying again.",
            headers={"Retry-After": str(max(1, retry_after))}
        )

def _record_failed_attempt(client_ip: str) -> None:
    now = time.time()
    attempts = _failed_login_attempts.get(client_ip, [])
    attempts.append(now)
    _failed_login_attempts[client_ip] = [t for t in attempts if now - t < RATE_LIMIT_WINDOW]

def _clear_rate_limit(client_ip: str) -> None:
    _failed_login_attempts.pop(client_ip, None)


@router.post("/login", response_model=TokenResponse)
def admin_login(req: LoginRequest, request: Request):
    """
    Authenticate shop admin / owner with username & password.
    Returns signed JWT access token.
    Generic 401 error returned on any credential mismatch for security.
    Protected against brute-force attacks via IP rate limiting.
    """
    forwarded = request.headers.get("x-forwarded-for")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "127.0.0.1")
    
    _check_rate_limit(client_ip)

    admin = get_admin_by_username(req.username.strip())
    if not admin or not verify_password(req.password, admin["password_hash"]):
        _record_failed_attempt(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not admin.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive. Contact store administrator.",
        )
    
    # Reset failed attempts upon successful login
    _clear_rate_limit(client_ip)

    # Generate JWT token with token_version claim
    token = create_access_token({
        "sub": admin["id"],
        "username": admin["username"],
        "role": admin.get("role", "admin"),
        "token_version": admin.get("token_version", 1)
    })
    
    admin_response = AdminUserResponse(
        id=admin["id"],
        username=admin["username"],
        email=admin.get("email"),
        role=admin.get("role", "admin"),
        is_active=bool(admin.get("is_active", True)),
        created_at=admin.get("created_at"),
        updated_at=admin.get("updated_at")
    )
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        admin=admin_response
    )


@router.get("/me", response_model=AdminUserResponse)
def get_current_admin_profile(current_admin: Dict[str, Any] = Depends(get_current_admin)):
    """
    Protected endpoint to return the currently authenticated admin's public profile.
    Never exposes password hashes.
    """
    return AdminUserResponse(
        id=current_admin["id"],
        username=current_admin["username"],
        email=current_admin.get("email"),
        role=current_admin.get("role", "admin"),
        is_active=bool(current_admin.get("is_active", True)),
        created_at=current_admin.get("created_at"),
        updated_at=current_admin.get("updated_at")
    )


@router.post("/change-password", response_model=MessageResponse)
def change_admin_password(
    payload: ChangePasswordRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Protected Admin endpoint: securely update the administrator's password.
    Validates current password, checks new password strength, securely hashes new password,
    and increments token_version to invalidate prior JWT sessions across all devices.
    """
    # 1. Verify current password
    if not verify_password(payload.current_password, current_admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # 2. Check if new password is identical to old password
    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as the current password"
        )
        
    # 3. Check password length
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
        
    # 4. Check common weak passwords
    if payload.new_password.lower() in COMMON_WEAK_PASSWORDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The chosen password is too common or easily guessed. Please select a stronger password."
        )

    # 5. Securely hash and update in database
    new_hash = hash_password(payload.new_password)
    success = update_admin_password(current_admin["id"], new_hash)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password in database"
        )

    return MessageResponse(
        success=True,
        message="Password updated successfully. Prior active sessions have been invalidated."
    )


@router.post("/logout")
def admin_logout(current_admin: Dict[str, Any] = Depends(get_current_admin)):
    """
    Confirm logout for authenticated admin session.
    Client clears stored JWT token upon receiving this response.
    """
    return {"message": "Admin logged out successfully"}


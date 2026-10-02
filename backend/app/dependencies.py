from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
from app.security import decode_access_token
from app.database import get_admin_by_id, get_admin_by_username, get_customer_by_id

# Reusable Bearer scheme
security_scheme = HTTPBearer(auto_error=False)

async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Dict[str, Any]:
    """
    FastAPI dependency to extract, validate JWT token, and authenticate admin.
    Rejects unauthenticated requests with 401, non-admin tokens with 403, and inactive accounts with 403.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    role = payload.get("role")
    if role == "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin privileges required.",
        )

    admin_id = payload.get("sub")
    admin = None
    if admin_id:
        admin = get_admin_by_id(admin_id)
    if not admin and payload.get("username"):
        admin = get_admin_by_username(payload.get("username"))
        
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user not found or has been removed",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Invalidate tokens issued prior to a password change
    token_version = payload.get("token_version")
    db_token_version = admin.get("token_version", 1)
    if token_version is not None and token_version != db_token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked due to a password change. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not admin.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive. Contact store administrator.",
        )
    
    return admin

def require_admin(admin: Dict[str, Any] = Depends(get_current_admin)) -> Dict[str, Any]:
    """Helper requiring verified admin status."""
    return admin

async def get_current_customer(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Dict[str, Any]:
    """
    FastAPI dependency to extract, validate JWT token, and authenticate customer.
    Derives customer identity server-side from JWT claims.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Customer authentication token is missing. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired customer session. Please verify mobile OTP again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role = payload.get("role")
    if role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token role. Customer session required.",
        )

    customer_id = payload.get("sub")
    if not customer_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token claims.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    customer = get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Customer account not found. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return customer

async def get_optional_customer(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Optional[Dict[str, Any]]:
    """Returns customer if valid token is provided, or None for guest requests."""
    if not credentials or not credentials.credentials:
        return None
    try:
        return await get_current_customer(credentials)
    except HTTPException:
        return None


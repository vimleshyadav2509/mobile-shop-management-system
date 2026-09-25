from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
from app.security import decode_access_token
from app.database import get_admin_by_id, get_admin_by_username

# Reusable Bearer scheme
security_scheme = HTTPBearer(auto_error=False)

async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Dict[str, Any]:
    """
    FastAPI dependency to extract, validate JWT token, and authenticate admin.
    Rejects unauthenticated requests with 401 and inactive accounts with 403.
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

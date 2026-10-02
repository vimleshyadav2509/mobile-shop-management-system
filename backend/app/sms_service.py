import re
import secrets
import hashlib
import hmac
import requests
from typing import Tuple
from app.config import (
    SMS_PROVIDER,
    FAST2SMS_API_KEY,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER,
    IS_PRODUCTION,
    JWT_SECRET_KEY
)

def normalize_phone_number(raw_phone: str) -> str:
    """
    Standardize Indian mobile numbers to canonical +91XXXXXXXXXX format.
    Accepts:
      '9876543210'
      '+919876543210'
      '91 9876543210'
      '+91-9876543210'
      '09876543210'
    Rejects invalid lengths, non-Indian prefixes, or invalid starting digits.
    """
    if not raw_phone or not isinstance(raw_phone, str):
        raise ValueError("Mobile number is required.")

    # Remove all whitespace, dashes, parentheses, dots
    cleaned = re.sub(r"[\s\-\(\)\.]", "", raw_phone.strip())

    if cleaned.startswith("+91"):
        digits = cleaned[3:]
    elif cleaned.startswith("91") and len(cleaned) == 12:
        digits = cleaned[2:]
    elif cleaned.startswith("0") and len(cleaned) == 11:
        digits = cleaned[1:]
    elif cleaned.startswith("+"):
        digits = cleaned[1:]
    else:
        digits = cleaned

    # Valid Indian mobile number must be exactly 10 digits starting with 6, 7, 8, or 9
    if not (len(digits) == 10 and digits.isdigit() and digits[0] in "6789"):
        raise ValueError("Invalid Indian mobile number. Please enter a valid 10-digit number starting with 6, 7, 8, or 9.")

    return f"+91{digits}"


def get_phone_10_digit(canonical_phone: str) -> str:
    """Extract raw 10 digits from canonical +91 format."""
    if canonical_phone.startswith("+91"):
        return canonical_phone[3:]
    return canonical_phone[-10:]


def generate_otp(length: int = 6) -> str:
    """
    Generate a cryptographically secure numeric OTP using secrets.
    Default 6 digits: 100000 - 999999.
    """
    return str(secrets.randbelow(900000) + 100000)


def hash_otp(phone: str, otp: str) -> str:
    """
    Compute cryptographic HMAC-SHA256 hash of OTP bound to the normalized phone number.
    Uses server JWT_SECRET_KEY as salt. Plaintext OTP is never stored in the database.
    """
    key = JWT_SECRET_KEY.encode("utf-8")
    msg = f"{phone}:{otp}".encode("utf-8")
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


def verify_otp_hash(phone: str, otp: str, stored_hash: str) -> bool:
    """Constant-time verification of OTP against stored cryptographic hash."""
    computed = hash_otp(phone, otp)
    return hmac.compare_digest(computed, stored_hash)


def send_otp_sms(phone: str, otp: str) -> Tuple[bool, str]:
    """
    Deliver OTP via configured SMS provider.
    Supported providers:
      - fast2sms: via Fast2SMS Quick / OTP API
      - twilio: via Twilio Programmable SMS REST API
    
    If credentials are missing:
      - In production: securely returns failure (never fakes delivery).
      - In development: logs OTP to server console ONLY for local testing.
    """
    provider = SMS_PROVIDER.lower().strip()
    raw_10 = get_phone_10_digit(phone)
    sms_text = f"Your Amit Mobile Shop verification code is {otp}. Valid for 5 minutes. Do not share this code."

    # 1. Fast2SMS Provider Integration
    if provider == "fast2sms" or FAST2SMS_API_KEY:
        if not FAST2SMS_API_KEY:
            return False, "Fast2SMS API key is not configured."
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            headers = {
                "authorization": FAST2SMS_API_KEY,
                "Content-Type": "application/json"
            }
            payload = {
                "route": "otp",
                "variables_values": otp,
                "numbers": raw_10
            }
            resp = requests.post(url, json=payload, headers=headers, timeout=10)
            data = resp.json()
            if resp.ok and data.get("return") is True:
                return True, "OTP delivered successfully via Fast2SMS."
            err_msg = data.get("message", ["SMS dispatch failed"])[0] if isinstance(data.get("message"), list) else str(data.get("message", "SMS dispatch failed"))
            return False, f"Fast2SMS error: {err_msg}"
        except Exception as e:
            return False, f"Fast2SMS connection error: {str(e)}"

    # 2. Twilio Provider Integration
    if provider == "twilio" or (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN):
        if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER):
            return False, "Twilio credentials (SID, Token, or From Number) are incomplete."
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
            auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            data = {
                "To": phone,
                "From": TWILIO_FROM_NUMBER,
                "Body": sms_text
            }
            resp = requests.post(url, data=data, auth=auth, timeout=10)
            if resp.status_code in [200, 201]:
                return True, "OTP delivered successfully via Twilio."
            return False, f"Twilio error: HTTP {resp.status_code}"
        except Exception as e:
            return False, f"Twilio connection error: {str(e)}"

    # 3. No live credentials configured
    if IS_PRODUCTION:
        return False, "SMS provider credentials are required for real OTP delivery."

    # In local development mode: securely log to server console for testing
    print(f"\n[DEV_SMS_GATEWAY] Mobile: {phone} | OTP: {otp} | Note: Not exposed to client API response\n")
    return True, "OTP sent successfully (Development mode: check server console)"

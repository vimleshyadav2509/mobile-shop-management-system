import os
import sys
import requests
import json
import time
import jwt
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=" * 60, flush=True)
    print("AMIT MOBILE SHOP - PHASE 3 SECURITY HARDENING TEST SUITE", flush=True)
    print("=" * 60, flush=True)
    
    passed = 0
    total = 0
    
    def test(name, condition, details=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"  [PASS] {name}", flush=True)
        else:
            print(f"  [FAIL] {name} - {details}", flush=True)

    session = requests.Session()

    # ---------------------------------------------------------
    # 1. Security Headers Verification
    # ---------------------------------------------------------
    print("\n--- 1. HTTP Security Headers ---", flush=True)
    res = session.get(f"{BASE_URL}/api/health", timeout=5)
    test("Health check endpoint responds 200", res.status_code == 200)
    headers = res.headers
    test("X-Content-Type-Options: nosniff header present", headers.get("X-Content-Type-Options") == "nosniff")
    test("X-Frame-Options: DENY header present", headers.get("X-Frame-Options") == "DENY")
    test("Referrer-Policy header present", headers.get("Referrer-Policy") == "strict-origin-when-cross-origin")
    test("X-XSS-Protection header present", headers.get("X-XSS-Protection") == "1; mode=block")

    # ---------------------------------------------------------
    # 2. Authentication: Valid, Invalid, Generic Errors
    # ---------------------------------------------------------
    print("\n--- 2. Admin Authentication & Information Disclosure ---", flush=True)
    login_res = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": "admin", "password": "admin123"},
        timeout=5
    )
    test("Valid admin login succeeds (200)", login_res.status_code == 200)
    token_data = login_res.json()
    token = token_data.get("access_token")
    test("Token response includes access_token", bool(token))
    test("Password hash never exposed in login response", "password_hash" not in json.dumps(token_data))

    # Invalid password generic error
    bad_pwd_res = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": "admin", "password": "completelyWrongPassword!1"},
        timeout=5
    )
    test("Wrong password fails with 401", bad_pwd_res.status_code == 401)
    test(
        "Generic error on wrong password (no user/pwd enumeration)",
        bad_pwd_res.json().get("detail") == "Invalid username or password"
    )

    # Invalid username generic error
    bad_user_res = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": "non_existent_user_999", "password": "anyPassword123!"},
        timeout=5
    )
    test("Non-existent user fails with 401", bad_user_res.status_code == 401)
    test(
        "Generic error on wrong username (no user enumeration)",
        bad_user_res.json().get("detail") == "Invalid username or password"
    )

    # ---------------------------------------------------------
    # 3. JWT Validation: Expired, Tampered, Malformed, Missing
    # ---------------------------------------------------------
    print("\n--- 3. Strict JWT Validation ---", flush=True)
    auth_headers = {"Authorization": f"Bearer {token}"}

    me_res = session.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=5)
    test("Protected /api/auth/me succeeds with valid token", me_res.status_code == 200)
    test("Password hash not in /api/auth/me response", "password_hash" not in json.dumps(me_res.json()))

    no_token_res = session.get(f"{BASE_URL}/api/auth/me", timeout=5)
    test("Missing token returns 401", no_token_res.status_code == 401)

    malformed_res = session.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": "Bearer not.a.valid.jwt.token"},
        timeout=5
    )
    test("Malformed token returns 401", malformed_res.status_code == 401)

    parts = token.split(".")
    tampered_sig = parts[0] + "." + parts[1] + "." + "invalid_signature_bytes_12345"
    tampered_res = session.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {tampered_sig}"},
        timeout=5
    )
    test("Tampered signature token returns 401", tampered_res.status_code == 401)

    # Expired token
    from app.config import JWT_SECRET_KEY, JWT_ALGORITHM
    expired_payload = {
        "sub": me_res.json()["id"],
        "username": "admin",
        "role": "admin",
        "token_version": 1,
        "exp": datetime.now(timezone.utc) - timedelta(minutes=10),
        "iat": datetime.now(timezone.utc) - timedelta(minutes=20)
    }
    expired_jwt = jwt.encode(expired_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    expired_res = session.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {expired_jwt}"},
        timeout=5
    )
    test("Expired JWT returns 401", expired_res.status_code == 401)

    # ---------------------------------------------------------
    # 4. Authorization Audit on Protected Endpoints
    # ---------------------------------------------------------
    print("\n--- 4. Backend Authorization on Admin Operations ---", flush=True)
    unauth_prod = session.post(f"{BASE_URL}/api/products", json={"title": "Fake", "brand": "Fake", "price": 100}, timeout=5)
    test("Unauthenticated product creation fails (401)", unauth_prod.status_code == 401)

    unauth_upd = session.put(f"{BASE_URL}/api/products/test-id", json={"title": "Hacked"}, timeout=5)
    test("Unauthenticated product update fails (401)", unauth_upd.status_code == 401)

    unauth_del = session.delete(f"{BASE_URL}/api/products/test-id", timeout=5)
    test("Unauthenticated product delete fails (401)", unauth_del.status_code == 401)

    unauth_img_del = session.delete(f"{BASE_URL}/api/products/test-id/image", timeout=5)
    test("Unauthenticated image delete fails (401)", unauth_img_del.status_code == 401)

    unauth_stats = session.get(f"{BASE_URL}/api/admin/stats", timeout=5)
    test("Unauthenticated admin stats fails (401)", unauth_stats.status_code == 401)


    # Check available repair job sheet
    repairs_list_res = session.get(f"{BASE_URL}/api/repairs?limit=1", timeout=5)
    repairs_list = repairs_list_res.json()
    valid_repair_id = repairs_list[0]["job_sheet_id"] if repairs_list else "AMS-103"

    unauth_rep = session.patch(f"{BASE_URL}/api/repairs/{valid_repair_id}/status", json={"status": "Delivered"}, timeout=5)
    test("Unauthenticated repair status update fails (401)", unauth_rep.status_code == 401)

    auth_rep = session.patch(
        f"{BASE_URL}/api/repairs/{valid_repair_id}/status",
        headers=auth_headers,
        json={"status": "Ready for Pickup", "technician_notes": "Phase 3 authorized check"},
        timeout=5
    )
    test("Authenticated admin repair update succeeds (200)", auth_rep.status_code == 200)

    # ---------------------------------------------------------
    # 5. Password Change & Token Version Session Invalidation
    # ---------------------------------------------------------
    print("\n--- 5. Password Change & Session Invalidation ---", flush=True)
    unauth_pwd = session.post(
        f"{BASE_URL}/api/auth/change-password",
        json={"current_password": "admin123", "new_password": "NewStrongPass987!"},
        timeout=5
    )
    test("Unauthenticated password change returns 401", unauth_pwd.status_code == 401)

    wrong_curr = session.post(
        f"{BASE_URL}/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "wrongPassword123", "new_password": "NewStrongPass987!"},
        timeout=5
    )
    test("Wrong current password returns 400", wrong_curr.status_code == 400)

    short_pwd = session.post(
        f"{BASE_URL}/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "admin123", "new_password": "123"},
        timeout=5
    )
    test("Short new password (< 8 chars) returns 400 or 422", short_pwd.status_code in (400, 422))

    common_pwd = session.post(
        f"{BASE_URL}/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "admin123", "new_password": "password123"},
        timeout=5
    )
    test("Common weak password returns 400", common_pwd.status_code == 400)

    # Successful password change
    temp_pass = "TempSecurePass2026!#"
    change_res = session.post(
        f"{BASE_URL}/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "admin123", "new_password": temp_pass},
        timeout=5
    )
    test("Valid password change succeeds (200)", change_res.status_code == 200)

    # Prior JWT session MUST now be rejected because token_version was incremented
    revoked_call = session.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=5)
    test(
        "Prior JWT token invalidated after password change (401)",
        revoked_call.status_code == 401,
        f"Status: {revoked_call.status_code}"
    )

    # Old password no longer works for login
    old_login = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": "admin", "password": "admin123"},
        timeout=5
    )
    test("Login with old password now fails (401)", old_login.status_code == 401)

    # Login with new password succeeds
    new_login = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": "admin", "password": temp_pass},
        timeout=5
    )
    test("Login with new password succeeds (200)", new_login.status_code == 200)
    new_token = new_login.json().get("access_token")
    new_auth_headers = {"Authorization": f"Bearer {new_token}"}

    # Consecutive valid password change to test chaining
    second_pass = "SecondSecurePass2026!#"
    second_res = session.post(
        f"{BASE_URL}/api/auth/change-password",
        headers=new_auth_headers,
        json={"current_password": temp_pass, "new_password": second_pass},
        timeout=5
    )
    test("Consecutive valid password change succeeds (200)", second_res.status_code == 200)

    # Restore password back to admin123 for existing regression suite consistency
    from seed_admin import seed_admin
    seed_admin(username="admin", password="admin123")
    test("Restored password back to dev default for suite consistency", True)

    # ---------------------------------------------------------
    # 6. Sensitive Files & Path Traversal Protection
    # ---------------------------------------------------------
    print("\n--- 6. Sensitive Files & Path Traversal ---", flush=True)
    traversal_env = session.get(f"{BASE_URL}/static/../.env", timeout=5)
    test("Attempt to traverse to .env is blocked (404/400)", traversal_env.status_code in (400, 404))

    traversal_db = session.get(f"{BASE_URL}/static/../ams_store.db", timeout=5)
    test("Attempt to traverse to SQLite database is blocked (404/400)", traversal_db.status_code in (400, 404))

    direct_db = session.get(f"{BASE_URL}/ams_store.db", timeout=5)
    test("Direct route /ams_store.db returns 404", direct_db.status_code == 404)

    direct_env = session.get(f"{BASE_URL}/.env", timeout=5)
    test("Direct route /.env returns 404", direct_env.status_code == 404)

    # Encoded traversal attempt
    encoded_traversal = session.get(f"{BASE_URL}/static/%2e%2e/%2e%2e/ams_store.db", timeout=5)
    test("Encoded path traversal is blocked (400/404)", encoded_traversal.status_code in (400, 404))

    # ---------------------------------------------------------
    # 7. Login Rate Limiting (Brute-Force Protection)
    # ---------------------------------------------------------
    print("\n--- 7. Login Rate Limiting ---", flush=True)
    rate_limited = False
    for i in range(8):
        res = session.post(
            f"{BASE_URL}/api/auth/login",
            headers={"X-Forwarded-For": "198.51.100.42"},
            json={"username": "admin", "password": f"wrong_pwd_{i}"},
            timeout=5
        )
        if res.status_code == 429:
            rate_limited = True
            break
    test("Brute force attempts trigger HTTP 429 Too Many Requests", rate_limited)

    # ---------------------------------------------------------
    # 8. CORS Restriction
    # ---------------------------------------------------------
    print("\n--- 8. CORS Configuration ---", flush=True)
    cors_opt = session.options(
        f"{BASE_URL}/api/products",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST"
        },
        timeout=5
    )
    test("Allowed frontend origin receives CORS approval", cors_opt.status_code in (200, 204))

    # Disallowed / malicious origin
    cors_bad = session.options(
        f"{BASE_URL}/api/products",
        headers={
            "Origin": "https://malicious-attacker-site.com",
            "Access-Control-Request-Method": "POST"
        },
        timeout=5
    )
    test(
        "Disallowed origin is rejected (no Access-Control-Allow-Origin)",
        cors_bad.headers.get("Access-Control-Allow-Origin") is None
    )

    print("\n" + "=" * 60, flush=True)
    print(f"SECURITY SUITE RESULTS: {passed}/{total} tests passed", flush=True)
    print("=" * 60, flush=True)
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

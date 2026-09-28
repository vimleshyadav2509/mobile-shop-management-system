import os
import sys
import pytest

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import get_connection, init_db, get_admin_by_username
from app.security import verify_password
from seed_admin import seed_admin

client = TestClient(app)

def run_suite():
    print("[*] Starting Local Test Suite for Admin Credentials Update...")

    new_username = "Amit_MS2026"
    test_password = os.getenv("TEST_ADMIN_CREDENTIAL_SECRET")
    assert test_password, "TEST_ADMIN_CREDENTIAL_SECRET environment variable must be set"

    # Step 0: Ensure DB initialized and seed/update admin to new credentials
    seed_admin(username=new_username, password=test_password)
    print("[PASS] Seeded/updated admin credentials in database.")

    # Check 1: Verify exactly one admin in DB and username is Amit_MS2026
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, password_hash, token_version FROM admin_users")
    admins = cursor.fetchall()
    conn.close()

    assert len(admins) == 1, f"Expected 1 admin, found {len(admins)}"
    admin_record = admins[0]
    assert admin_record["username"] == new_username, f"Expected {new_username}, got {admin_record['username']}"
    assert verify_password(test_password, admin_record["password_hash"]), "Stored password hash failed verification"
    print("[PASS] DB state verified: Exactly 1 admin account with correct username and secure bcrypt hash.")

    # 1 & 2: Admin login with new username and new password succeeds
    res_login = client.post("/api/auth/login", json={"username": new_username, "password": test_password})
    assert res_login.status_code == 200, f"Login failed with status {res_login.status_code}: {res_login.text}"
    data = res_login.json()
    token = data.get("access_token")
    assert token, "Missing access_token in response"
    assert data["admin"]["username"] == new_username, "Username mismatch in login response"
    print("[PASS] 1 & 2: Login with new username & new password succeeded (200 OK).")

    # 3: Wrong password fails with 401
    res_wrong_pw = client.post("/api/auth/login", json={"username": new_username, "password": "WrongPassword999!"})
    assert res_wrong_pw.status_code == 401, f"Expected 401, got {res_wrong_pw.status_code}"
    print("[PASS] 3: Wrong password rejected with 401 Unauthorized.")

    # 4: Old username does not authenticate
    res_old_user = client.post("/api/auth/login", json={"username": "admin", "password": test_password})
    assert res_old_user.status_code == 401, f"Expected 401, got {res_old_user.status_code}"
    res_old_user_old_pw = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert res_old_user_old_pw.status_code == 401, f"Expected 401, got {res_old_user_old_pw.status_code}"
    print("[PASS] 4: Old username ('admin') does not authenticate.")

    # 5: Existing authentication/JWT behavior still works
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200, f"Expected 200 from /api/auth/me, got {res_me.status_code}"
    assert res_me.json()["username"] == new_username
    res_stats = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
    assert res_stats.status_code == 200, f"Expected 200 from /api/admin/stats, got {res_stats.status_code}"
    print("[PASS] 5: JWT authentication and protected admin routes work correctly.")

    # 6: Unauthorized users cannot access admin endpoints
    res_unauth = client.get("/api/admin/stats")
    assert res_unauth.status_code == 401, f"Expected 401, got {res_unauth.status_code}"
    res_unauth_me = client.get("/api/auth/me")
    assert res_unauth_me.status_code == 401, f"Expected 401, got {res_unauth_me.status_code}"
    print("[PASS] 6: Unauthorized users blocked with 401.")

    # 7: Existing product APIs still work
    res_products = client.get("/api/products")
    assert res_products.status_code == 200, f"Expected 200, got {res_products.status_code}"
    products = res_products.json()
    assert isinstance(products, list)
    print(f"[PASS] 7: Public products API works correctly ({len(products)} products found).")

    # 8: Existing repair APIs still work
    res_repair = client.get("/api/repairs/AMS-101")
    assert res_repair.status_code in (200, 404), f"Unexpected status {res_repair.status_code}"
    print("[PASS] 8: Repair tracking API operational.")

    print("\n=======================================================")
    print(">>> ALL 8 MANDATORY VERIFICATION CHECKS PASSED 100% <<<")
    print("=======================================================")

if __name__ == "__main__":
    run_suite()

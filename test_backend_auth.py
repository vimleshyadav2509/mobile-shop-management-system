import requests
import sys

BASE = "http://localhost:8000"

def test_auth():
    print("[*] Testing Admin Authentication Endpoints on:", BASE)
    
    # 1. Invalid login attempt
    print("\n--- 1. Testing Invalid Credentials ---")
    r1 = requests.post(f"{BASE}/api/auth/login", json={"username": "admin", "password": "wrong_password"})
    print(f"Status Code: {r1.status_code}")
    print(f"Response: {r1.json()}")
    assert r1.status_code == 401, f"Expected 401 but got {r1.status_code}"
    print("[PASS] Invalid credentials properly rejected with 401.")

    # 2. Valid login attempt
    print("\n--- 2. Testing Valid Admin Login ---")
    r2 = requests.post(f"{BASE}/api/auth/login", json={"username": "admin", "password": "adminpassword123"})
    print(f"Status Code: {r2.status_code}")
    assert r2.status_code == 200, f"Expected 200 but got {r2.status_code}"
    data = r2.json()
    token = data.get("access_token")
    admin = data.get("admin")
    assert token, "Token not found in response"
    assert "password_hash" not in admin, "Security leak: password_hash returned!"
    print(f"[PASS] Successfully logged in! Received token and profile for: {admin['username']} ({admin['role']})")

    # 3. Protected endpoint without token
    print("\n--- 3. Testing Protected /api/auth/me without Token ---")
    r3 = requests.get(f"{BASE}/api/auth/me")
    print(f"Status Code: {r3.status_code}")
    assert r3.status_code == 401, f"Expected 401 but got {r3.status_code}"
    print("[PASS] Unauthenticated access to /me properly blocked with 401.")

    # 4. Protected endpoint with token
    print("\n--- 4. Testing Protected /api/auth/me with Bearer Token ---")
    r4 = requests.get(f"{BASE}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    print(f"Status Code: {r4.status_code}")
    print(f"Response: {r4.json()}")
    assert r4.status_code == 200, f"Expected 200 but got {r4.status_code}"
    assert r4.json()["username"] == "admin"
    print("[PASS] Authenticated access to /me returned correct admin data.")

    # 5. Protected /api/admin/stats with token
    print("\n--- 5. Testing Protected /api/admin/stats with Bearer Token ---")
    r5 = requests.get(f"{BASE}/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
    print(f"Status Code: {r5.status_code}")
    print(f"Stats: {r5.json()}")
    assert r5.status_code == 200, f"Expected 200 but got {r5.status_code}"
    stats = r5.json()
    assert "total_products" in stats and "in_stock_products" in stats
    assert "total_repairs" in stats and "pending_repairs" in stats
    print(f"[PASS] Real database stats retrieved: {stats}")

    # 6. Protected /api/admin/stats without token
    print("\n--- 6. Testing Protected /api/admin/stats without Token ---")
    r6 = requests.get(f"{BASE}/api/admin/stats")
    assert r6.status_code == 401, f"Expected 401 but got {r6.status_code}"
    print("[PASS] Access without token rejected with 401.")

    print("\n==========================================")
    print(">>> ALL BACKEND AUTH TESTS PASSED 100% <<<")
    print("==========================================")

if __name__ == "__main__":
    try:
        test_auth()
    except Exception as e:
        print("[-] TEST FAILED:", e)
        sys.exit(1)

import os
import sys
import requests
import sqlite3

BACKEND_URL = "http://localhost:8000"
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "ams_store.db")

def test_phase4():
    print("============================================================")
    print(">>> RUNNING PHASE 4 BUSINESS MANAGEMENT TEST SUITE <<<")
    print("============================================================")

    # 1. Admin Login
    print("\n[1] Admin authentication...")
    r_login = requests.post(f"{BACKEND_URL}/api/auth/login", json={"username": "admin", "password": "admin123"}, timeout=5)
    assert r_login.status_code == 200, f"Login failed: {r_login.text}"
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("    [PASS] Admin token obtained.")

    # 2. Phase 4.1: Inventory Stock Status & Count
    print("\n[2] Testing Inventory Management (Stock Count & Automated Status)...")
    
    # 2a. Product with stock_count = 10 -> IN STOCK
    p_instock = {
        "title": "Phase4 Test Phone InStock",
        "brand": "Realme",
        "model": "P4-InStock",
        "category": "Smartphones",
        "variant": "8GB / 256GB Gold Edition",
        "condition": "new",
        "price": 18999.0,
        "stock_count": 10
    }
    r = requests.post(f"{BACKEND_URL}/api/products", json=p_instock, headers=headers, timeout=5)
    assert r.status_code == 201, f"Create failed: {r.text}"
    p1 = r.json()
    assert p1["stock_count"] == 10
    assert p1["stock_status"] == "IN STOCK"
    assert p1["in_stock"] == True
    print(f"    [PASS] stock_count=10 computed stock_status='{p1['stock_status']}'.")

    # 2b. Product with stock_count = 3 -> LOW STOCK
    p_lowstock = {
        "title": "Phase4 Test Phone LowStock",
        "brand": "Xiaomi",
        "model": "P4-LowStock",
        "condition": "new",
        "price": 14999.0,
        "stock_count": 3
    }
    r = requests.post(f"{BACKEND_URL}/api/products", json=p_lowstock, headers=headers, timeout=5)
    assert r.status_code == 201
    p2 = r.json()
    assert p2["stock_count"] == 3
    assert p2["stock_status"] == "LOW STOCK"
    assert p2["in_stock"] == True
    print(f"    [PASS] stock_count=3 computed stock_status='{p2['stock_status']}'.")

    # 2c. Product with stock_count = 0 -> OUT OF STOCK
    p_outstock = {
        "title": "Phase4 Test Phone OutOfStock",
        "brand": "Vivo",
        "model": "P4-OutStock",
        "condition": "new",
        "price": 22999.0,
        "stock_count": 0
    }
    r = requests.post(f"{BACKEND_URL}/api/products", json=p_outstock, headers=headers, timeout=5)
    assert r.status_code == 201
    p3 = r.json()
    assert p3["stock_count"] == 0
    assert p3["stock_status"] == "OUT OF STOCK"
    assert p3["in_stock"] == False
    print(f"    [PASS] stock_count=0 computed stock_status='{p3['stock_status']}' and in_stock=False.")

    # 2d. Product with stock_status = COMING SOON
    p_coming = {
        "title": "Phase4 Test Phone ComingSoon",
        "brand": "Apple",
        "model": "iPhone 16 Pro Max",
        "condition": "new",
        "price": 144999.0,
        "stock_count": 0,
        "stock_status": "COMING SOON"
    }
    r = requests.post(f"{BACKEND_URL}/api/products", json=p_coming, headers=headers, timeout=5)
    assert r.status_code == 201
    p4 = r.json()
    assert p4["stock_status"] == "COMING SOON"
    print(f"    [PASS] Manual 'COMING SOON' preserved: stock_status='{p4['stock_status']}'.")

    # 2e. Update stock_count from 10 to 2 -> transitions to LOW STOCK
    r = requests.put(f"{BACKEND_URL}/api/products/{p1['id']}", json={"stock_count": 2}, headers=headers, timeout=5)
    assert r.status_code == 200
    p1_updated = r.json()
    assert p1_updated["stock_count"] == 2
    assert p1_updated["stock_status"] == "LOW STOCK"
    print(f"    [PASS] Updating stock_count to 2 dynamically transitioned status to '{p1_updated['stock_status']}'.")

    # Clean up test products
    for pid in [p1["id"], p2["id"], p3["id"], p4["id"]]:
        requests.delete(f"{BACKEND_URL}/api/products/{pid}", headers=headers, timeout=5)
    print("    [PASS] Test inventory items cleaned up.")

    # 3. Phase 4.2: Repair Management UX & Status History
    print("\n[3] Testing Repair Status History & 'Waiting for Approval'...")
    r = requests.get(f"{BACKEND_URL}/api/repairs", timeout=5)
    assert r.status_code == 200
    repairs = r.json()
    target_repair = repairs[0]
    rep_id = target_repair["job_sheet_id"]

    # Transition to 'Waiting for Approval'
    r_patch = requests.patch(
        f"{BACKEND_URL}/api/repairs/{rep_id}/status",
        json={"status": "Waiting for Approval", "technician_notes": "Awaiting customer quotation confirmation."},
        headers=headers,
        timeout=5
    )
    assert r_patch.status_code == 200
    assert r_patch.json()["status"] == "Waiting for Approval"
    print("    [PASS] 'Waiting for Approval' status accepted and stored.")

    # Fetch status history
    r_hist = requests.get(f"{BACKEND_URL}/api/repairs/{rep_id}/history", timeout=5)
    assert r_hist.status_code == 200
    history = r_hist.json()
    assert isinstance(history, list) and len(history) > 0
    latest_step = history[-1]
    assert latest_step["new_status"] == "Waiting for Approval"
    print(f"    [PASS] History retrieved with {len(history)} transitions. Latest: '{latest_step['new_status']}'.")

    # Also verify history is included in single repair GET
    r_single = requests.get(f"{BACKEND_URL}/api/repairs/{rep_id}", timeout=5)
    assert r_single.status_code == 200
    assert "history" in r_single.json()
    assert len(r_single.json()["history"]) == len(history)
    print("    [PASS] GET /api/repairs/{id} includes embedded timeline history.")

    # 4. Phase 4.3: Database-backed EMI Management
    print("\n[4] Testing Database-backed EMI Management...")
    # Public list
    r_emi = requests.get(f"{BACKEND_URL}/api/emi", timeout=5)
    assert r_emi.status_code == 200
    emi_plans = r_emi.json()
    assert len(emi_plans) >= 5
    print(f"    [PASS] Retrieved {len(emi_plans)} active EMI plans via public API.")

    # Unauthorized creation blocked
    r_unauth = requests.post(f"{BACKEND_URL}/api/emi", json={
        "provider": "Fraud Bank",
        "duration_months": 6,
        "monthly_emi": 1000.0
    }, timeout=5)
    assert r_unauth.status_code == 401
    print("    [PASS] Unauthorized EMI creation rejected with 401.")

    # Admin creates new EMI plan
    new_plan_data = {
        "provider": "Kotak SmartEMI",
        "duration_months": 9,
        "down_payment": 999.0,
        "monthly_emi": 3199.0,
        "processing_fee": 149.0,
        "interest_rate": 2.0,
        "available": True
    }
    r_create_emi = requests.post(f"{BACKEND_URL}/api/emi", json=new_plan_data, headers=headers, timeout=5)
    assert r_create_emi.status_code == 201
    created_plan = r_create_emi.json()
    assert created_plan["provider"] == "Kotak SmartEMI"
    assert created_plan["duration_months"] == 9
    plan_id = created_plan["id"]
    print(f"    [PASS] Admin created EMI plan '{created_plan['provider']}' (ID: {plan_id}).")

    # Admin updates EMI plan
    r_update_emi = requests.put(f"{BACKEND_URL}/api/emi/{plan_id}", json={"monthly_emi": 3099.0}, headers=headers, timeout=5)
    assert r_update_emi.status_code == 200
    assert r_update_emi.json()["monthly_emi"] == 3099.0
    print("    [PASS] Admin updated EMI plan.")

    # Admin deletes EMI plan
    r_del_emi = requests.delete(f"{BACKEND_URL}/api/emi/{plan_id}", headers=headers, timeout=5)
    assert r_del_emi.status_code == 200
    print("    [PASS] Admin deleted test EMI plan.")

    # 5. Phase 4.4: Dynamic Shop Settings
    print("\n[5] Testing Dynamic Shop Settings...")
    # Public get
    r_settings = requests.get(f"{BACKEND_URL}/api/settings", timeout=5)
    assert r_settings.status_code == 200
    settings_data = r_settings.json()
    assert "shop_name" in settings_data
    assert "phone1" in settings_data
    assert "opening_time" in settings_data
    orig_tagline = settings_data.get("tagline")
    print(f"    [PASS] Shop settings retrieved: '{settings_data['shop_name']}', Phone: {settings_data['phone1']}.")

    # Unauthorized update blocked
    r_unauth_set = requests.put(f"{BACKEND_URL}/api/settings", json={"tagline": "Hacked Tagline"}, timeout=5)
    assert r_unauth_set.status_code == 401
    print("    [PASS] Unauthorized shop settings update rejected with 401.")

    # Admin updates settings
    r_update_set = requests.put(f"{BACKEND_URL}/api/settings", json={
        "tagline": "Kuk Nagar Grint Rd, Khorare - Premier Mobile & Express Repair Hub"
    }, headers=headers, timeout=5)
    assert r_update_set.status_code == 200
    assert "Premier Mobile & Express Repair Hub" in r_update_set.json()["tagline"]
    print("    [PASS] Shop settings updated successfully by Admin.")

    # Restore original tagline
    if orig_tagline:
        requests.put(f"{BACKEND_URL}/api/settings", json={"tagline": orig_tagline}, headers=headers, timeout=5)

    # 6. Phase 4.5: Operational Admin Dashboard Stats
    print("\n[6] Testing Real Operational Admin Dashboard Metrics...")
    r_stats = requests.get(f"{BACKEND_URL}/api/admin/stats", headers=headers, timeout=5)
    assert r_stats.status_code == 200
    stats = r_stats.json()
    # Check original 4 keys preserved
    assert "total_products" in stats
    assert "in_stock_products" in stats
    assert "total_repairs" in stats
    assert "pending_repairs" in stats
    # Check new Phase 4 keys
    assert "low_stock_products" in stats
    assert "out_of_stock_products" in stats
    assert "status_breakdown" in stats
    assert "recent_products" in stats
    assert "recent_repairs" in stats
    
    sb = stats["status_breakdown"]
    assert "Received" in sb
    assert "In Repair" in sb
    assert "Waiting for Approval" in sb
    assert "Ready for Pickup" in sb
    assert "Delivered" in sb
    print(f"    [PASS] Real Dashboard metrics verified:")
    print(f"           Products: Total={stats['total_products']}, InStock={stats['in_stock_products']}, LowStock={stats['low_stock_products']}, OutOfStock={stats['out_of_stock_products']}")
    print(f"           Repairs: Total={stats['total_repairs']}, Pending={stats['pending_repairs']}")
    print(f"           Repair Breakdown: {stats['status_breakdown']}")

    print("\n============================================================")
    print(">>> ALL PHASE 4 BUSINESS MANAGEMENT TESTS PASSED (100%) <<<")
    print("============================================================")

if __name__ == "__main__":
    test_phase4()

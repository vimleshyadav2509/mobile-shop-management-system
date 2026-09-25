import sqlite3
import os
import sys
import requests

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "ams_store.db")

def run_tests():
    print("=============================================================")
    print(">>> RUNNING AMIT MOBILE SHOP PERSISTENT REPAIR TESTS <<<")
    print("=============================================================")

    # 1. Admin login works
    print("\n[1] Testing Admin Login...")
    r_login = requests.post(f"{BACKEND_URL}/api/auth/login", json={"username": "admin", "password": "admin123"}, timeout=5)
    assert r_login.status_code == 200, f"Login failed: {r_login.text}"
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("    [PASS] Admin login succeeded. Received valid JWT.")

    # 2. Existing repair can be fetched via GET /api/repairs
    print("\n[2] Fetching existing repair tickets via GET /api/repairs...")
    r_repairs = requests.get(f"{BACKEND_URL}/api/repairs", timeout=5)
    assert r_repairs.status_code == 200, f"Failed to list repairs: {r_repairs.text}"
    repairs_list = r_repairs.json()
    assert isinstance(repairs_list, list) and len(repairs_list) > 0, "No repairs returned from API"
    target_job = repairs_list[0]
    target_id = target_job["job_sheet_id"] # e.g. "AMS-101"
    original_status = target_job["status"]
    print(f"    [PASS] Retrieved {len(repairs_list)} repairs. Selected target: {target_id} (current status: '{original_status}').")

    # 3. Customer tracking initially shows current status
    print(f"\n[3] Checking Customer Tracking GET /api/repairs/{target_id} before update...")
    r_track_init = requests.get(f"{BACKEND_URL}/api/repairs/{target_id}", timeout=5)
    assert r_track_init.status_code == 200
    assert r_track_init.json()["status"] == original_status
    print(f"    [PASS] Customer tracking returns status '{r_track_init.json()['status']}'.")

    # 4. Admin updates repair status to 'Ready for Pickup'
    print(f"\n[4] Admin updating repair status for {target_id} to 'Ready for Pickup'...")
    new_status = "Ready for Pickup"
    notes = "Screen replaced and tested thoroughly at Amit Mobile Shop counter."
    r_patch = requests.patch(
        f"{BACKEND_URL}/api/repairs/{target_id}/status",
        json={"status": new_status, "technician_notes": notes},
        headers=headers,
        timeout=5
    )
    assert r_patch.status_code == 200, f"Status update failed: {r_patch.text}"
    patch_data = r_patch.json()
    assert patch_data["status"] == new_status, f"Expected '{new_status}', got '{patch_data['status']}'"
    assert patch_data["technician_notes"] == notes
    print(f"    [PASS] PATCH endpoint returned 200 OK with updated status: '{patch_data['status']}'.")

    # 5. Database actually changes: verify directly in SQLite
    print(f"\n[5] Verifying persistent change directly in SQLite database ({DB_PATH})...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT status, technician_notes FROM repair_jobs WHERE UPPER(job_sheet_id) = UPPER(?)", (target_id,))
    row = cursor.fetchone()
    conn.close()
    assert row is not None, f"Job sheet {target_id} not found in SQLite table!"
    assert row[0] == new_status, f"Database has '{row[0]}', expected '{new_status}'"
    assert row[1] == notes
    print(f"    [PASS] Verified directly in SQLite table: status='{row[0]}', notes='{row[1]}'.")

    # 6. Customer tracking API returns new status
    print(f"\n[6] Verifying Customer Tracking GET /api/repairs/{target_id} returns updated status...")
    r_track_updated = requests.get(f"{BACKEND_URL}/api/repairs/{target_id}", timeout=5)
    assert r_track_updated.status_code == 200
    assert r_track_updated.json()["status"] == new_status
    assert r_track_updated.json()["technician_notes"] == notes
    print(f"    [PASS] Customer tracking API returns '{r_track_updated.json()['status']}' with updated technician notes.")

    # 7. Customer tracking via Frontend Vite Proxy
    print(f"\n[7] Verifying Customer Tracking via Frontend Vite Proxy (port 5173)...")
    r_vite_track = requests.get(f"{FRONTEND_URL}/api/repairs/{target_id}", timeout=5)
    assert r_vite_track.status_code == 200
    assert r_vite_track.json()["status"] == new_status
    print(f"    [PASS] Frontend Vite proxy correctly forwarded tracking request: status is '{r_vite_track.json()['status']}'.")

    # 8. Refreshing Admin page preserves new status
    print(f"\n[8] Simulating Admin Page Refresh (GET /api/repairs)...")
    r_repairs_refreshed = requests.get(f"{BACKEND_URL}/api/repairs", timeout=5)
    assert r_repairs_refreshed.status_code == 200
    refreshed_match = [r for r in r_repairs_refreshed.json() if r["job_sheet_id"] == target_id]
    assert len(refreshed_match) == 1
    assert refreshed_match[0]["status"] == new_status
    print(f"    [PASS] Status survives page refresh: '{refreshed_match[0]['status']}' loaded from database.")

    # 9. Update to 'Delivered'
    print(f"\n[9] Admin updating status to 'Delivered'...")
    r_delivered = requests.patch(
        f"{BACKEND_URL}/api/repairs/{target_id}/status",
        json={"status": "Delivered", "technician_notes": "Device handed over to customer with warranty bill.", "final_cost": 1850.0},
        headers=headers,
        timeout=5
    )
    assert r_delivered.status_code == 200
    assert r_delivered.json()["status"] == "Delivered"
    assert r_delivered.json()["final_cost"] == 1850.0
    print(f"    [PASS] Updated to 'Delivered' (final_cost: Rs. 1850.0).")

    # Verify Customer tracking reflects 'Delivered'
    r_cust_delivered = requests.get(f"{BACKEND_URL}/api/repairs/{target_id}", timeout=5)
    assert r_cust_delivered.json()["status"] == "Delivered"
    print(f"    [PASS] Customer tracking confirms 'Delivered'.")

    # 10. Invalid status is rejected
    print("\n[10] Testing Invalid Status Rejection...")
    r_invalid = requests.patch(
        f"{BACKEND_URL}/api/repairs/{target_id}/status",
        json={"status": "NotAValidStatus123"},
        headers=headers,
        timeout=5
    )
    assert r_invalid.status_code == 400, f"Expected 400 Bad Request, got {r_invalid.status_code}"
    print(f"    [PASS] Invalid status rejected with 400 Bad Request: {r_invalid.json().get('detail')}")

    # 11. Unknown repair ID returns 404
    print("\n[11] Testing Unknown Repair ID Handling...")
    r_unknown = requests.patch(
        f"{BACKEND_URL}/api/repairs/NONEXISTENT-999/status",
        json={"status": "In Repair"},
        headers=headers,
        timeout=5
    )
    assert r_unknown.status_code == 404, f"Expected 404, got {r_unknown.status_code}"
    print(f"    [PASS] Unknown repair ID correctly returned 404: {r_unknown.json().get('detail')}")

    # 12. Unauthorized request is rejected (missing / invalid token)
    print("\n[12] Testing Unauthorized Access Block...")
    r_no_auth = requests.patch(
        f"{BACKEND_URL}/api/repairs/{target_id}/status",
        json={"status": "In Repair"}
    )
    assert r_no_auth.status_code == 401, f"Expected 401 Unauthorized, got {r_no_auth.status_code}"
    print("    [PASS] Unauthenticated request blocked with 401.")

    # 13. Restore original status so test is clean
    print(f"\n[13] Restoring original status '{original_status}'...")
    r_restore = requests.patch(
        f"{BACKEND_URL}/api/repairs/{target_id}/status",
        json={"status": original_status, "technician_notes": target_job.get("technician_notes")},
        headers=headers,
        timeout=5
    )
    assert r_restore.status_code == 200
    print(f"    [PASS] Target {target_id} restored to '{original_status}'.")

    # 14. Verify Dashboard Stats reflect real database repair counts
    print("\n[14] Checking Admin Dashboard Stats Endpoint...")
    r_stats = requests.get(f"{BACKEND_URL}/api/admin/stats", headers=headers, timeout=5)
    assert r_stats.status_code == 200
    stats = r_stats.json()
    assert "total_repairs" in stats and "pending_repairs" in stats
    print(f"    [PASS] Dashboard stats: Total Repairs = {stats['total_repairs']}, Pending = {stats['pending_repairs']}.")

    print("\n=============================================================")
    print(">>> ALL PERSISTENT REPAIR TESTS PASSED WITH 100% SUCCESS! <<<")
    print("=============================================================")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\n[-] TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

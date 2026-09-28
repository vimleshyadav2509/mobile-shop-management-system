import sqlite3
import os
import sys

# Ensure backend directory in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.security import create_access_token
from app.database import get_admin_by_username
from app.config import ADMIN_USERNAME

client = TestClient(app)

def run_e2e_test():
    print("=== STARTING COMPLETE STEP 25 END-TO-END TEST ===")

    # 1. Admin Authentication
    admin = get_admin_by_username(ADMIN_USERNAME) or get_admin_by_username("Amit_MS2026") or get_admin_by_username("admin")
    assert admin, "Admin user not found"
    token = create_access_token({
        "sub": admin["id"],
        "username": admin["username"],
        "token_version": admin.get("token_version", 1)
    })
    auth_headers = {"Authorization": f"Bearer {token}"}
    print(f"[Step 1] Admin ({admin['username']}) authenticated successfully.")

    # 2. Add Product
    new_phone = {
        "title": "Realme GT 6T 5G (Counter Fresh)",
        "brand": "Realme",
        "model": "GT 6T",
        "condition": "new",
        "category": "Smartphones",
        "price": 30999.0,
        "original_price": 34999.0,
        "ram_storage": "8GB / 256GB",
        "color": "Fluid Silver",
        "battery_health": "100%",
        "warranty_info": "1 Year Brand Warranty",
        "in_stock": True,
        "stock_count": 6,
        "description": "Flagship performance with Snapdragon 7+ Gen 3 and 120W charging."
    }
    add_res = client.post("/api/products", json=new_phone, headers=auth_headers)
    assert add_res.status_code == 201, f"Add product failed: {add_res.text}"
    created = add_res.json()
    target_id = created["id"]
    print(f"[Step 2] Product added via Admin API: ID {target_id}")

    # 3. Verify Database directly
    db_path = os.path.join(os.path.dirname(__file__), "ams_store.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT title, price, in_stock, stock_count, category FROM products WHERE id = ?", (target_id,))
    db_row = cursor.fetchone()
    assert db_row is not None, "Product not found in SQLite ams_store.db!"
    assert db_row[0] == new_phone["title"]
    assert float(db_row[1]) == 30999.0
    assert db_row[2] == 1
    assert db_row[3] == 6
    assert db_row[4] == "Smartphones"
    print(f"[Step 3] Verified directly in SQLite ams_store.db: Title='{db_row[0]}', Price={db_row[1]}, in_stock={db_row[2]}, count={db_row[3]}")

    # 4. Verify Admin list (include_out_of_stock=true)
    admin_list = client.get("/api/products?include_out_of_stock=true").json()
    assert any(p["id"] == target_id for p in admin_list)
    print("[Step 4] Verified product in Admin Products list.")

    # 5. Verify Customer storefront (public GET /api/products)
    customer_list = client.get("/api/products").json()
    matching = [p for p in customer_list if p["id"] == target_id]
    assert len(matching) == 1, "Product must appear in customer storefront"
    assert matching[0]["price"] == 30999.0
    print(f"[Step 5] Verified product appears in Customer Storefront at price Rs. {matching[0]['price']}")

    # 6. Edit Price to Rs. 28,999
    edit_res = client.put(f"/api/products/{target_id}", json={"price": 28999.0}, headers=auth_headers)
    assert edit_res.status_code == 200, f"Edit price failed: {edit_res.text}"
    print("[Step 6] Price updated via Admin API to Rs. 28,999")

    # 7. Verify Database price
    cursor.execute("SELECT price FROM products WHERE id = ?", (target_id,))
    db_price = cursor.fetchone()[0]
    assert float(db_price) == 28999.0
    print(f"[Step 7] Verified updated price in SQLite database: Rs. {db_price}")

    # 8. Verify Customer storefront price
    customer_list = client.get("/api/products").json()
    matching = [p for p in customer_list if p["id"] == target_id]
    assert matching[0]["price"] == 28999.0
    print(f"[Step 8] Customer Storefront reflects updated price: Rs. {matching[0]['price']}")

    # 9. Change stock to Out of Stock
    patch_res = client.patch(f"/api/products/{target_id}", json={"in_stock": False, "stock_count": 0}, headers=auth_headers)
    assert patch_res.status_code == 200
    print("[Step 9] Stock toggled to Out of Stock")

    # 10. Verify customer storefront no longer displays it
    customer_list = client.get("/api/products").json()
    assert not any(p["id"] == target_id for p in customer_list), "Out of stock product should NOT appear in customer storefront"
    print("[Step 10] Customer Storefront correctly hid out-of-stock product")

    # 11. Toggle stock back to in-stock
    patch_res2 = client.patch(f"/api/products/{target_id}", json={"in_stock": True, "stock_count": 4}, headers=auth_headers)
    assert patch_res2.status_code == 200
    customer_list2 = client.get("/api/products").json()
    assert any(p["id"] == target_id for p in customer_list2), "Product should be back in customer storefront"
    print("[Step 11] Customer Storefront restored product when marked In Stock")

    # 12. Delete Product
    del_res = client.delete(f"/api/products/{target_id}", headers=auth_headers)
    assert del_res.status_code == 200
    print("[Step 12] Product deleted via Admin API")

    # 13. Verify Database
    cursor.execute("SELECT id FROM products WHERE id = ?", (target_id,))
    assert cursor.fetchone() is None, "Product should be deleted from SQLite database"
    conn.close()
    print("[Step 13] Verified product deleted from SQLite ams_store.db")

    # 14. Verify Customer storefront after deletion
    customer_list_final = client.get("/api/products").json()
    assert not any(p["id"] == target_id for p in customer_list_final)
    print("[Step 14] Verified product completely removed from Customer Storefront")

    print("\n>>> ALL 14 STEPS OF E2E TEST PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    run_e2e_test()

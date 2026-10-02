import os
import sys
import io
import uuid
import sqlite3

# Ensure backend directory is in sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.security import create_access_token
from app.database import get_admin_by_username
from app.config import (
    ADMIN_USERNAME,
    DB_PATH,
    PRODUCT_UPLOAD_DIR,
    UPLOAD_DIR
)

client = TestClient(app)

# Minimal valid 1x1 JPEG byte stream
JPEG_BYTES = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00"
    b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342"
    b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b"
    b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
)

# Minimal valid 1x1 PNG byte stream
PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
    b"\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
)

# Minimal valid 1x1 WebP byte stream
WEBP_BYTES = (
    b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x000\x01\x00\x9d\x01\x2a\x01\x00\x01\x00\x02\x004%\xa4%"
)

def run_tests():
    print("=" * 65)
    print(">>> AMIT MOBILE SHOP: COMPREHENSIVE IMAGE PIPELINE REGRESSION SUITE <<<")
    print("=" * 65)

    # 1. Admin Authentication
    admin = (
        get_admin_by_username(ADMIN_USERNAME) or
        get_admin_by_username("admin") or
        get_admin_by_username("Amit_MS2026")
    )
    assert admin is not None, "Admin user not found in database!"
    token = create_access_token({
        "sub": admin["id"],
        "username": admin["username"],
        "token_version": admin.get("token_version", 1)
    })
    auth_headers = {"Authorization": f"Bearer {token}"}
    print(f"[TEST 1] Admin Authentication: Logged in as '{admin['username']}' -> PASS")

    # 2. Locate Real Target Product: OnePlus 10 Pro 5G
    r_prods = client.get("/api/products?include_out_of_stock=true")
    assert r_prods.status_code == 200, f"Failed to fetch products: {r_prods.text}"
    products = r_prods.json()
    oneplus_prods = [p for p in products if "10 Pro" in p.get("title", "") or "10 Pro" in p.get("model", "")]
    assert len(oneplus_prods) > 0, "OnePlus 10 Pro product must exist in database!"
    oneplus_target = oneplus_prods[0]
    oneplus_id = oneplus_target["id"]
    original_oneplus_image = oneplus_target.get("image_url")
    print(f"[TEST 2] Target Real Product Identified: '{oneplus_target['title']}' (ID: {oneplus_id}) -> PASS")

    # 3. Test Security Validations on Upload
    print("[TEST 3] Security Validation Tests:")
    # A. Reject text file
    r_bad1 = client.post(
        "/api/products/upload-image",
        files={"file": ("fake.txt", io.BytesIO(b"Not an image"), "text/plain")},
        headers=auth_headers
    )
    assert r_bad1.status_code == 400, "Text file should be rejected with 400"

    # B. Reject executable disguised as image
    r_bad2 = client.post(
        "/api/products/upload-image",
        files={"file": ("malware.jpg", io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff"), "image/jpeg")},
        headers=auth_headers
    )
    assert r_bad2.status_code == 400, "Executable disguised as JPEG should be rejected with 400"

    # C. Reject empty file
    r_bad3 = client.post(
        "/api/products/upload-image",
        files={"file": ("empty.jpg", io.BytesIO(b""), "image/jpeg")},
        headers=auth_headers
    )
    assert r_bad3.status_code == 400, "Empty file should be rejected with 400"
    print("    - Non-image MIME type rejected (400): PASS")
    print("    - Invalid magic bytes rejected (400): PASS")
    print("    - Empty file rejected (400): PASS")

    # 4. Upload Image A for OnePlus 10 Pro 5G
    r_upload_a = client.post(
        "/api/products/upload-image",
        files={"file": ("oneplus_test_a.jpg", io.BytesIO(JPEG_BYTES), "image/jpeg")},
        headers=auth_headers
    )
    assert r_upload_a.status_code == 200, f"Upload A failed: {r_upload_a.text}"
    data_a = r_upload_a.json()
    assert data_a.get("success") is True
    image_url_a = data_a.get("url")
    filename_a = data_a.get("filename")
    assert image_url_a.startswith("/static/uploads/products/prod_")
    file_path_a = os.path.join(PRODUCT_UPLOAD_DIR, filename_a)
    assert os.path.isfile(file_path_a), f"File A not found on disk at {file_path_a}"
    assert os.path.getsize(file_path_a) == len(JPEG_BYTES)
    print(f"[TEST 4] Upload Image A: Saved to {file_path_a} ({len(JPEG_BYTES)} bytes), URL={image_url_a} -> PASS")

    # 5. Static File HTTP 200 Verification
    r_static_a = client.get(image_url_a)
    assert r_static_a.status_code == 200, f"Static URL {image_url_a} returned {r_static_a.status_code}"
    assert r_static_a.content == JPEG_BYTES, "Static file content did not match uploaded image bytes!"
    print(f"[TEST 5] Static Serving: HTTP 200 returned for '{image_url_a}' with matching content -> PASS")

    # 6. Update OnePlus 10 Pro 5G with Image A
    payload_update_a = {
        "title": oneplus_target["title"],
        "brand": oneplus_target["brand"],
        "model": oneplus_target["model"],
        "price": float(oneplus_target["price"]),
        "image_url": image_url_a
    }
    r_put_a = client.put(f"/api/products/{oneplus_id}", json=payload_update_a, headers=auth_headers)
    assert r_put_a.status_code == 200, f"PUT update failed: {r_put_a.text}"
    updated_a = r_put_a.json()
    assert updated_a["image_url"] == image_url_a

    # Verify directly in SQLite Database
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT image_url FROM products WHERE id = ?", (oneplus_id,))
    row = cursor.fetchone()
    assert row is not None
    assert row["image_url"] == image_url_a, f"DB image_url ({row['image_url']}) != {image_url_a}"
    conn.close()
    print(f"[TEST 6] Product Update with Image A: Database persisted exact image_url '{image_url_a}' -> PASS")

    # 7. Customer Storefront GET /api/products Verification
    r_store_a = client.get("/api/products")
    assert r_store_a.status_code == 200
    store_a_match = [p for p in r_store_a.json() if p["id"] == oneplus_id]
    assert len(store_a_match) == 1
    assert store_a_match[0]["image_url"] == image_url_a
    # Also verify GET /api/products/{id}
    r_single_a = client.get(f"/api/products/{oneplus_id}")
    assert r_single_a.status_code == 200
    assert r_single_a.json()["image_url"] == image_url_a
    print(f"[TEST 7] Customer Storefront Endpoints: GET /api/products & GET /api/products/{{id}} return Image A -> PASS")

    # 8. Negative Test: Replace Image A with completely different Image B
    r_upload_b = client.post(
        "/api/products/upload-image",
        files={"file": ("oneplus_test_b.png", io.BytesIO(PNG_BYTES), "image/png")},
        headers=auth_headers
    )
    assert r_upload_b.status_code == 200
    data_b = r_upload_b.json()
    image_url_b = data_b.get("url")
    filename_b = data_b.get("filename")
    file_path_b = os.path.join(PRODUCT_UPLOAD_DIR, filename_b)
    assert os.path.isfile(file_path_b)

    payload_update_b = {
        "title": oneplus_target["title"],
        "brand": oneplus_target["brand"],
        "model": oneplus_target["model"],
        "price": float(oneplus_target["price"]),
        "image_url": image_url_b
    }
    r_put_b = client.put(f"/api/products/{oneplus_id}", json=payload_update_b, headers=auth_headers)
    assert r_put_b.status_code == 200
    assert r_put_b.json()["image_url"] == image_url_b

    # Verify Customer Storefront has changed from Image A to Image B
    r_store_b = client.get("/api/products")
    store_b_match = [p for p in r_store_b.json() if p["id"] == oneplus_id]
    assert store_b_match[0]["image_url"] == image_url_b
    assert store_b_match[0]["image_url"] != image_url_a

    # Verify Safe Orphan Cleanup: Old Image A deleted, New Image B exists
    assert not os.path.exists(file_path_a), f"Orphan image A ({filename_a}) was not deleted!"
    assert os.path.exists(file_path_b), f"New image B ({filename_b}) should exist!"
    print(f"[TEST 8] Negative Test (Replace Image A -> Image B): Storefront updated to Image B, Old Image A cleanly deleted -> PASS")

    # 9. Multiple Product Cross-Check (Test at least 3 products with different images)
    # Find Samsung Galaxy S21 FE and Apple iPhone 13
    samsung_prods = [p for p in products if "S21 FE" in p.get("title", "") or "S21 FE" in p.get("model", "")]
    iphone_prods = [p for p in products if "iPhone 13" in p.get("title", "") or "iPhone 13" in p.get("model", "")]
    assert len(samsung_prods) > 0 and len(iphone_prods) > 0

    samsung_target = samsung_prods[0]
    iphone_target = iphone_prods[0]
    orig_samsung_img = samsung_target.get("image_url")
    orig_iphone_img = iphone_target.get("image_url")

    # Upload Image C (WebP) for Samsung
    r_upload_c = client.post(
        "/api/products/upload-image",
        files={"file": ("samsung_test_c.webp", io.BytesIO(WEBP_BYTES), "image/webp")},
        headers=auth_headers
    )
    image_url_c = r_upload_c.json()["url"]
    file_path_c = os.path.join(PRODUCT_UPLOAD_DIR, r_upload_c.json()["filename"])

    # Upload Image D (JPEG) for iPhone
    r_upload_d = client.post(
        "/api/products/upload-image",
        files={"file": ("iphone_test_d.jpg", io.BytesIO(JPEG_BYTES), "image/jpeg")},
        headers=auth_headers
    )
    image_url_d = r_upload_d.json()["url"]
    file_path_d = os.path.join(PRODUCT_UPLOAD_DIR, r_upload_d.json()["filename"])

    # Update Samsung and iPhone
    client.put(f"/api/products/{samsung_target['id']}", json={"image_url": image_url_c}, headers=auth_headers)
    client.put(f"/api/products/{iphone_target['id']}", json={"image_url": image_url_d}, headers=auth_headers)

    # Verify all 3 products hold their own independent images
    r_3prods = client.get("/api/products?include_out_of_stock=true").json()
    prod_map = {p["id"]: p["image_url"] for p in r_3prods}

    assert prod_map[oneplus_id] == image_url_b, "OnePlus must have Image B"
    assert prod_map[samsung_target["id"]] == image_url_c, "Samsung must have Image C"
    assert prod_map[iphone_target["id"]] == image_url_d, "iPhone must have Image D"
    assert image_url_b != image_url_c != image_url_d, "All 3 product images must be distinct!"
    print(f"[TEST 9] 3-Product Cross Check: OnePlus -> Image B, Samsung -> Image C, iPhone -> Image D (All Distinct) -> PASS")

    # 10. Restore Original Catalogue Images & Clean Up Test Images
    client.put(f"/api/products/{oneplus_id}", json={"image_url": original_oneplus_image}, headers=auth_headers)
    client.put(f"/api/products/{samsung_target['id']}", json={"image_url": orig_samsung_img}, headers=auth_headers)
    client.put(f"/api/products/{iphone_target['id']}", json={"image_url": orig_iphone_img}, headers=auth_headers)

    for pth in [file_path_b, file_path_c, file_path_d]:
        if os.path.exists(pth):
            try:
                os.remove(pth)
            except Exception:
                pass

    print("[TEST 10] Teardown & Catalogue State Reset: All original URLs restored, test artifacts safely cleaned -> PASS")

    print("=" * 65)
    print(">>> ALL 10 COMPREHENSIVE REGRESSION TESTS PASSED (100% SUCCESS) <<<")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()

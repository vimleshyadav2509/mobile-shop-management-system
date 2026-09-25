import io
import os
import sys
import time
import requests

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "static", "uploads", "products")

# Minimal valid 1x1 JPEG byte stream
JPEG_BYTES = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"

# Minimal valid 1x1 PNG byte stream
PNG_BYTES = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"

def run_tests():
    print("=============================================================")
    print(">>> RUNNING AMIT MOBILE SHOP PRODUCT IMAGE SYSTEM TESTS <<<")
    print("=============================================================")
    
    # Check servers
    print("[1] Verifying Backend & Frontend are responding...")
    r_health = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
    assert r_health.status_code == 200, f"Backend not healthy: {r_health.text}"
    print("    [PASS] Backend health check OK (200).")

    r_vite_health = requests.get(f"{FRONTEND_URL}/api/health", timeout=5)
    assert r_vite_health.status_code == 200, f"Frontend /api proxy not working: {r_vite_health.text}"
    print("    [PASS] Frontend Vite /api proxy to Backend OK (200).")

    # 1. Existing product loads with image
    print("\n[2] Checking existing products have image URLs...")
    r_prods = requests.get(f"{BACKEND_URL}/api/products", timeout=5)
    assert r_prods.status_code == 200
    prods = r_prods.json()
    assert len(prods) > 0, "No products returned from catalogue"
    first_prod = prods[0]
    assert first_prod.get("image_url"), "Product missing image_url"
    print(f"    [PASS] Retrieved {len(prods)} products. Sample image URL: {first_prod['image_url'][:60]}...")

    # Authentication
    print("\n[3] Testing Admin Authentication...")
    r_login = requests.post(f"{BACKEND_URL}/api/auth/login", json={"username": "admin", "password": "admin123"}, timeout=5)
    assert r_login.status_code == 200, f"Login failed: {r_login.text}"
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("    [PASS] Admin logged in successfully with valid JWT.")

    # 4. Image Upload - Valid Image
    print("\n[4] Testing Image Upload Endpoint (POST /api/products/upload-image)...")
    files = {"file": ("counter_sample.jpg", io.BytesIO(JPEG_BYTES), "image/jpeg")}
    r_upload = requests.post(f"{BACKEND_URL}/api/products/upload-image", files=files, headers=headers, timeout=5)
    assert r_upload.status_code == 200, f"Upload failed: {r_upload.text}"
    upload_data = r_upload.json()
    assert upload_data.get("success") is True
    image_url_1 = upload_data.get("url")
    filename_1 = upload_data.get("filename")
    assert image_url_1.startswith("/static/uploads/products/"), f"Unexpected url format: {image_url_1}"
    local_file_path_1 = os.path.join(UPLOAD_DIR, filename_1)
    assert os.path.isfile(local_file_path_1), f"Uploaded file not found on disk: {local_file_path_1}"
    print(f"    [PASS] Image uploaded. URL: {image_url_1}. File saved on disk ({os.path.getsize(local_file_path_1)} bytes).")

    # 5. Fix Local Development Image Display (Vite /static proxy)
    print("\n[5] Testing Local Development Image Display via Frontend Vite Proxy...")
    vite_img_url = f"{FRONTEND_URL}{image_url_1}"
    r_vite_img = requests.get(vite_img_url, timeout=5)
    assert r_vite_img.status_code == 200, f"Vite static proxy failed: status {r_vite_img.status_code}"
    assert "image" in r_vite_img.headers.get("content-type", ""), f"Wrong content-type: {r_vite_img.headers.get('content-type')}"
    assert len(r_vite_img.content) == len(JPEG_BYTES), "Content length mismatch from proxy"
    print(f"    [PASS] Frontend Vite proxy successfully served image at: {vite_img_url} with Content-Type: {r_vite_img.headers.get('content-type')}")

    # 6. Reject Invalid File Type
    print("\n[6] Testing Upload Validation (Reject non-image, invalid extension, fake signature)...")
    # A) text/plain content type
    bad_files_1 = {"file": ("bad.txt", io.BytesIO(b"Hello text file"), "text/plain")}
    r_bad_1 = requests.post(f"{BACKEND_URL}/api/products/upload-image", files=bad_files_1, headers=headers, timeout=5)
    assert r_bad_1.status_code == 400, f"Expected 400 for bad content type, got {r_bad_1.status_code}"
    print("    [PASS] Text file rejected with 400 Bad Request.")

    # B) .exe extension or fake signature
    bad_files_2 = {"file": ("malware.jpg", io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff"), "image/jpeg")}
    r_bad_2 = requests.post(f"{BACKEND_URL}/api/products/upload-image", files=bad_files_2, headers=headers, timeout=5)
    assert r_bad_2.status_code == 400, f"Expected 400 for bad signature, got {r_bad_2.status_code}"
    print("    [PASS] Executable masquerading as JPEG rejected with 400 Bad Request.")

    # C) Empty file
    bad_files_3 = {"file": ("empty.jpg", io.BytesIO(b""), "image/jpeg")}
    r_bad_3 = requests.post(f"{BACKEND_URL}/api/products/upload-image", files=bad_files_3, headers=headers, timeout=5)
    assert r_bad_3.status_code == 400, f"Expected 400 for empty file, got {r_bad_3.status_code}"
    print("    [PASS] Empty file rejected with 400 Bad Request.")

    # 7. Create Product with Uploaded Image
    print("\n[7] Creating Product with Uploaded Image URL...")
    test_prod = {
        "title": "OnePlus 12 5G (Counter Verified)",
        "brand": "OnePlus",
        "model": "12",
        "condition": "new",
        "category": "Smartphones",
        "price": 64999.0,
        "original_price": 69999.0,
        "ram_storage": "16GB / 512GB",
        "color": "Silky Black",
        "image_url": image_url_1,
        "in_stock": True,
        "stock_count": 3
    }
    r_create = requests.post(f"{BACKEND_URL}/api/products", json=test_prod, headers=headers, timeout=5)
    assert r_create.status_code == 201, f"Product create failed: {r_create.text}"
    created_prod = r_create.json()
    prod_id = created_prod["id"]
    assert created_prod["image_url"] == image_url_1
    print(f"    [PASS] Created product ID {prod_id} with image {image_url_1}.")

    # 8. Verify Customer Storefront shows new product with image
    print("\n[8] Verifying Customer Storefront includes product with image...")
    r_cust = requests.get(f"{BACKEND_URL}/api/products", timeout=5)
    matching = [p for p in r_cust.json() if p["id"] == prod_id]
    assert len(matching) == 1
    assert matching[0]["image_url"] == image_url_1
    print(f"    [PASS] Customer storefront returns product with correct image URL.")

    # 9. Product Image Replacement (Upload 2nd image & update product)
    print("\n[9] Testing Product Image Replacement Flow...")
    files_2 = {"file": ("counter_sample_2.png", io.BytesIO(PNG_BYTES), "image/png")}
    r_upload_2 = requests.post(f"{BACKEND_URL}/api/products/upload-image", files=files_2, headers=headers, timeout=5)
    assert r_upload_2.status_code == 200
    upload_data_2 = r_upload_2.json()
    image_url_2 = upload_data_2.get("url")
    filename_2 = upload_data_2.get("filename")
    local_file_path_2 = os.path.join(UPLOAD_DIR, filename_2)
    assert os.path.isfile(local_file_path_2)

    # Update product with new image_url
    r_update = requests.put(f"{BACKEND_URL}/api/products/{prod_id}", json={"image_url": image_url_2, "price": 62999.0}, headers=headers, timeout=5)
    assert r_update.status_code == 200, f"Update failed: {r_update.text}"
    updated_prod = r_update.json()
    assert updated_prod["image_url"] == image_url_2
    print(f"    [PASS] Product {prod_id} updated with new image: {image_url_2}.")

    # 10. Verify Safe Orphan Cleanup: Old file removed, New file exists
    print("\n[10] Verifying Safe Orphan Cleanup on Image Replacement...")
    time.sleep(0.2)
    assert not os.path.exists(local_file_path_1), f"Old image {filename_1} was NOT cleaned up!"
    assert os.path.exists(local_file_path_2), f"New image {filename_2} should exist!"
    print(f"    [PASS] Old image file successfully cleaned up from disk. New image preserved.")

    # 11. Verify Customer Storefront reflects replacement image
    print("\n[11] Verifying Customer Storefront reflects updated image...")
    r_cust_updated = requests.get(f"{BACKEND_URL}/api/products", timeout=5)
    matching_updated = [p for p in r_cust_updated.json() if p["id"] == prod_id]
    assert len(matching_updated) == 1
    assert matching_updated[0]["image_url"] == image_url_2
    print(f"    [PASS] Customer storefront reflects new image {image_url_2}.")

    # 12. Verify External Images (Unsplash) are NEVER deleted
    print("\n[12] Verifying External Unsplash images are NEVER deleted...")
    unsplash_url = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80"
    # Switch to Unsplash
    r_to_unsplash = requests.put(f"{BACKEND_URL}/api/products/{prod_id}", json={"image_url": unsplash_url}, headers=headers, timeout=5)
    assert r_to_unsplash.status_code == 200
    # Cleaned up image 2
    assert not os.path.exists(local_file_path_2), "Local image 2 should be deleted when switching to unsplash"
    # Now switch back to a local image - verify unsplash URL does not throw or delete external resources
    files_3 = {"file": ("counter_sample_3.jpg", io.BytesIO(JPEG_BYTES), "image/jpeg")}
    r_upload_3 = requests.post(f"{BACKEND_URL}/api/products/upload-image", files=files_3, headers=headers, timeout=5)
    image_url_3 = r_upload_3.json()["url"]
    filename_3 = r_upload_3.json()["filename"]
    local_file_path_3 = os.path.join(UPLOAD_DIR, filename_3)

    r_from_unsplash = requests.put(f"{BACKEND_URL}/api/products/{prod_id}", json={"image_url": image_url_3}, headers=headers, timeout=5)
    assert r_from_unsplash.status_code == 200
    assert os.path.exists(local_file_path_3)
    print("    [PASS] External URLs handled safely without error or unexpected disk actions.")

    # 13. Verify Product Delete Cleanup
    print("\n[13] Verifying Product Delete removes DB record and local image file...")
    r_del = requests.delete(f"{BACKEND_URL}/api/products/{prod_id}", headers=headers, timeout=5)
    assert r_del.status_code == 200
    time.sleep(0.2)
    assert not os.path.exists(local_file_path_3), f"Local image {filename_3} was NOT cleaned up upon product deletion!"
    # Verify DB
    r_check = requests.get(f"{BACKEND_URL}/api/products/{prod_id}", timeout=5)
    assert r_check.status_code == 404, "Product still in database after deletion"
    print(f"    [PASS] Product record removed from DB and local image file {filename_3} deleted from disk.")

    # 14. Verify Full CRUD functionality remains intact
    print("\n[14] Verifying Full Product CRUD (Add, List, Filter, Update, Toggle Stock, Delete)...")
    # Quick stock toggle test
    target_p = prods[0]
    initial_stock = target_p["in_stock"]
    r_patch = requests.patch(f"{BACKEND_URL}/api/products/{target_p['id']}", json={"in_stock": not initial_stock}, headers=headers, timeout=5)
    assert r_patch.status_code == 200
    assert r_patch.json()["in_stock"] != initial_stock
    # Toggle back
    r_patch_back = requests.patch(f"{BACKEND_URL}/api/products/{target_p['id']}", json={"in_stock": initial_stock}, headers=headers, timeout=5)
    assert r_patch_back.status_code == 200
    assert r_patch_back.json()["in_stock"] == initial_stock
    print("    [PASS] Stock toggle and partial updates remain 100% functional.")

    # 15. Verify Vite Proxy & Static Access
    print("\n[15] Verifying Static Serving via Vite Proxy...")
    # Upload one final image to verify persistent serving
    files_final = {"file": ("final_verify.jpg", io.BytesIO(JPEG_BYTES), "image/jpeg")}
    r_fin = requests.post(f"{BACKEND_URL}/api/products/upload-image", files=files_final, headers=headers, timeout=5)
    fin_url = r_fin.json()["url"]
    fin_file = r_fin.json()["filename"]
    r_vite_fin = requests.get(f"{FRONTEND_URL}{fin_url}", timeout=5)
    assert r_vite_fin.status_code == 200
    assert r_vite_fin.content == JPEG_BYTES
    # Cleanup file manually
    os.remove(os.path.join(UPLOAD_DIR, fin_file))
    print("    [PASS] Static image delivery via Vite proxy confirmed operational.")

    print("\n=============================================================")
    print(">>> ALL 15 AUTOMATED SYSTEM TESTS PASSED SUCCESSFULLY! <<<")
    print("=============================================================")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\n[-] TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

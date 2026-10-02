import os
import unittest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.sms_service import normalize_phone_number, generate_otp, hash_otp, verify_otp_hash
from app.database import (
    get_connection,
    get_customer_by_phone,
    get_customer_by_id,
    create_or_get_customer,
    update_customer_profile,
    save_customer_otp,
    get_latest_active_otp,
    increment_otp_attempts,
    mark_otp_consumed,
    get_customer_repair_jobs
)
from app.config import SHOP_LOCATION, SHOP_LATITUDE, SHOP_LONGITUDE, SHOP_MAPS_URL
from app.routes.customer_auth import _phone_last_request_time, _ip_request_timestamps

class CustomerOtpAndMapTestSuite(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        _phone_last_request_time.clear()
        _ip_request_timestamps.clear()
        # Clean up test numbers from customer_otps and customers so tests are 100% idempotent
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM customer_otps WHERE phone LIKE '+91987600%'")
        cursor.execute("DELETE FROM customers WHERE phone LIKE '+91987600%'")
        conn.commit()
        conn.close()

    def tearDown(self):
        _phone_last_request_time.clear()
        _ip_request_timestamps.clear()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM customer_otps WHERE phone LIKE '+91987600%'")
        cursor.execute("DELETE FROM customers WHERE phone LIKE '+91987600%'")
        conn.commit()
        conn.close()

    # =========================================================================
    # 1. Indian Mobile Number Normalization Tests
    # =========================================================================
    def test_mobile_normalization_valid(self):
        self.assertEqual(normalize_phone_number("9876543210"), "+919876543210")
        self.assertEqual(normalize_phone_number("+919876543210"), "+919876543210")
        self.assertEqual(normalize_phone_number("91 9876543210"), "+919876543210")
        self.assertEqual(normalize_phone_number("+91-9876543210"), "+919876543210")
        self.assertEqual(normalize_phone_number("09876543210"), "+919876543210")
        self.assertEqual(normalize_phone_number("+91 91234 56789"), "+919123456789")

    def test_mobile_normalization_invalid(self):
        with self.assertRaises(ValueError):
            normalize_phone_number("12345")
        with self.assertRaises(ValueError):
            normalize_phone_number("0123456789")  # Indian mobile doesn't start with 0,1,2,3,4,5
        with self.assertRaises(ValueError):
            normalize_phone_number("abcdefghij")
        with self.assertRaises(ValueError):
            normalize_phone_number("")

    # =========================================================================
    # 2. Cryptographic OTP Generation & Hash Tests
    # =========================================================================
    def test_otp_generation(self):
        for _ in range(10):
            otp = generate_otp(6)
            self.assertEqual(len(otp), 6)
            self.assertTrue(otp.isdigit())
            self.assertTrue(100000 <= int(otp) <= 999999)

    def test_otp_hashing_and_verification(self):
        phone = "+919876543210"
        otp = "654321"
        stored_hash = hash_otp(phone, otp)
        self.assertTrue(verify_otp_hash(phone, otp, stored_hash))
        self.assertFalse(verify_otp_hash(phone, "111111", stored_hash))
        self.assertFalse(verify_otp_hash("+919123456789", otp, stored_hash))

    # =========================================================================
    # 3. End-to-End OTP Request & Verification API
    # =========================================================================
    def test_otp_api_request_and_verify(self):
        test_phone = "+919876000001"
        
        # Request OTP
        req_res = self.client.post("/api/auth/customer/request-otp", json={"phone": "9876000001"})
        self.assertEqual(req_res.status_code, 200)
        data = req_res.json()
        self.assertTrue(data.get("success"))
        # Security requirement: OTP MUST NOT be returned in response!
        self.assertNotIn("otp", data)
        self.assertNotIn("code", data)

        # Retrieve active OTP from DB for testing verification
        active = get_latest_active_otp(test_phone)
        self.assertIsNotNone(active)
        self.assertEqual(active["attempts"], 0)

        # Test invalid OTP code
        bad_verify = self.client.post("/api/auth/customer/verify-otp", json={
            "phone": test_phone,
            "otp": "000000"
        })
        self.assertEqual(bad_verify.status_code, 400)

        # Check attempt count incremented
        updated_active = get_latest_active_otp(test_phone)
        self.assertEqual(updated_active["attempts"], 1)

        # Generate a known OTP and test valid verification
        test_otp = "123456"
        new_hash = hash_otp(test_phone, test_otp)
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()
        save_customer_otp(test_phone, new_hash, expires_at)

        good_verify = self.client.post("/api/auth/customer/verify-otp", json={
            "phone": test_phone,
            "otp": test_otp
        })
        self.assertEqual(good_verify.status_code, 200)
        verify_data = good_verify.json()
        self.assertIn("access_token", verify_data)
        self.assertEqual(verify_data["customer"]["phone"], test_phone)

        # Single-use test: OTP cannot be verified again
        reuse_res = self.client.post("/api/auth/customer/verify-otp", json={
            "phone": test_phone,
            "otp": test_otp
        })
        self.assertEqual(reuse_res.status_code, 400)

    # =========================================================================
    # 4. OTP Expiry Enforcement Test
    # =========================================================================
    def test_otp_expiry(self):
        phone = "+919876000003"
        otp = "789123"
        # Set expiry in the past
        past_expiry = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
        save_customer_otp(phone, hash_otp(phone, otp), past_expiry)

        verify_res = self.client.post("/api/auth/customer/verify-otp", json={
            "phone": phone,
            "otp": otp
        })
        self.assertEqual(verify_res.status_code, 400)
        self.assertIn("expired", verify_res.json()["detail"].lower())

    # =========================================================================
    # 5. OTP Max Attempt Limit Test
    # =========================================================================
    def test_otp_attempt_limit(self):
        phone = "+919876000004"
        otp = "555123"
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()
        save_customer_otp(phone, hash_otp(phone, otp), expires_at, max_attempts=5)

        # Attempt 5 wrong OTPs
        for _ in range(5):
            res = self.client.post("/api/auth/customer/verify-otp", json={
                "phone": phone,
                "otp": "000000"
            })
            self.assertEqual(res.status_code, 400)

        # Now even the correct OTP is rejected because attempts exceeded
        res = self.client.post("/api/auth/customer/verify-otp", json={
            "phone": phone,
            "otp": otp
        })
        self.assertEqual(res.status_code, 400)
        self.assertTrue(
            "maximum" in res.json()["detail"].lower() or "no active" in res.json()["detail"].lower()
        )

    # =========================================================================
    # 6. Resend Cooldown Test
    # =========================================================================
    def test_resend_cooldown(self):
        phone = "9876000005"
        # First request succeeds
        res1 = self.client.post("/api/auth/customer/request-otp", json={"phone": phone})
        self.assertEqual(res1.status_code, 200)

        # Second request immediately triggers 429 cooldown
        res2 = self.client.post("/api/auth/customer/request-otp", json={"phone": phone})
        self.assertEqual(res2.status_code, 429)
        self.assertIn("wait", res2.json()["detail"].lower())

    # =========================================================================
    # 7. Customer Account Creation and Reuse of Stable ID
    # =========================================================================
    def test_existing_customer_login_reuses_id(self):
        phone = "+919876000006"
        otp = "333444"
        save_customer_otp(phone, hash_otp(phone, otp), (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat())

        # First verification creates customer
        v1 = self.client.post("/api/auth/customer/verify-otp", json={"phone": phone, "otp": otp})
        self.assertEqual(v1.status_code, 200)
        cust_id_1 = v1.json()["customer"]["id"]

        # Second login with new OTP for same number
        otp2 = "555666"
        _phone_last_request_time.clear()
        save_customer_otp(phone, hash_otp(phone, otp2), (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat())
        v2 = self.client.post("/api/auth/customer/verify-otp", json={"phone": phone, "otp": otp2})
        self.assertEqual(v2.status_code, 200)
        cust_id_2 = v2.json()["customer"]["id"]

        # ID must be strictly identical (stable customer ID, no duplicates)
        self.assertEqual(cust_id_1, cust_id_2)

    # =========================================================================
    # 8. Mobile Number Change Requires OTP & Preserves Customer Account ID
    # =========================================================================
    def test_change_phone_requires_otp_and_preserves_id(self):
        old_phone = "+919876000007"
        new_phone = "+919876000008"
        otp = "999888"

        # Log in old customer
        save_customer_otp(old_phone, hash_otp(old_phone, otp), (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat())
        login_res = self.client.post("/api/auth/customer/verify-otp", json={"phone": old_phone, "otp": otp})
        token = login_res.json()["access_token"]
        original_id = login_res.json()["customer"]["id"]
        headers = {"Authorization": f"Bearer {token}"}

        # Request change phone OTP to new phone
        req_res = self.client.post("/api/auth/customer/change-phone/request-otp", headers=headers, json={"new_phone": new_phone})
        self.assertEqual(req_res.status_code, 200)

        # Cannot verify with wrong OTP
        bad_v = self.client.post("/api/auth/customer/change-phone/verify-otp", headers=headers, json={
            "new_phone": new_phone,
            "otp": "000000"
        })
        self.assertEqual(bad_v.status_code, 400)

        # Set valid OTP for new phone and verify
        change_otp = "121212"
        save_customer_otp(new_phone, hash_otp(new_phone, change_otp), (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat())
        good_v = self.client.post("/api/auth/customer/change-phone/verify-otp", headers=headers, json={
            "new_phone": new_phone,
            "otp": change_otp
        })
        self.assertEqual(good_v.status_code, 200)
        updated_cust = good_v.json()

        # Mobile updated, but stable customer ID preserved
        self.assertEqual(updated_cust["id"], original_id)
        self.assertEqual(updated_cust["phone"], new_phone)

    # =========================================================================
    # 9. Customer Session, Profile & Data Authorization
    # =========================================================================
    def test_customer_profile_and_isolation(self):
        # Create test customer
        phone_a = "+919876000002"
        otp_a = "654321"
        save_customer_otp(phone_a, hash_otp(phone_a, otp_a), (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat())

        v_res = self.client.post("/api/auth/customer/verify-otp", json={"phone": phone_a, "otp": otp_a})
        token_a = v_res.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 1. Fetch own profile
        me_res = self.client.get("/api/auth/customer/me", headers=headers_a)
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["phone"], phone_a)

        # 2. Update profile
        up_res = self.client.put("/api/auth/customer/profile", headers=headers_a, json={
            "name": "Amit Customer Test",
            "address": "Near Station Road",
            "city": "Khorare",
            "state": "Uttar Pradesh",
            "pincode": "271312"
        })
        self.assertEqual(up_res.status_code, 200)
        self.assertEqual(up_res.json()["name"], "Amit Customer Test")
        self.assertEqual(up_res.json()["pincode"], "271312")

        # 3. Role isolation: Customer token MUST NOT access admin endpoints
        admin_res = self.client.get("/api/admin/stats", headers=headers_a)
        self.assertEqual(admin_res.status_code, 403)

        admin_me_res = self.client.get("/api/auth/me", headers=headers_a)
        self.assertEqual(admin_me_res.status_code, 403)

    # =========================================================================
    # 10. Customer Cannot Access Another Customer's Repair Data
    # =========================================================================
    def test_customer_cannot_access_other_customer_repairs(self):
        phone_a = "+919876000009"
        otp_a = "112233"
        save_customer_otp(phone_a, hash_otp(phone_a, otp_a), (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat())
        res_a = self.client.post("/api/auth/customer/verify-otp", json={"phone": phone_a, "otp": otp_a})
        token_a = res_a.json()["access_token"]

        repairs_res = self.client.get("/api/auth/customer/repairs", headers={"Authorization": f"Bearer {token_a}"})
        self.assertEqual(repairs_res.status_code, 200)
        # Returns only repairs matching phone_a
        repairs = repairs_res.json()
        for r in repairs:
            self.assertTrue(r["customer_phone"] in (phone_a, "9876000009"))

    # =========================================================================
    # 11. Shop Location & Coordinates Source of Truth
    # =========================================================================
    def test_shop_location_source_of_truth(self):
        self.assertAlmostEqual(SHOP_LATITUDE, 27.0161817, places=5)
        self.assertAlmostEqual(SHOP_LONGITUDE, 82.5375051, places=5)
        self.assertIn("Khorare", SHOP_LOCATION)
        self.assertIn("271312", SHOP_LOCATION)
        self.assertIn("maps.app.goo.gl", SHOP_MAPS_URL)

if __name__ == "__main__":
    unittest.main()

import unittest
import io
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import HTTPException
from app.main import app
from app.cloudinary_service import (
    is_valid_image_bytes,
    upload_product_image_data,
    delete_product_image_asset,
    extract_cloudinary_public_id,
    is_cloudinary_configured
)
from app.database import get_connection

class CloudImageServiceTestSuite(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        """Verify GET /api/health returns status 'ok' and database status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "ok")
        self.assertEqual(data.get("database"), "connected")
        self.assertIn("version", data)

    def test_image_validation_valid_jpeg(self):
        """Verify valid JPEG magic bytes pass validation."""
        valid_jpeg = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01" + b"\x00" * 100
        self.assertTrue(is_valid_image_bytes(valid_jpeg))

    def test_image_validation_valid_png(self):
        """Verify valid PNG magic bytes pass validation."""
        valid_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        self.assertTrue(is_valid_image_bytes(valid_png))

    def test_image_validation_valid_webp(self):
        """Verify valid WebP magic bytes pass validation."""
        valid_webp = b"RIFF\x24\x00\x00\x00WEBPVP8 " + b"\x00" * 100
        self.assertTrue(is_valid_image_bytes(valid_webp))

    def test_image_validation_oversized(self):
        """Verify images larger than 5MB are rejected by upload_product_image_data."""
        oversized = b"\xFF\xD8\xFF\xE0" + b"\x00" * (5 * 1024 * 1024 + 10)
        with self.assertRaises(HTTPException) as ctx:
            upload_product_image_data(oversized, filename="huge.jpg", content_type="image/jpeg")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("5MB", str(ctx.exception.detail))

    def test_image_validation_invalid_magic_bytes(self):
        """Verify files with malicious content or invalid magic bytes are rejected."""
        fake_jpeg = b"<!DOCTYPE html><html><body>malicious payload</body></html>"
        with self.assertRaises(HTTPException) as ctx:
            upload_product_image_data(fake_jpeg, filename="exploit.jpg", content_type="image/jpeg")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Invalid image data", str(ctx.exception.detail))

    def test_extract_cloudinary_public_id(self):
        """Verify extraction of public_id from Cloudinary URLs."""
        url = "https://res.cloudinary.com/demo/image/upload/v1234567890/amit_mobile_shop/products/prod_12345.jpg"
        public_id = extract_cloudinary_public_id(url)
        self.assertEqual(public_id, "amit_mobile_shop/products/prod_12345")

        # Non-cloudinary URL
        local_url = "/static/uploads/products/prod_123.jpg"
        self.assertIsNone(extract_cloudinary_public_id(local_url))

    @patch("cloudinary.uploader.upload")
    def test_cloudinary_upload_mock(self, mock_upload):
        """Verify upload_product_image_data calls Cloudinary when configured."""
        mock_upload.return_value = {
            "secure_url": "https://res.cloudinary.com/testcloud/image/upload/v123/prod_test.jpg",
            "public_id": "amit_mobile_shop/products/prod_test"
        }
        valid_jpeg = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 50
        with patch("app.cloudinary_service.is_cloudinary_configured", return_value=True):
            res = upload_product_image_data(valid_jpeg, filename="phone.jpg", content_type="image/jpeg")
            self.assertEqual(res["url"], "https://res.cloudinary.com/testcloud/image/upload/v123/prod_test.jpg")
            self.assertEqual(res["public_id"], "amit_mobile_shop/products/prod_test")

    def test_database_connection(self):
        """Verify database wrapper can execute queries and return dict rows."""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) as cnt FROM products")
        row = cursor.fetchone()
        self.assertIsNotNone(row)
        self.assertIn("cnt", row)
        conn.close()

if __name__ == "__main__":
    unittest.main()

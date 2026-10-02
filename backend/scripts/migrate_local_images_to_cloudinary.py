#!/usr/bin/env python3
"""
Amit Mobile Shop - Legacy Image Migration Utility
Scans database for local image URLs (/static/uploads/products/...)
and uploads them to Cloudinary, updating the product records.
Never deletes original local images.
"""

import os
import sys
import logging
import argparse
from typing import List, Dict, Any

from dotenv import load_dotenv

# Ensure backend directory in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Explicitly load backend/.env if present
env_file = os.path.join(backend_dir, ".env")
if os.path.isfile(env_file):
    load_dotenv(env_file, override=True)
else:
    load_dotenv(override=True)

from app.config import PRODUCT_UPLOAD_DIR
import app.config as app_cfg

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("image_migration")


def migrate_images(
    cloud_name: str = None,
    api_key: str = None,
    api_secret: str = None,
    database_url: str = None,
    dry_run: bool = False
) -> bool:
    import cloudinary
    import cloudinary.uploader

    c_name = cloud_name or os.getenv("CLOUDINARY_CLOUD_NAME") or app_cfg.CLOUDINARY_CLOUD_NAME
    c_key = api_key or os.getenv("CLOUDINARY_API_KEY") or app_cfg.CLOUDINARY_API_KEY
    c_secret = api_secret or os.getenv("CLOUDINARY_API_SECRET") or app_cfg.CLOUDINARY_API_SECRET

    if not (c_name and c_key and c_secret and c_name != "CHANGE_ME"):
        logger.error(
            "Cloudinary is not configured! Please set CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env or pass as arguments."
        )
        return False

    cloudinary.config(
        cloud_name=c_name,
        api_key=c_key,
        api_secret=c_secret,
        secure=True
    )

    if database_url:
        os.environ["DATABASE_URL"] = database_url
        app_cfg.DATABASE_URL = database_url

    from app.database import get_connection
    from app.cloudinary_service import is_valid_image_bytes

    logger.info("Connecting to database...")
    conn = get_connection()
    cursor = conn.cursor()

    # Query all products with local uploaded image paths
    cursor.execute("SELECT id, title, image_url FROM products WHERE image_url IS NOT NULL")
    products = cursor.fetchall()

    local_prefix = "/static/uploads/products/"
    target_products = [
        p for p in products
        if p.get("image_url") and (
            p["image_url"].startswith(local_prefix) or
            p["image_url"].startswith("static/uploads/products/")
        )
    ]

    logger.info(f"Total products in database: {len(products)}")
    logger.info(f"Products with local image references: {len(target_products)}")

    if not target_products:
        logger.info("No local product images require migration to Cloudinary.")
        conn.close()
        return True

    report = []
    has_errors = False

    for prod in target_products:
        prod_id = prod["id"]
        title = prod.get("title", prod_id)
        old_url = prod["image_url"]
        filename = os.path.basename(old_url)
        local_filepath = os.path.join(PRODUCT_UPLOAD_DIR, filename)

        if not os.path.isfile(local_filepath):
            logger.warning(f"File not found on disk for product '{title}': {local_filepath}")
            report.append({
                "id": prod_id[:8] + "...",
                "title": title[:30],
                "old_url": old_url,
                "new_url": "N/A (File Missing)",
                "status": "FILE_NOT_FOUND"
            })
            continue

        try:
            with open(local_filepath, "rb") as f:
                file_bytes = f.read()

            if not is_valid_image_bytes(file_bytes):
                logger.warning(f"Skipping corrupt or invalid image file: {local_filepath}")
                report.append({
                    "id": prod_id[:8] + "...",
                    "title": title[:30],
                    "old_url": old_url,
                    "new_url": "N/A (Invalid Bytes)",
                    "status": "INVALID_IMAGE"
                })
                continue

            if dry_run:
                logger.info(f"[DRY-RUN] Would upload {filename} to Cloudinary for {title}")
                report.append({
                    "id": prod_id[:8] + "...",
                    "title": title[:30],
                    "old_url": old_url,
                    "new_url": f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/.../{filename}",
                    "status": "DRY_RUN_OK"
                })
                continue

            # Upload to Cloudinary
            logger.info(f"Uploading {filename} to Cloudinary for product '{title}'...")
            upload_res = cloudinary.uploader.upload(
                file_bytes,
                folder="amit_mobile_shop/products",
                resource_type="image",
                overwrite=True
            )
            secure_url = upload_res.get("secure_url")

            # Update database
            cursor.execute("UPDATE products SET image_url = ? WHERE id = ?", (secure_url, prod_id))
            conn.commit()

            report.append({
                "id": prod_id[:8] + "...",
                "title": title[:30],
                "old_url": old_url,
                "new_url": secure_url,
                "status": "MIGRATED_OK"
            })
            logger.info(f"Successfully migrated '{title}' -> {secure_url}")

        except Exception as e:
            logger.error(f"Failed to migrate image for '{title}': {e}")
            has_errors = True
            report.append({
                "id": prod_id[:8] + "...",
                "title": title[:30],
                "old_url": old_url,
                "new_url": f"ERROR: {e}",
                "status": "FAILED"
            })

    conn.close()

    # Print Migration Summary Report
    print("\n" + "=" * 90)
    print(">>> AMIT MOBILE SHOP - LOCAL IMAGE TO CLOUDINARY MIGRATION REPORT <<<")
    print("=" * 90)
    header = f"{'Product ID':<12} | {'Title':<30} | {'Old Local Path':<25} | {'Status':<12}"
    print(header)
    print("-" * 90)
    for r in report:
        line = f"{r['id']:<12} | {r['title']:<30} | {r['old_url']:<25} | {r['status']:<12}"
        print(line)
    print("=" * 90)

    return not has_errors


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate local product images to Cloudinary")
    parser.add_argument("--cloud-name", type=str, default=None, help="Cloudinary cloud name")
    parser.add_argument("--api-key", type=str, default=None, help="Cloudinary API key")
    parser.add_argument("--api-secret", type=str, default=None, help="Cloudinary API secret")
    parser.add_argument("--database-url", type=str, default=None, help="Database connection URL")
    parser.add_argument("--dry-run", action="store_true", help="Simulate upload without changing database")
    args = parser.parse_args()

    success = migrate_images(
        cloud_name=args.cloud_name,
        api_key=args.api_key,
        api_secret=args.api_secret,
        database_url=args.database_url,
        dry_run=args.dry_run
    )
    sys.exit(0 if success else 1)

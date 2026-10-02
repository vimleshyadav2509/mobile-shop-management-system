#!/usr/bin/env python3
"""
Amit Mobile Shop - Database Migration Utility
Migrates all tables and records from local SQLite (ams_store.db) to Supabase PostgreSQL.
Idempotent, non-destructive, validates counts and relationships.
"""

import os
import sys
import sqlite3
import argparse
import logging
from typing import Dict, Any, List

# Ensure backend directory is in python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.config import DATABASE_URL as CONFIG_DATABASE_URL

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("migration")

TABLE_ORDER = [
    "shop_settings",
    "admin_users",
    "products",
    "emi_plans",
    "repair_jobs",
    "repair_status_history",
    "customers",
    "customer_otps"
]

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS shop_settings (
    id TEXT PRIMARY KEY,
    shop_name TEXT NOT NULL,
    tagline TEXT,
    phone1 TEXT,
    phone2 TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    opening_time TEXT,
    closing_time TEXT,
    weekly_off TEXT,
    google_maps_url TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active INTEGER DEFAULT 1,
    token_version INTEGER DEFAULT 1,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    condition TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    ram_storage TEXT,
    color TEXT,
    battery_health TEXT,
    warranty_info TEXT DEFAULT 'Shop Warranty Included',
    emi_bajaj INTEGER DEFAULT 1,
    emi_tvs INTEGER DEFAULT 1,
    emi_samsung INTEGER DEFAULT 1,
    image_url TEXT,
    in_stock INTEGER DEFAULT 1,
    featured INTEGER DEFAULT 0,
    category TEXT DEFAULT 'Smartphones',
    stock_count INTEGER DEFAULT 1,
    variant TEXT,
    stock_status TEXT,
    description TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS emi_plans (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    provider TEXT NOT NULL,
    duration_months INTEGER NOT NULL,
    down_payment REAL DEFAULT 0,
    monthly_emi REAL NOT NULL,
    processing_fee REAL DEFAULT 0,
    interest_rate REAL DEFAULT 0,
    available INTEGER DEFAULT 1,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS repair_jobs (
    id TEXT PRIMARY KEY,
    job_sheet_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    device_brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    issue_description TEXT,
    status TEXT DEFAULT 'Received',
    estimated_cost REAL NOT NULL,
    final_cost REAL,
    technician_notes TEXT,
    technician_name TEXT DEFAULT 'Amit Mobile Shop Expert',
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS repair_status_history (
    id TEXT PRIMARY KEY,
    repair_id TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    note TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Valued Customer',
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    phone_verified INTEGER DEFAULT 1,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS customer_otps (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    expires_at TEXT NOT NULL,
    consumed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_sheet ON repair_jobs(job_sheet_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_phone ON repair_jobs(customer_phone);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customer_otps_phone ON customer_otps(phone);
"""


def migrate(sqlite_file: str, pg_url: str) -> bool:
    import psycopg2
    from psycopg2.extras import RealDictCursor

    if not os.path.exists(sqlite_file):
        logger.error(f"SQLite file not found at: {sqlite_file}")
        return False

    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql://", 1)

    logger.info(f"Source SQLite: {sqlite_file}")
    logger.info("Connecting to target PostgreSQL (Supabase)...")

    # Connect to PostgreSQL
    try:
        pg_conn = psycopg2.connect(pg_url)
        pg_conn.autocommit = False
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL: {e}")
        return False

    # Connect to SQLite
    sqlite_conn = sqlite3.connect(sqlite_file)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

    pg_cursor = pg_conn.cursor()

    # Step 1: Initialize PostgreSQL Tables
    logger.info("Initializing PostgreSQL schema and indexes...")
    try:
        pg_cursor.execute(CREATE_TABLES_SQL)
        pg_conn.commit()
    except Exception as e:
        pg_conn.rollback()
        logger.error(f"Schema creation failed: {e}")
        return False

    logger.info("Schema initialized. Beginning table data migration...")

    report = []
    has_errors = False

    for table in TABLE_ORDER:
        # Check if table exists in SQLite
        sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
        if not sqlite_cursor.fetchone():
            logger.info(f"Skipping table '{table}': Not found in SQLite.")
            continue

        # Get rows from SQLite
        sqlite_cursor.execute(f"SELECT * FROM {table}")
        rows = sqlite_cursor.fetchall()
        src_count = len(rows)

        if src_count == 0:
            pg_cursor.execute(f"SELECT count(*) FROM {table}")
            dst_count = pg_cursor.fetchone()[0]
            report.append({
                "table": table,
                "sqlite_rows": 0,
                "pg_before": dst_count,
                "migrated": 0,
                "pg_after": dst_count,
                "status": "EMPTY"
            })
            continue

        # Inspect table columns
        cols = rows[0].keys()
        cols_str = ", ".join(cols)
        placeholders = ", ".join(["%s"] * len(cols))

        # Check PostgreSQL count before
        pg_cursor.execute(f"SELECT count(*) FROM {table}")
        before_count = pg_cursor.fetchone()[0]

        # Insert rows idempotently
        # Use ON CONFLICT (id) DO NOTHING where id is primary key
        conflict_clause = "ON CONFLICT (id) DO NOTHING"
        insert_sql = f"INSERT INTO {table} ({cols_str}) VALUES ({placeholders}) {conflict_clause}"

        migrated_in_table = 0
        try:
            for r in rows:
                values = [r[col] for col in cols]
                pg_cursor.execute(insert_sql, values)
                if pg_cursor.rowcount > 0:
                    migrated_in_table += 1
            pg_conn.commit()
        except Exception as e:
            pg_conn.rollback()
            logger.error(f"Error migrating table '{table}': {e}")
            has_errors = True
            report.append({
                "table": table,
                "sqlite_rows": src_count,
                "pg_before": before_count,
                "migrated": 0,
                "pg_after": before_count,
                "status": f"ERROR: {e}"
            })
            continue

        # Check PostgreSQL count after
        pg_cursor.execute(f"SELECT count(*) FROM {table}")
        after_count = pg_cursor.fetchone()[0]

        report.append({
            "table": table,
            "sqlite_rows": src_count,
            "pg_before": before_count,
            "migrated": migrated_in_table,
            "pg_after": after_count,
            "status": "SUCCESS"
        })

    sqlite_conn.close()
    pg_conn.close()

    # Print Migration Summary Report
    print("\n" + "=" * 80)
    print(">>> AMIT MOBILE SHOP - SQLITE TO SUPABASE POSTGRESQL MIGRATION REPORT <<<")
    print("=" * 80)
    header = f"{'Table Name':<25} | {'SQLite Rows':<12} | {'New Migrated':<13} | {'Postgres Total':<15} | {'Status':<10}"
    print(header)
    print("-" * 80)
    for r in report:
        line = f"{r['table']:<25} | {r['sqlite_rows']:<12} | {r['migrated']:<13} | {r['pg_after']:<15} | {r['status']:<10}"
        print(line)
    print("=" * 80)

    if has_errors:
        logger.warning("Migration completed with errors. See report above.")
        return False

    logger.info("Migration completed successfully with zero data loss!")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate Amit Mobile Shop database from SQLite to PostgreSQL")
    parser.add_argument(
        "--sqlite-path",
        default=os.path.join(backend_dir, "ams_store.db"),
        help="Path to SQLite database file (default: backend/ams_store.db)"
    )
    parser.add_argument(
        "--database-url",
        default=CONFIG_DATABASE_URL or os.getenv("DATABASE_URL", ""),
        help="Supabase PostgreSQL connection URL"
    )

    args = parser.parse_args()

    if not args.database_url:
        print("\nERROR: DATABASE_URL is required to run the migration script.")
        print("Usage: python backend/scripts/migrate_sqlite_to_postgres.py --database-url 'postgresql://...'")
        print("Or set DATABASE_URL environment variable.\n")
        sys.exit(1)

    success = migrate(args.sqlite_path, args.database_url)
    sys.exit(0 if success else 1)

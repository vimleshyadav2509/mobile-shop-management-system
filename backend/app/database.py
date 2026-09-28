import sqlite3
import os
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.config import SUPABASE_URL, SUPABASE_KEY, ADMIN_USERNAME, ADMIN_PASSWORD, DB_PATH
from app.security import hash_password, verify_password

DB_FILE = DB_PATH


def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Products table
    cursor.execute("""
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
        description TEXT,
        created_at TEXT
    );
    """)

    # Safe Schema Migrations for existing products table
    cursor.execute("PRAGMA table_info(products)")
    existing_product_cols = [row["name"] for row in cursor.fetchall()]
    if "category" not in existing_product_cols:
        cursor.execute("ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'Smartphones'")
    if "stock_count" not in existing_product_cols:
        cursor.execute("ALTER TABLE products ADD COLUMN stock_count INTEGER DEFAULT 1")
    if "variant" not in existing_product_cols:
        cursor.execute("ALTER TABLE products ADD COLUMN variant TEXT DEFAULT NULL")
    if "stock_status" not in existing_product_cols:
        cursor.execute("ALTER TABLE products ADD COLUMN stock_status TEXT DEFAULT NULL")

    # Repair Jobs table
    cursor.execute("""
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
    """)

    # Repair Status History table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS repair_status_history (
        id TEXT PRIMARY KEY,
        repair_id TEXT NOT NULL,
        old_status TEXT,
        new_status TEXT NOT NULL,
        note TEXT,
        created_at TEXT
    );
    """)

    # EMI Plans table
    cursor.execute("""
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
    """)

    # Shop Settings table
    cursor.execute("""
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
    """)

    # Admin Users table
    cursor.execute("""
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
    """)

    # Safe Schema Migrations for existing admin_users table
    cursor.execute("PRAGMA table_info(admin_users)")
    existing_admin_cols = [row["name"] for row in cursor.fetchall()]
    if "token_version" not in existing_admin_cols:
        cursor.execute("ALTER TABLE admin_users ADD COLUMN token_version INTEGER DEFAULT 1")

    # Check if products already exist
    cursor.execute("SELECT COUNT(*) as count FROM products")
    if cursor.fetchone()["count"] == 0:
        seed_products(cursor)

    # Check if repair jobs already exist
    cursor.execute("SELECT COUNT(*) as count FROM repair_jobs")
    if cursor.fetchone()["count"] == 0:
        seed_repairs(cursor)

    # Check if repair status history exists; if empty, backfill from repair_jobs
    cursor.execute("SELECT COUNT(*) as count FROM repair_status_history")
    if cursor.fetchone()["count"] == 0:
        cursor.execute("SELECT id, job_sheet_id, status, technician_notes, created_at FROM repair_jobs")
        for rep in cursor.fetchall():
            cursor.execute("""
            INSERT INTO repair_status_history (id, repair_id, old_status, new_status, note, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), rep["job_sheet_id"], None, rep["status"], rep["technician_notes"] or "Initial check-in", rep["created_at"]))

    # Check if EMI plans exist
    cursor.execute("SELECT COUNT(*) as count FROM emi_plans")
    if cursor.fetchone()["count"] == 0:
        seed_emi_plans(cursor)

    # Check if Shop Settings exist
    cursor.execute("SELECT COUNT(*) as count FROM shop_settings")
    if cursor.fetchone()["count"] == 0:
        cursor.execute("""
        INSERT INTO shop_settings (id, shop_name, tagline, phone1, phone2, whatsapp, email, address, opening_time, closing_time, weekly_off, google_maps_url, updated_at)
        VALUES ('default', 'Amit Mobile Shop', 'Smartphones, Certified Pre-Owned & Expert Repairs', '+91 98765 43210', '+91 91234 56789', '919876543210', 'contact@amitmobileshop.com', 'Main Market, Station Road, Opp. City Mall, Mirzapur, UP 231001', '10:00 AM', '09:00 PM', 'None (Open All 7 Days)', 'https://maps.google.com', ?)
        """, (datetime.now().isoformat(),))

    # Admin User Synchronization & Seeding:
    # Safely creates or updates the single admin account using configured ADMIN_USERNAME and ADMIN_PASSWORD
    cursor.execute("SELECT id, username, password_hash, token_version FROM admin_users ORDER BY created_at ASC LIMIT 1")
    primary_admin = cursor.fetchone()
    now_str = datetime.now().isoformat()

    if not primary_admin:
        # Initial creation if table is completely empty and ADMIN_PASSWORD is provided
        if ADMIN_PASSWORD:
            admin_id = str(uuid.uuid4())
            hashed = hash_password(ADMIN_PASSWORD)
            cursor.execute("""
            INSERT INTO admin_users (id, username, email, password_hash, role, is_active, token_version, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'owner', 1, 1, ?, ?)
            """, (admin_id, ADMIN_USERNAME, f"{ADMIN_USERNAME.lower()}@amitmobileshop.com", hashed, now_str, now_str))
    else:
        admin_id = primary_admin["id"]
        # 1. Update username & email if ADMIN_USERNAME is configured and differs from current username
        if ADMIN_USERNAME and primary_admin["username"] != ADMIN_USERNAME:
            cursor.execute("""
            UPDATE admin_users
            SET username = ?, email = ?, updated_at = ?
            WHERE id = ?
            """, (ADMIN_USERNAME, f"{ADMIN_USERNAME.lower()}@amitmobileshop.com", now_str, admin_id))

        # 2. Update password if ADMIN_PASSWORD is provided and differs from existing hash
        if ADMIN_PASSWORD and not verify_password(ADMIN_PASSWORD, primary_admin["password_hash"]):
            new_hash = hash_password(ADMIN_PASSWORD)
            cursor.execute("""
            UPDATE admin_users
            SET password_hash = ?, token_version = COALESCE(token_version, 1) + 1, updated_at = ?
            WHERE id = ?
            """, (new_hash, now_str, admin_id))

        # 3. Guarantee strictly one admin account exists by pruning any duplicate entries
        cursor.execute("DELETE FROM admin_users WHERE id != ?", (admin_id,))

    conn.commit()
    conn.close()

def seed_products(cursor):
    sample_products = [
        # New phones
        (
            str(uuid.uuid4()), "Samsung Galaxy S24 Ultra 5G", "Samsung", "Galaxy S24 Ultra", "new",
            129999.0, 134999.0, "12GB / 256GB", "Titanium Black", "100%",
            "1 Year Official Samsung Warranty", 1, 1, 1,
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
            1, 1, "Brand new flagship with Galaxy AI, 200MP camera, Snapdragon 8 Gen 3.", datetime.now().isoformat()
        ),
        (
            str(uuid.uuid4()), "Vivo V30 Pro 5G", "Vivo", "V30 Pro", "new",
            41999.0, 46999.0, "8GB / 256GB", "Andaman Blue", "100%",
            "1 Year Official Brand Warranty", 1, 1, 0,
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
            1, 1, "Zeiss professional portrait camera with smart Aura Light.", datetime.now().isoformat()
        ),
        (
            str(uuid.uuid4()), "Realme 12 Pro+ 5G", "Realme", "12 Pro Plus", "new",
            29999.0, 34999.0, "8GB / 128GB", "Submarine Blue", "100%",
            "1 Year Official Brand Warranty", 1, 1, 0,
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
            1, 0, "64MP Periscope portrait camera, luxury golden flute bezel design.", datetime.now().isoformat()
        ),
        (
            str(uuid.uuid4()), "Redmi Note 13 Pro 5G", "Xiaomi", "Redmi Note 13 Pro", "new",
            24999.0, 28999.0, "8GB / 128GB", "Arctic White", "100%",
            "1 Year Official Brand Warranty", 1, 1, 0,
            "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop&q=80",
            1, 0, "200MP camera with OIS, 1.5K 120Hz AMOLED display, 67W Turbo Charge.", datetime.now().isoformat()
        ),
        (
            str(uuid.uuid4()), "OnePlus 12R 5G", "OnePlus", "12R", "new",
            39999.0, 42999.0, "8GB / 128GB", "Cool Blue", "100%",
            "1 Year Official Brand Warranty", 1, 1, 0,
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
            1, 1, "Snapdragon 8 Gen 2, 4th Gen LTPO 120Hz display, 5500mAh battery.", datetime.now().isoformat()
        ),
        (
            str(uuid.uuid4()), "Samsung Galaxy A35 5G", "Samsung", "Galaxy A35", "new",
            27999.0, 30999.0, "8GB / 128GB", "Awesome Navy", "100%",
            "1 Year Official Samsung Warranty", 1, 1, 1,
            "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80",
            1, 0, "Super AMOLED 120Hz screen, IP67 water resistance, Knox Security.", datetime.now().isoformat()
        ),

        # Second-Hand / Refurbished Phones
        (
            str(uuid.uuid4()), "Apple iPhone 13 (Refurbished)", "Apple", "iPhone 13", "like_new",
            38999.0, 59900.0, "128GB", "Midnight", "89% Battery Health",
            "6 Months Shop Warranty + Cash Bill", 1, 1, 0,
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
            1, 1, "Pristine condition, zero scratches on screen, genuine battery, 32-point inspection passed.", datetime.now().isoformat()
        ),
        (
            str(uuid.uuid4()), "Apple iPhone 12 (Refurbished)", "Apple", "iPhone 12", "good",
            27999.0, 49900.0, "64GB", "Blue", "86% Battery Health",
            "3 Months Shop Warranty + Cash Bill", 1, 1, 0,
            "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&auto=format&fit=crop&q=80",
            1, 0, "Super Retina XDR OLED, minor cosmetic frame wear, 100% genuine parts.", datetime.now().isoformat()
        ),
        (
            str(uuid.uuid4()), "OnePlus 10 Pro 5G (Pre-Owned)", "OnePlus", "10 Pro", "like_new",
            26499.0, 66999.0, "8GB / 128GB", "Emerald Green", "92% Battery Health",
            "6 Months Shop Warranty", 1, 1, 0,
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
            1, 1, "Flagship Hasselblad camera, 80W fast charger in box, thoroughly certified.", datetime.now().isoformat()
        ),
        (
            str(uuid.uuid4()), "Samsung Galaxy S21 FE 5G (Pre-Owned)", "Samsung", "Galaxy S21 FE", "good",
            18999.0, 49999.0, "8GB / 128GB", "Graphite", "88% Battery Health",
            "3 Months Shop Warranty", 1, 1, 1,
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
            1, 0, "120Hz Dynamic AMOLED display, pro-grade camera, fully tested motherboard.", datetime.now().isoformat()
        ),
        (
            str(uuid.uuid4()), "Vivo V27 5G (Refurbished)", "Vivo", "V27", "like_new",
            19999.0, 32999.0, "8GB / 128GB", "Magic Blue (Color Changing)", "91% Battery Health",
            "6 Months Shop Warranty", 1, 1, 0,
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
            1, 0, "Flawless color-changing back glass, Sony IMX766V sensor with OIS.", datetime.now().isoformat()
        )
    ]
    cursor.executemany("""
    INSERT INTO products (
        id, title, brand, model, condition, price, original_price, ram_storage, color,
        battery_health, warranty_info, emi_bajaj, emi_tvs, emi_samsung, image_url,
        in_stock, featured, description, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_products)

def seed_repairs(cursor):
    sample_repairs = [
        (
            str(uuid.uuid4()), "AMS-101", "Rahul Sharma", "9876543210", "Samsung", "Galaxy M31",
            "Display / Folder Combo Replacement", "Front glass shattered after drop, black ink spot.",
            "In Repair", 1850.0, None, "Original AMOLED folder fitting in progress. Frame cleaned.",
            "Amit Mobile Shop Expert", "2025-05-10 10:30:00", "2025-05-10 14:15:00"
        ),
        (
            str(uuid.uuid4()), "AMS-102", "Pooja Verma", "9123456780", "Apple", "iPhone 11",
            "Battery Replacement", "Battery draining in 3 hours, backup critical.",
            "Ready for Pickup", 2200.0, 2200.0, "Installed certified high-capacity battery. 100% health verified.",
            "Amit Mobile Shop Expert", "2025-05-09 11:00:00", "2025-05-10 16:30:00"
        ),
        (
            str(uuid.uuid4()), "AMS-103", "Vikram Singh", "9988776655", "Realme", "Narzo 50",
            "Charging Port / Sub-board", "Cable wobbles, not fast charging.",
            "Received", 650.0, None, "Device checked in, queueing for microscope pin solder inspection.",
            "Amit Mobile Shop Expert", "2025-05-10 16:00:00", "2025-05-10 16:00:00"
        ),
        (
            str(uuid.uuid4()), "AMS-104", "Deepak Kumar", "9450123456", "Xiaomi", "Redmi Note 10 Pro",
            "Camera Glass & Motherboard Clean", "Rear camera blurred, slight moisture inside lens.",
            "Delivered", 1100.0, 1100.0, "Ultrasonic cleaning completed. Lens replaced. Delivered to customer.",
            "Amit Mobile Shop Expert", "2025-05-08 14:00:00", "2025-05-09 18:00:00"
        )
    ]
    cursor.executemany("""
    INSERT INTO repair_jobs (
        id, job_sheet_id, customer_name, customer_phone, device_brand, device_model,
        issue_type, issue_description, status, estimated_cost, final_cost,
        technician_notes, technician_name, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_repairs)

def seed_emi_plans(cursor):
    sample_plans = [
        (str(uuid.uuid4()), None, "Bajaj Finserv", 6, 0.0, 4999.0, 199.0, 0.0, 1, datetime.now().isoformat()),
        (str(uuid.uuid4()), None, "Bajaj Finserv", 9, 0.0, 3499.0, 249.0, 0.0, 1, datetime.now().isoformat()),
        (str(uuid.uuid4()), None, "TVS Credit", 12, 1999.0, 2899.0, 299.0, 3.5, 1, datetime.now().isoformat()),
        (str(uuid.uuid4()), None, "Samsung Finance+", 6, 0.0, 4850.0, 0.0, 0.0, 1, datetime.now().isoformat()),
        (str(uuid.uuid4()), None, "HDFC Bank EasyEMI", 12, 0.0, 2750.0, 199.0, 2.5, 1, datetime.now().isoformat()),
    ]
    cursor.executemany("""
    INSERT INTO emi_plans (id, product_id, provider, duration_months, down_payment, monthly_emi, processing_fee, interest_rate, available, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_plans)

def compute_stock_status(stock_count: Optional[int], manual_status: Optional[str] = None) -> str:
    if manual_status and manual_status.strip().upper() == "COMING SOON":
        return "COMING SOON"
    count = int(stock_count if stock_count is not None else 1)
    if count <= 0:
        return "OUT OF STOCK"
    elif 1 <= count <= 5:
        return "LOW STOCK"
    else:
        return "IN STOCK"

# Database Query Helper Functions
def _row_to_product_dict(row: sqlite3.Row) -> Dict[str, Any]:
    d = dict(row)
    d["emi_bajaj"] = bool(d.get("emi_bajaj", 1))
    d["emi_tvs"] = bool(d.get("emi_tvs", 1))
    d["emi_samsung"] = bool(d.get("emi_samsung", 1))
    d["in_stock"] = bool(d.get("in_stock", 1))
    d["featured"] = bool(d.get("featured", 0))
    d["category"] = d.get("category") or "Smartphones"
    d["variant"] = d.get("variant")
    stock_cnt = int(d.get("stock_count", 1) if d.get("stock_count") is not None else (1 if d["in_stock"] else 0))
    d["stock_count"] = stock_cnt
    d["stock_status"] = d.get("stock_status") or compute_stock_status(stock_cnt)
    return d

def fetch_all_products(
    condition: Optional[str] = None,
    brand: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    include_out_of_stock: bool = False
) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM products WHERE 1=1"
    params = []
    
    if not include_out_of_stock:
        query += " AND in_stock = 1"
    
    if condition:
        if condition == "new":
            query += " AND condition = 'new'"
        elif condition in ["refurbished", "second_hand"]:
            query += " AND condition IN ('like_new', 'good', 'fair')"
        else:
            query += " AND LOWER(condition) = LOWER(?)"
            params.append(condition)
    
    if brand and brand.lower() != "all":
        query += " AND LOWER(brand) = LOWER(?)"
        params.append(brand)
        
    if category and category.lower() != "all":
        query += " AND LOWER(category) = LOWER(?)"
        params.append(category)

    if search:
        pattern = f"%{search.strip().lower()}%"
        query += " AND (LOWER(title) LIKE ? OR LOWER(model) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(description) LIKE ?)"
        params.extend([pattern, pattern, pattern, pattern])
        
    query += " ORDER BY featured DESC, price ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [_row_to_product_dict(r) for r in rows]

def fetch_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return _row_to_product_dict(row)
    return None

def create_product(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    product_id = data.get("id") or str(uuid.uuid4())
    now_str = datetime.now().isoformat()
    
    stock_count_val = int(data.get("stock_count", 1))
    manual_stock_status = data.get("stock_status")
    calculated_status = compute_stock_status(stock_count_val, manual_stock_status)
    
    if calculated_status == "OUT OF STOCK" or stock_count_val <= 0:
        in_stock_val = 0
        stock_count_val = 0
    else:
        in_stock_val = 1 if data.get("in_stock", True) else 0
        
    cursor.execute("""
    INSERT INTO products (
        id, title, brand, model, category, variant, condition, price, original_price, ram_storage, color,
        battery_health, warranty_info, emi_bajaj, emi_tvs, emi_samsung, image_url,
        in_stock, stock_count, stock_status, featured, description, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        product_id,
        data["title"],
        data["brand"],
        data.get("model") or data["title"],
        data.get("category", "Smartphones"),
        data.get("variant"),
        data.get("condition", "new"),
        float(data["price"]),
        float(data["original_price"]) if data.get("original_price") is not None else None,
        data.get("ram_storage"),
        data.get("color"),
        data.get("battery_health"),
        data.get("warranty_info", "Shop Warranty Included"),
        1 if data.get("emi_bajaj", True) else 0,
        1 if data.get("emi_tvs", True) else 0,
        1 if data.get("emi_samsung", True) else 0,
        data.get("image_url"),
        in_stock_val,
        stock_count_val,
        calculated_status,
        1 if data.get("featured", False) else 0,
        data.get("description"),
        data.get("created_at") or now_str
    ))
    conn.commit()
    conn.close()
    
    return fetch_product_by_id(product_id)

def update_product(product_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return None
        
    allowed_fields = [
        "title", "brand", "model", "category", "variant", "condition", "price", "original_price",
        "ram_storage", "color", "battery_health", "warranty_info", "emi_bajaj",
        "emi_tvs", "emi_samsung", "image_url", "in_stock", "stock_count", "stock_status",
        "featured", "description"
    ]
    
    updates = []
    params = []
    
    # Calculate synced stock values
    new_stock_count = data.get("stock_count") if "stock_count" in data else existing["stock_count"]
    new_stock_count = int(new_stock_count if new_stock_count is not None else 1)
    manual_status = data.get("stock_status") if "stock_status" in data else existing["stock_status"]
    calculated_status = compute_stock_status(new_stock_count, manual_status)
    
    for key, value in data.items():
        if key in allowed_fields:
            if key in ["emi_bajaj", "emi_tvs", "emi_samsung", "featured"]:
                updates.append(f"{key} = ?")
                params.append(1 if value else 0)
            elif key in ["in_stock", "stock_count", "stock_status"]:
                pass  # Synced explicitly below
            elif key in ["price", "original_price"]:
                updates.append(f"{key} = ?")
                params.append(float(value) if value is not None else None)
            else:
                updates.append(f"{key} = ?")
                params.append(value)
                
    updates.append("stock_count = ?")
    params.append(new_stock_count)
    updates.append("stock_status = ?")
    params.append(calculated_status)
    updates.append("in_stock = ?")
    if "in_stock" in data and not data["in_stock"]:
        params.append(0)
    else:
        params.append(0 if calculated_status == "OUT OF STOCK" or new_stock_count <= 0 else 1)

    if updates:
        query = f"UPDATE products SET {', '.join(updates)} WHERE id = ?"
        params.append(product_id)
        cursor.execute(query, params)
        conn.commit()
        
    conn.close()
    return fetch_product_by_id(product_id)

def delete_product(product_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM products WHERE id = ?", (product_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return True

def is_image_url_in_use(image_url: str, exclude_product_id: Optional[str] = None) -> bool:
    """Check if an image URL is still referenced by any other product in the database."""
    if not image_url:
        return False
    conn = get_connection()
    cursor = conn.cursor()
    if exclude_product_id:
        cursor.execute("SELECT COUNT(*) as cnt FROM products WHERE image_url = ? AND id != ?", (image_url, exclude_product_id))
    else:
        cursor.execute("SELECT COUNT(*) as cnt FROM products WHERE image_url = ?", (image_url,))
    row = cursor.fetchone()
    count = row["cnt"] if row else 0
    conn.close()
    return count > 0


def fetch_repair_job(identifier: str) -> Optional[Dict[str, Any]]:
    clean = (identifier or "").strip()
    if not clean:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM repair_jobs WHERE id = ? OR UPPER(job_sheet_id) = UPPER(?)", (clean, clean))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    d = dict(row)
    # Fetch status history
    cursor.execute(
        "SELECT * FROM repair_status_history WHERE repair_id = ? OR repair_id = ? ORDER BY created_at ASC",
        (d["id"], d["job_sheet_id"])
    )
    h_rows = cursor.fetchall()
    d["history"] = [dict(h) for h in h_rows]
    conn.close()
    return d

def update_repair_status(
    repair_id: str,
    new_status: str,
    technician_notes: Optional[str] = None,
    final_cost: Optional[float] = None
) -> Optional[Dict[str, Any]]:
    clean = (repair_id or "").strip()
    if not clean:
        return None
        
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, job_sheet_id, status FROM repair_jobs WHERE id = ? OR UPPER(job_sheet_id) = UPPER(?)",
        (clean, clean)
    )
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return None
        
    actual_id = existing["id"]
    job_sheet_id = existing["job_sheet_id"]
    old_status = existing["status"]
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    updates = ["status = ?", "updated_at = ?"]
    params = [new_status, now_str]
    
    if technician_notes is not None:
        updates.append("technician_notes = ?")
        params.append(technician_notes)
        
    if final_cost is not None:
        updates.append("final_cost = ?")
        params.append(final_cost)
        
    params.append(actual_id)
    query = f"UPDATE repair_jobs SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(query, params)

    # Record history entry
    hist_note = technician_notes if technician_notes is not None else f"Status transitioned from {old_status} to {new_status}"
    cursor.execute("""
    INSERT INTO repair_status_history (id, repair_id, old_status, new_status, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (str(uuid.uuid4()), job_sheet_id, old_status, new_status, hist_note, now_str))

    conn.commit()
    conn.close()
    
    return fetch_repair_job(job_sheet_id)

def fetch_repair_history(identifier: str) -> List[Dict[str, Any]]:
    clean = (identifier or "").strip()
    if not clean:
        return []
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, job_sheet_id FROM repair_jobs WHERE id = ? OR UPPER(job_sheet_id) = UPPER(?)", (clean, clean))
    rep = cursor.fetchone()
    if not rep:
        conn.close()
        return []
    cursor.execute(
        "SELECT * FROM repair_status_history WHERE repair_id = ? OR repair_id = ? ORDER BY created_at ASC",
        (rep["id"], rep["job_sheet_id"])
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def fetch_all_repairs(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM repair_jobs ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_new_repair_job(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    # Generate sequential AMS Job Sheet ID
    cursor.execute("SELECT COUNT(*) as count FROM repair_jobs")
    count = cursor.fetchone()["count"]
    job_sheet_id = f"AMS-{105 + count}"
    
    record_id = str(uuid.uuid4())
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
    INSERT INTO repair_jobs (
        id, job_sheet_id, customer_name, customer_phone, device_brand, device_model,
        issue_type, issue_description, status, estimated_cost, technician_notes,
        technician_name, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id, job_sheet_id, data["customer_name"], data["customer_phone"],
        data["device_brand"], data["device_model"], data["issue_type"],
        data.get("issue_description", ""), "Received", data.get("estimated_cost", 0.0),
        "Job registered online via Amit Mobile Shop Portal.", "Amit Mobile Shop Expert",
        now_str, now_str
    ))

    # Log initial status history
    cursor.execute("""
    INSERT INTO repair_status_history (id, repair_id, old_status, new_status, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (str(uuid.uuid4()), job_sheet_id, None, "Received", "Device registered in store.", now_str))

    conn.commit()
    conn.close()
    
    return fetch_repair_job(job_sheet_id)

def get_admin_by_username(username: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?)", (username.strip(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        d["is_active"] = bool(d["is_active"])
        d["token_version"] = d.get("token_version") or 1
        return d
    return None

def get_admin_by_id(admin_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_users WHERE id = ?", (admin_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        d["is_active"] = bool(d["is_active"])
        d["token_version"] = d.get("token_version") or 1
        return d
    return None

def update_admin_password(admin_id: str, new_password_hash: str) -> bool:
    """
    Update administrator password and increment token_version to invalidate prior JWT sessions.
    """
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()
    cursor.execute("""
    UPDATE admin_users
    SET password_hash = ?, token_version = COALESCE(token_version, 1) + 1, updated_at = ?
    WHERE id = ?
    """, (new_password_hash, now_str, admin_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def create_admin_user(username: str, password_hash: str, email: Optional[str] = None, role: str = "admin") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    admin_id = str(uuid.uuid4())
    now_str = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO admin_users (id, username, email, password_hash, role, is_active, token_version, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)
    """, (admin_id, username.strip(), email, password_hash, role, now_str, now_str))
    conn.commit()
    conn.close()
    return get_admin_by_id(admin_id)

# --- EMI Plans Database Operations ---
def fetch_all_emi_plans(product_id: Optional[str] = None, available_only: bool = True) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM emi_plans WHERE 1=1"
    params = []
    if available_only:
        query += " AND available = 1"
    if product_id:
        query += " AND (product_id = ? OR product_id IS NULL)"
        params.append(product_id)
    query += " ORDER BY duration_months ASC, monthly_emi ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["available"] = bool(d.get("available", 1))
        result.append(d)
    return result

def fetch_emi_plan_by_id(plan_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emi_plans WHERE id = ?", (plan_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        d["available"] = bool(d.get("available", 1))
        return d
    return None

def create_emi_plan(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    plan_id = data.get("id") or str(uuid.uuid4())
    now_str = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO emi_plans (id, product_id, provider, duration_months, down_payment, monthly_emi, processing_fee, interest_rate, available, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        plan_id,
        data.get("product_id"),
        data["provider"],
        int(data["duration_months"]),
        float(data.get("down_payment", 0.0)),
        float(data["monthly_emi"]),
        float(data.get("processing_fee", 0.0)),
        float(data.get("interest_rate", 0.0)),
        1 if data.get("available", True) else 0,
        now_str
    ))
    conn.commit()
    conn.close()
    return fetch_emi_plan_by_id(plan_id)

def update_emi_plan(plan_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM emi_plans WHERE id = ?", (plan_id,))
    if not cursor.fetchone():
        conn.close()
        return None
    allowed = ["product_id", "provider", "duration_months", "down_payment", "monthly_emi", "processing_fee", "interest_rate", "available"]
    updates = []
    params = []
    for k, v in data.items():
        if k in allowed:
            if k == "available":
                updates.append("available = ?")
                params.append(1 if v else 0)
            elif k == "duration_months":
                updates.append(f"{k} = ?")
                params.append(int(v))
            elif k in ["down_payment", "monthly_emi", "processing_fee", "interest_rate"]:
                updates.append(f"{k} = ?")
                params.append(float(v))
            else:
                updates.append(f"{k} = ?")
                params.append(v)
    if updates:
        params.append(plan_id)
        cursor.execute(f"UPDATE emi_plans SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
    conn.close()
    return fetch_emi_plan_by_id(plan_id)

def delete_emi_plan(plan_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM emi_plans WHERE id = ?", (plan_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

# --- Shop Settings Operations ---
def fetch_shop_settings() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shop_settings WHERE id = 'default'")
    row = cursor.fetchone()
    if not row:
        now_str = datetime.now().isoformat()
        cursor.execute("""
        INSERT INTO shop_settings (id, shop_name, tagline, phone1, phone2, whatsapp, email, address, opening_time, closing_time, weekly_off, google_maps_url, updated_at)
        VALUES ('default', 'Amit Mobile Shop', 'Smartphones, Certified Pre-Owned & Expert Repairs', '+91 98765 43210', '+91 91234 56789', '919876543210', 'contact@amitmobileshop.com', 'Main Market, Station Road, Opp. City Mall, Mirzapur, UP 231001', '10:00 AM', '09:00 PM', 'None (Open All 7 Days)', 'https://maps.google.com', ?)
        """, (now_str,))
        conn.commit()
        cursor.execute("SELECT * FROM shop_settings WHERE id = 'default'")
        row = cursor.fetchone()
    conn.close()
    return dict(row)

def update_shop_settings(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    # Ensure default row exists
    fetch_shop_settings()
    allowed = ["shop_name", "tagline", "phone1", "phone2", "whatsapp", "email", "address", "opening_time", "closing_time", "weekly_off", "google_maps_url"]
    updates = []
    params = []
    for k, v in data.items():
        if k in allowed and v is not None:
            updates.append(f"{k} = ?")
            params.append(v)
    if updates:
        now_str = datetime.now().isoformat()
        updates.append("updated_at = ?")
        params.append(now_str)
        params.append("default")
        cursor.execute(f"UPDATE shop_settings SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
    conn.close()
    return fetch_shop_settings()

def get_admin_dashboard_stats() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as count FROM products")
    total_products = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM products WHERE in_stock = 1")
    in_stock_products = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM products WHERE stock_status = 'LOW STOCK' OR (stock_count > 0 AND stock_count <= 5)")
    low_stock_products = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM products WHERE in_stock = 0 OR stock_count = 0 OR stock_status = 'OUT OF STOCK'")
    out_of_stock_products = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM repair_jobs")
    total_repairs = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM repair_jobs WHERE status NOT IN ('Delivered', 'Cancelled')")
    pending_repairs = cursor.fetchone()["count"]

    # Repair status distribution breakdown
    cursor.execute("SELECT status, COUNT(*) as cnt FROM repair_jobs GROUP BY status")
    breakdown_rows = cursor.fetchall()
    status_breakdown = {
        "Received": 0,
        "In Repair": 0,
        "Waiting for Parts": 0,
        "Waiting for Approval": 0,
        "Ready for Pickup": 0,
        "Delivered": 0,
        "Cancelled": 0
    }
    for row in breakdown_rows:
        status_breakdown[row["status"]] = row["cnt"]

    # 5 most recent products
    cursor.execute("SELECT * FROM products ORDER BY created_at DESC LIMIT 5")
    recent_products = [_row_to_product_dict(r) for r in cursor.fetchall()]

    # 5 most recent repair jobs
    cursor.execute("SELECT * FROM repair_jobs ORDER BY created_at DESC LIMIT 5")
    recent_repairs = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    return {
        "total_products": total_products,
        "in_stock_products": in_stock_products,
        "low_stock_products": low_stock_products,
        "out_of_stock_products": out_of_stock_products,
        "total_repairs": total_repairs,
        "pending_repairs": pending_repairs,
        "status_breakdown": status_breakdown,
        "recent_products": recent_products,
        "recent_repairs": recent_repairs
    }

# Initialize on module load
init_db()

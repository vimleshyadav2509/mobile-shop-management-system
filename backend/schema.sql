-- =====================================================================
-- Amit Mobile Shop - Database Schema
-- Address: Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312
-- Compatible with PostgreSQL & Supabase
-- =====================================================================

-- 1. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    address TEXT DEFAULT 'Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Products Table (New & Refurbished Phones)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    ram_storage VARCHAR(100),
    color VARCHAR(50),
    battery_health VARCHAR(50),
    warranty_info VARCHAR(255) DEFAULT 'Shop Warranty Included',
    emi_bajaj BOOLEAN DEFAULT TRUE,
    emi_tvs BOOLEAN DEFAULT TRUE,
    emi_samsung BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_count INTEGER DEFAULT 1,
    featured BOOLEAN DEFAULT FALSE,
    category VARCHAR(100) DEFAULT 'Smartphones',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Repair Jobs Table (Live Job Sheet Tracking)
CREATE TABLE IF NOT EXISTS repair_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_sheet_id VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    device_brand VARCHAR(100) NOT NULL,
    device_model VARCHAR(150) NOT NULL,
    issue_type VARCHAR(150) NOT NULL,
    issue_description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Received' 
        CHECK (status IN ('Received', 'Diagnosis', 'In Repair', 'Waiting for Parts', 'Quality Check', 'Ready for Pickup', 'Delivered', 'Cancelled')),
    estimated_cost DECIMAL(10, 2) NOT NULL,
    final_cost DECIMAL(10, 2),
    technician_notes TEXT,
    technician_name VARCHAR(100) DEFAULT 'Amit Mobile Shop Expert',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Admin Users Table (Shop Owner & Staff Auth)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_job_sheet_id ON repair_jobs(job_sheet_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_phone ON repair_jobs(customer_phone);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);


-- Seed Initial Mock Data
INSERT INTO products (title, brand, model, condition, price, original_price, ram_storage, color, warranty_info, emi_bajaj, emi_tvs, emi_samsung, image_url, in_stock, featured, description)
VALUES
('Samsung Galaxy S24 Ultra 5G', 'Samsung', 'Galaxy S24 Ultra', 'new', 129999, 134999, '12GB / 256GB', 'Titanium Black', '1 Year Official Samsung Warranty', TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80', TRUE, TRUE, 'Brand new flagship with Galaxy AI, 200MP camera, Snapdragon 8 Gen 3.'),
('Vivo V30 Pro 5G', 'Vivo', 'V30 Pro', 'new', 41999, 46999, '8GB / 256GB', 'Andaman Blue', '1 Year Official Brand Warranty', TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80', TRUE, TRUE, 'Zeiss professional portrait camera, slim 3D curved display.'),
('Realme 12 Pro+ 5G', 'Realme', '12 Pro Plus', 'new', 29999, 34999, '8GB / 128GB', 'Submarine Blue', '1 Year Official Brand Warranty', TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', TRUE, FALSE, 'Periscope portrait camera, luxury watch design by Ollivier Saveo.'),
('Redmi Note 13 Pro 5G', 'Xiaomi', 'Redmi Note 13 Pro', 'new', 24999, 28999, '8GB / 128GB', 'Arctic White', '1 Year Official Brand Warranty', TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop&q=80', TRUE, FALSE, '200MP camera with OIS, 1.5K AMOLED display, 67W Turbo Charge.'),
('OnePlus 12R 5G', 'OnePlus', '12R', 'new', 39999, 42999, '8GB / 128GB', 'Cool Blue', '1 Year Official Brand Warranty', TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80', TRUE, TRUE, 'Snapdragon 8 Gen 2, 4th Gen LTPO 120Hz display, 100W SuperVOOC.'),
('Apple iPhone 13 (Refurbished)', 'Apple', 'iPhone 13', 'like_new', 38999, 59900, '128GB', 'Midnight', '6 Months Shop Warranty + Bill', TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80', TRUE, TRUE, 'Flawless condition, 89% battery health, fully tested 32-point inspection.'),
('Apple iPhone 12 (Refurbished)', 'Apple', 'iPhone 12', 'good', 27999, 49900, '64GB', 'Blue', '3 Months Shop Warranty + Bill', TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&auto=format&fit=crop&q=80', TRUE, FALSE, 'Minor pocket wear, 86% battery health, 100% original OLED display.'),
('OnePlus 10 Pro 5G (Pre-Owned)', 'OnePlus', '10 Pro', 'like_new', 26499, 66999, '8GB / 128GB', 'Emerald Green', '6 Months Shop Warranty', TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80', TRUE, FALSE, 'Hasselblad camera, pristine condition with original 80W charger.'),
('Samsung Galaxy S21 FE 5G (Pre-Owned)', 'Samsung', 'Galaxy S21 FE', 'good', 18999, 49999, '8GB / 128GB', 'Graphite', '3 Months Shop Warranty', TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80', TRUE, FALSE, '120Hz Dynamic AMOLED, triple camera, clean condition.');

-- Seed Initial Repair Jobs for Live Tracking
INSERT INTO repair_jobs (job_sheet_id, customer_name, customer_phone, device_brand, device_model, issue_type, issue_description, status, estimated_cost, technician_notes)
VALUES
('AMS-101', 'Rahul Sharma', '9876543210', 'Samsung', 'Galaxy M31', 'Display / Combo Replacement', 'Cracked outer glass and touch unresponsive in upper right quadrant.', 'In Repair', 1850, 'Original AMOLED folder being installed by Amit.'),
('AMS-102', 'Pooja Verma', '9123456780', 'Apple', 'iPhone 11', 'Battery Replacement', 'Battery health degraded to 72%, phone draining rapidly.', 'Ready for Pickup', 2200, 'Original high-capacity battery replaced. Tested 100% health, ready for collection at shop counter.'),
('AMS-103', 'Vikram Singh', '9988776655', 'Realme', 'Narzo 50', 'Charging Port / Sub-board', 'Loose Type-C port, charging drops continuously.', 'Received', 650, 'Inspected under microscope, sub-board replacement queued.');

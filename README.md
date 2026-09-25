# Mobile Shop Management System

Full-stack mobile shop management system for product inventory, mobile repair tracking, EMI plans, shop management, and customer services.

---

## Project Overview

The **Mobile Shop Management System** is an enterprise-grade, full-stack business management application specifically designed for retail mobile device stores and express repair centers. It addresses daily retail operations including:

* **Mobile Inventory & Catalogue**: Real-time stock counts, categorized browsing (New/Refurbished), automated stock status transitions (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`, `COMING SOON`).
* **Product Pricing & Image Management**: Local image uploads with cryptographic verification, automatic orphaned image cleanup, and external CDN fallback.
* **Mobile Repair Tracking**: Customer-facing real-time job-sheet tracker (`AMS-101`, `AMS-102`, etc.) with transparent status timeline, technician notes, and delivery cost breakdown.
* **Repair Status History**: Comprehensive audit trail of every status transition (`Received`, `Diagnosing`, `Waiting for Parts`, `Waiting for Approval`, `In Repair`, `Quality Check`, `Ready for Pickup`, `Delivered`, `Cancelled`).
* **EMI Plans & Financing**: Dynamic database-backed EMI calculator supporting multiple financial partners (Bajaj Finserv, TVS Credit, Samsung Finance+, Kotak SmartEMI) with down payment and tenure customization.
* **Shop Settings**: Centralized store profile management (store name, contact numbers, address, business hours, hero tagline) reflected live across storefront and WhatsApp click-to-chat links.
* **Customer Services**: Bilingual interface (Hindi / English), responsive device support, and seamless WhatsApp click-to-chat direct integration.
* **Operational Admin Dashboard**: Real-time business KPIs, low-stock alerts, repair workbench breakdown, recent product catalogue additions, and quick stock updates.

---

## Features

### Customer Features
* **Browse Mobile Phones**: Explore new releases and certified pre-owned devices with comprehensive technical specifications.
* **Product Search**: Instant search by device name, brand, processor, or storage configuration.
* **Product Filtering**: Filter products by brand, price range, condition (New / Refurbished), and stock availability.
* **Product Details**: Modal and detail views with high-definition imagery, warranty terms, and full hardware specs.
* **Stock Availability**: Live stock indicators displaying current item availability and real-time inventory status.
* **EMI Information**: Interactive EMI calculator for calculating monthly installments, down payments, and tenure options.
* **Repair Tracking**: Real-time ticket search by Job Sheet ID with step-by-step progress tracking, technician diagnostic notes, and estimated delivery dates.
* **Shop Information**: View live business operating hours, physical address, and contact numbers.
* **WhatsApp Contact**: Direct pre-filled WhatsApp click-to-chat links for both product inquiries and repair follow-ups.

### Admin Features
* **Secure Authentication**: Robust credential verification using bcrypt password hashing and token-versioned signed JWTs.
* **Product CRUD**: Add, edit, toggle stock, update pricing, and delete products from the inventory.
* **Product Image Management**: High-speed image uploads with mime-type checking, magic byte inspection, path traversal sanitization, and automatic replacement cleanup.
* **Inventory Management**: Automated stock quantity tracking with dynamic threshold alerts for low inventory.
* **Stock Management**: Single-click quick stock adjustment modal directly accessible from the dashboard.
* **Repair Management**: Complete lifecycle tracking of all customer repair tickets with status updates and diagnostic logs.
* **Repair Status History**: Complete chronological history of status changes, timestamps, and technician annotations.
* **EMI Management**: Create, update, toggle availability, and delete finance and EMI partner plans.
* **Shop Settings**: Update store contact numbers, address, and marketing taglines with real-time storefront synchronization.
* **Operational Dashboard**: Executive dashboard overview featuring key metrics, repair pipeline distribution, and low stock notifications.
* **Password Management**: In-app secure password updates with automatic session invalidation across all devices.

---

## Technology Stack

### Frontend
* **Core**: React 18 (`react`, `react-dom`)
* **Build Tool**: Vite 5
* **Routing**: React Router DOM v7
* **Styling**: Tailwind CSS & Vanilla CSS Design System
* **Icons**: Lucide React
* **Charts & Analytics**: Recharts
* **HTTP Client**: Axios

### Backend
* **Framework**: FastAPI (Python 3.10+)
* **ASGI Server**: Uvicorn
* **Data Validation**: Pydantic v2
* **Configuration**: Python Dotenv
* **Image Processing & Form Handling**: Python-Multipart

### Database
* **Engine**: SQLite 3 (Production schema compatible with PostgreSQL / Supabase)
* **Storage**: Local persistent database (`ams_store.db`) with relational foreign keys and indices

### Authentication & Security
* **Password Hashing**: Bcrypt
* **Token Standard**: Signed JWT (PyJWT) with token versioning (`token_version`)
* **Protection Middleware**: Custom CORS validation, rate limiting, and HTTP security headers

### Testing & Verification
* **Test Runner**: Custom automated test suites using Python `requests`
* **Test Coverage**:
  * Phase 4 Business Suite (`test_phase4_suite.py`)
  * Security Hardening Suite (`test_security_suite.py`)
  * Persistent Repair Tracker Suite (`test_repair_system.py`)
  * Product Image Upload Suite (`test_image_system.py`)
  * Backend Auth Suite (`test_backend_auth.py`)

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Customer / Admin                    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                  │
│       Storefront  •  Repair Tracker  •  Admin Portal   │
└───────────────────────────┬────────────────────────────┘
                            │ (JSON REST API / Proxy)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 FastAPI REST Backend                   │
│   Auth Middleware  •  Rate Limiting  •  Security       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Business Logic                      │
│   Inventory  •  Repairs  •  EMI  •  Settings  •  Auth  │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌────────────────────────┐      ┌────────────────────────┐
│     SQLite Database    │      │  Static Upload Storage │
│     (ams_store.db)     │      │   (/uploads/products)  │
└────────────────────────┘      └────────────────────────┘
```

### Image Upload Handling
1. **Validation**: Multipart uploads are inspected for size (< 5MB), MIME type (`image/jpeg`, `image/png`, `image/webp`), and magic byte file headers.
2. **Storage**: Images are renamed with UUIDs (`prod_<uuid>.<ext>`) and stored in `backend/static/uploads/products/`.
3. **Orphan Cleanup**: Updating or deleting a product automatically purges replaced or obsolete local images from disk while leaving external CDN URLs intact.
4. **Delivery**: Static files are delivered directly by FastAPI with path traversal guards and proxied via Vite during development.

---

## Project Structure

```
mobile-shop-management-system/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── admin.py
│   │   │   ├── auth.py
│   │   │   ├── emi.py
│   │   │   ├── estimator.py
│   │   │   ├── products.py
│   │   │   ├── repairs.py
│   │   │   └── settings.py
│   │   ├── ai_service.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── security.py
│   ├── static/
│   │   └── uploads/
│   │       └── products/
│   │           └── .gitkeep
│   ├── .env.example
│   ├── requirements.txt
│   ├── run.py
│   ├── schema.sql
│   └── seed_admin.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminHeader.jsx
│   │   │   │   ├── AdminKPI.jsx
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── AdminLoginPage.jsx
│   │   │   │   ├── AdminSidebar.jsx
│   │   │   │   ├── DashboardOverview.jsx
│   │   │   │   ├── EmiManager.jsx
│   │   │   │   ├── InventoryManager.jsx
│   │   │   │   ├── ProductsManager.jsx
│   │   │   │   ├── ProtectedAdminRoute.jsx
│   │   │   │   ├── RepairsManager.jsx
│   │   │   │   ├── SalesAnalyticsManager.jsx
│   │   │   │   ├── SettingsManager.jsx
│   │   │   │   └── WhatsAppInquiriesManager.jsx
│   │   │   ├── BuyingHub/
│   │   │   ├── RepairingHub/
│   │   │   ├── AccessoriesHub.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── ContactBar.jsx
│   │   │   ├── CustomerStorefront.jsx
│   │   │   ├── EMIBadges.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroBanner.jsx
│   │   │   ├── LanguageModal.jsx
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   ├── AdminThemeContext.jsx
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   ├── LanguageContext.jsx
│   │   │   └── ShopSettingsContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env.example
├── .gitignore
├── README.md
├── test_backend_auth.py
├── test_image_system.py
├── test_phase4_suite.py
├── test_repair_system.py
└── test_security_suite.py
```

---

## Security

* **JWT Authentication**: Secure stateless token issuance with expiration timestamps (`exp`), issued-at (`iat`), and subject identity (`sub`).
* **Strict JWT Validation**: Mandatory signature verification with rejection of tampered tokens, empty headers, and mismatched algorithms.
* **Token Versioning & Session Revocation**: Every password change increments `token_version` in the database, instantly invalidating all prior active tokens across devices.
* **Bcrypt Password Hashing**: Passwords are salted and hashed using `bcrypt` before storage. Plaintext passwords and hashes are never exposed via API responses.
* **Login Rate Limiting**: Exponential backoff and brute-force throttling (`429 Too Many Requests`) protecting login endpoints.
* **Explicit CORS Configuration**: Strict origin filtering permitting only authorized frontend domains (`ALLOWED_ORIGINS`).
* **HTTP Security Headers**: Enforcement of `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and strict `Referrer-Policy`.
* **Production Secret Validation**: Startup checks enforcing cryptographically random `JWT_SECRET_KEY` in production environments.
* **Protected Admin Mutations**: All write and delete actions on products, repair tickets, EMI configurations, and settings require valid administrator bearer tokens.
* **Input Validation**: Strict schema enforcement using Pydantic models for all incoming JSON payloads and query parameters.
* **Sanitized Errors**: Uniform error formats preventing database stack traces or system environment leakage.
* **Secure Image Upload Validation**: Inspection of file extensions, MIME headers, and magic byte signatures to block malicious payloads.
* **Path Traversal Protection**: Complete path sanitation preventing directory climbing (`../`) or direct access to internal database/environment files.
* **XSS Protection**: HTML entities sanitized across all customer and administrative user inputs.
* **Production Mock-Data Isolation**: Seamless fallback to demonstration data in local environments while isolating production data stores.

---

## Test Results

Automated test execution results verified against local services:

| Test Suite | Scope | Status | Score |
| :--- | :--- | :---: | :---: |
| **Phase 4 Business Suite** | Inventory, Repair Status History, EMI Plans, Shop Settings, Dashboard | **PASS** | 6/6 (100%) |
| **Security Hardening Suite** | Headers, JWT, Bcrypt, Rate Limiting, Traversal, Password Revocation, CORS | **PASS** | 43/43 (100%) |
| **Repair System Suite** | Ticket Lifecycle, Customer Tracker, SQLite Persistence, Proxy Validation | **PASS** | 14/14 (100%) |
| **Product Image System Suite** | Image Upload, Magic Byte Validation, Orphan Cleanup, CDN Fallback | **PASS** | 15/15 (100%) |
| **Frontend Production Build** | Vite production bundle compilation, asset minification | **PASS** | 1531 modules (100%) |

---

## Project Status

* **Phase 1 (Foundation & Authentication)**: Completed
* **Phase 2 (Core Business & Catalog)**: Completed
* **Phase 3 (Security & Hardening)**: Security Verified
* **Phase 4 (Enterprise Business Management)**: Completed

---

## Future Roadmap

The following enhancements are planned for future major releases:

* Point-of-Sale (POS) & offline billing terminal integration
* Automated GST-compliant invoice generation & PDF dispatch
* Customer profile accounts with self-service repair histories
* Role-based access control (RBAC) for shop technicians and cashiers
* Automated SMS & WhatsApp status notification webhooks
* Advanced inventory turnover analytics and predictive re-ordering
* Comprehensive inventory transaction audit logs
* Managed cloud database migration (PostgreSQL / Supabase)
* Multi-branch and multi-store central management

---

## Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+ and npm

### 1. Setup Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Seed initial administrator account:
python seed_admin.py --username admin --password your_secure_password
python run.py
```
FastAPI runs on `http://localhost:8000` with documentation at `http://localhost:8000/docs`.

### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Storefront runs on `http://localhost:5173` with Admin portal at `http://localhost:5173/admin/login`.

---

## Author

**Vimlesh Kumar Yadav**
GitHub: [@vimleshyadav2509](https://github.com/vimleshyadav2509)

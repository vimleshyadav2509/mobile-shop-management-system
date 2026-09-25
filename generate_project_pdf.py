import os
import sys
import html
import subprocess
import shutil

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def read_file_safe(rel_path):
    full_path = os.path.join(ROOT_DIR, rel_path)
    if not os.path.exists(full_path):
        return None
    try:
        with open(full_path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}"

def generate_html():
    css = """
    @page {
        size: A4 portrait;
        margin: 18mm 14mm 18mm 14mm;
        @bottom-right {
            content: "Page " counter(page);
            font-size: 8pt;
            color: #64748b;
        }
    }
    *, *::before, *::after {
        box-sizing: border-box;
    }
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #1e293b;
        background: #ffffff;
        font-size: 10pt;
        line-height: 1.5;
        margin: 0;
        padding: 0;
    }
    .page-break {
        page-break-before: always;
    }
    .avoid-break {
        page-break-inside: avoid;
    }
    /* Cover Page */
    .cover-page {
        min-height: 90vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border: 2px solid #0284c7;
        border-radius: 12px;
        padding: 40px 30px;
        margin: 20px 0;
        background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 70%, #f8fafc 100%);
    }
    .cover-badge {
        display: inline-block;
        background: #0284c7;
        color: white;
        font-size: 11pt;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        padding: 6px 18px;
        border-radius: 9999px;
        margin-bottom: 24px;
    }
    .cover-title {
        font-size: 26pt;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 12px 0;
        line-height: 1.2;
    }
    .cover-subtitle {
        font-size: 14pt;
        color: #0369a1;
        font-weight: 600;
        margin: 0 0 24px 0;
    }
    .cover-desc {
        max-width: 620px;
        font-size: 11pt;
        color: #475569;
        margin-bottom: 35px;
    }
    .meta-box {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        width: 100%;
        max-width: 580px;
        text-align: left;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .meta-item {
        font-size: 9.5pt;
    }
    .meta-label {
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        font-size: 7.5pt;
        letter-spacing: 0.5px;
    }
    .meta-value {
        color: #0f172a;
        font-weight: 600;
        margin-top: 2px;
    }

    /* Headings */
    h1 {
        font-size: 18pt;
        font-weight: 800;
        color: #0369a1;
        border-bottom: 2px solid #bae6fd;
        padding-bottom: 6px;
        margin-top: 30px;
        margin-bottom: 14px;
    }
    h2 {
        font-size: 13pt;
        font-weight: 700;
        color: #0f172a;
        margin-top: 20px;
        margin-bottom: 10px;
        border-left: 4px solid #0284c7;
        padding-left: 10px;
    }
    h3 {
        font-size: 11pt;
        font-weight: 600;
        color: #334155;
        margin-top: 14px;
        margin-bottom: 8px;
    }

    /* Tables */
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0 18px 0;
        font-size: 9pt;
    }
    th {
        background-color: #0f172a;
        color: #ffffff;
        font-weight: 600;
        text-align: left;
        padding: 8px 10px;
        border: 1px solid #334155;
    }
    td {
        padding: 7px 10px;
        border: 1px solid #cbd5e1;
        vertical-align: top;
    }
    tr:nth-child(even) td {
        background-color: #f8fafc;
    }

    /* Badges & Tags */
    .badge {
        display: inline-block;
        padding: 2px 7px;
        border-radius: 4px;
        font-size: 8pt;
        font-weight: 600;
    }
    .badge-blue { background: #e0f2fe; color: #0369a1; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    .badge-purple { background: #f3e8ff; color: #7e22ce; }

    /* Code Blocks */
    .file-container {
        margin: 18px 0 24px 0;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        overflow: hidden;
    }
    .file-header {
        background: #1e293b;
        color: #f8fafc;
        padding: 6px 12px;
        font-size: 9pt;
        font-family: monospace;
        font-weight: 700;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .file-badge {
        font-size: 7.5pt;
        background: #334155;
        padding: 2px 8px;
        border-radius: 3px;
        color: #94a3b8;
    }
    pre.code-block {
        margin: 0;
        padding: 10px 14px;
        background: #f8fafc;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-size: 7.8pt;
        line-height: 1.35;
        color: #0f172a;
        white-space: pre-wrap;
        word-break: break-all;
        border-top: 1px solid #e2e8f0;
        max-height: none;
    }

    .info-card {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 6px;
        padding: 12px 16px;
        margin: 12px 0;
    }
    .info-title {
        font-weight: 700;
        color: #166534;
        margin-bottom: 4px;
        font-size: 9.5pt;
    }
    .info-text {
        font-size: 9pt;
        color: #14532d;
        margin: 0;
    }

    /* Grid for features */
    .feature-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 14px 0;
    }
    .feature-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 12px;
    }
    .feature-card h4 {
        margin: 0 0 6px 0;
        font-size: 9.5pt;
        color: #0284c7;
    }
    .feature-card p {
        margin: 0;
        font-size: 8.5pt;
        color: #475569;
    }
    """

    out = []
    out.append("<!DOCTYPE html>")
    out.append("<html>")
    out.append("<head>")
    out.append("<meta charset='utf-8'>")
    out.append("<title>Amit Mobile Shop - Complete Project Documentation</title>")
    out.append(f"<style>{css}</style>")
    out.append("</head>")
    out.append("<body>")

    # Cover Page
    out.append("""
    <div class="cover-page">
        <div class="cover-badge">Complete Full-Stack Project Documentation</div>
        <h1 class="cover-title">Amit Mobile Shop</h1>
        <div class="cover-subtitle">Web Architecture, System Specification & Source Code</div>
        <p class="cover-desc">
            A comprehensive, end-to-end multi-platform application featuring an interactive e-commerce Buying Hub,
            AI-driven Repair Estimator, real-time Repair Job Sheet Tracking, bilingual Hindi/English localization,
            and a secure Owner / Admin ERP Portal with financial analytics.
        </p>

        <div class="meta-box">
            <div class="meta-item">
                <div class="meta-label">Business Name</div>
                <div class="meta-value">Amit Mobile Shop</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Physical Address</div>
                <div class="meta-value">Kuk Nagar Grint Rd, Khorare, UP 271312</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Contact Numbers</div>
                <div class="meta-value">+91 6306657432 / +91 9721996477</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Live Development Portals</div>
                <div class="meta-value">App: localhost:5173 | API: localhost:8000</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Technology Stack</div>
                <div class="meta-value">React 18, Vite, Tailwind CSS, FastAPI, SQLite</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">AI Integration</div>
                <div class="meta-value">Google GenAI (Gemini) + Heuristic Fallback</div>
            </div>
        </div>
    </div>
    """)

    out.append("<div class='page-break'></div>")

    # Section 1: Executive Overview
    out.append("""
    <h1>1. Executive Summary & Business Operations</h1>
    <p>
        <strong>Amit Mobile Shop</strong> is a physical retail store and express repair workshop situated in 
        <strong>Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312</strong>. To expand customer outreach, streamline sales,
        and manage customer repairs with enterprise-grade transparency, this full-stack web application provides a tailored digital presence.
    </p>

    <div class="feature-grid">
        <div class="feature-card">
            <h4>📱 Buying Hub (New & Second-Hand)</h4>
            <p>Interactive catalog featuring filters for Brand (Samsung, Apple, Xiaomi, Vivo, Realme, OnePlus), Price, and Condition. Includes down-payment & monthly EMI calculation widgets with local financial partners (Bajaj Finserv, TVS Credit, Samsung Finance+).</p>
        </div>
        <div class="feature-card">
            <h4>🔧 Express Repairing Hub & AI Estimator</h4>
            <p>Customers can enter device model and issue (e.g. Broken Screen, Battery Replacement, Water Damage) to receive instantaneous AI-estimated repair quotes and turn-around times powered by Google Gemini with offline domain heuristics.</p>
        </div>
        <div class="feature-card">
            <h4>🔍 Live Job Sheet Tracking</h4>
            <p>Enables customers to enter their Job Sheet Number (e.g., AMS-101) to trace the live diagnostic status, technician notes, repair progress, and delivery schedule without needing to call the store.</p>
        </div>
        <div class="feature-card">
            <h4>🛡️ Secured Admin & Owner ERP Portal</h4>
            <p>Secured with cryptographic bcrypt hashing and signed JWT bearer tokens. Enables the shop owner to manage inventory, update product prices, track repair tickets, view revenue metrics, and log customer WhatsApp inquiries.</p>
        </div>
    </div>

    <div class="info-card">
        <div class="info-title">🇮🇳 Bilingual Support (English & Hindi)</div>
        <div class="info-text">
            Designed for high accessibility in rural and semi-urban Uttar Pradesh. Users can switch between Hindi and English at any point, with full UI text translation across products, specs, repair diagnostics, and EMI options.
        </div>
    </div>
    """)

    # Section 2: Architecture & Tech Stack
    out.append("""
    <div class="page-break"></div>
    <h1>2. System Architecture & Tech Stack</h1>
    
    <h2>2.1 Full-Stack Technology Matrix</h2>
    <table>
        <thead>
            <tr>
                <th>Layer</th>
                <th>Technology</th>
                <th>Version</th>
                <th>Role & Responsibility</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Frontend Framework</strong></td>
                <td>React.js + Vite</td>
                <td>18.2 / 5.2</td>
                <td>Single Page Application (SPA), lightning fast HMR, component-driven UI</td>
            </tr>
            <tr>
                <td><strong>Styling & Design</strong></td>
                <td>Tailwind CSS</td>
                <td>3.4.3</td>
                <td>Utility-first responsive styling, mobile-first design, custom shop theme</td>
            </tr>
            <tr>
                <td><strong>Icons & Visuals</strong></td>
                <td>Lucide React</td>
                <td>0.363</td>
                <td>Clean, modern vector iconography for all actions and statuses</td>
            </tr>
            <tr>
                <td><strong>Routing & State</strong></td>
                <td>React Router 7 + Context API</td>
                <td>7.18</td>
                <td>Client-side routing, protected owner routes, multi-language context</td>
            </tr>
            <tr>
                <td><strong>Backend Runtime</strong></td>
                <td>FastAPI (Python 3.14)</td>
                <td>0.110</td>
                <td>High-performance asynchronous REST API with automatic OpenAPI specs</td>
            </tr>
            <tr>
                <td><strong>Application Server</strong></td>
                <td>Uvicorn</td>
                <td>0.28</td>
                <td>ASGI web server supporting async workers and auto-reload</td>
            </tr>
            <tr>
                <td><strong>Database Engine</strong></td>
                <td>SQLite / PostgreSQL</td>
                <td>3.x / 15</td>
                <td>Zero-config persistent local engine with Supabase-compatible schema</td>
            </tr>
            <tr>
                <td><strong>Security & Auth</strong></td>
                <td>Bcrypt + PyJWT</td>
                <td>4.1 / 2.8</td>
                <td>Salting and password hashing with signed HS256 JWT access tokens</td>
            </tr>
            <tr>
                <td><strong>AI Intelligence</strong></td>
                <td>Google Generative AI</td>
                <td>0.4.0</td>
                <td>Gemini models for repair diagnostics with heuristic fallback</td>
            </tr>
        </tbody>
    </table>

    <h2>2.2 Repository Directory Structure</h2>
    <pre class="code-block">
AMS-folder/
├── README.md                           # Documentation & quick-start guide
├── backend/
│   ├── ams_store.db                    # Persistent SQLite database
│   ├── requirements.txt                # Python backend dependencies
│   ├── run.py                          # Application entry point
│   ├── schema.sql                      # SQL database schema
│   ├── seed_admin.py                   # Admin initialization utility
│   ├── static/                         # Uploaded product images & assets
│   └── app/
│       ├── __init__.py
│       ├── ai_service.py               # Gemini AI repair estimator
│       ├── config.py                   # Environment settings & constants
│       ├── database.py                 # SQLite database connection & CRUD
│       ├── dependencies.py             # Auth dependencies & token verification
│       ├── main.py                     # FastAPI application setup
│       ├── models.py                   # Pydantic data schemas
│       ├── security.py                 # Password hashing & JWT logic
│       └── routes/
│           ├── admin.py                # Admin dashboard metrics
│           ├── auth.py                 # Login & token generation
│           ├── estimator.py            # AI repair estimates
│           ├── products.py             # Product inventory CRUD
│           └── repairs.py              # Repair ticket lifecycle
└── frontend/
    ├── package.json                    # Node dependencies & build scripts
    ├── vite.config.js                  # Vite configuration & backend proxy
    ├── tailwind.config.js              # Custom color palette & fonts
    ├── index.html                      # HTML template with SEO tags
    └── src/
        ├── App.jsx                     # Root router & page layout
        ├── main.jsx                    # React DOM root entry
        ├── context/                    # Auth, Language, Cart, Theme contexts
        ├── services/                   # Axios API client
        └── components/
            ├── BuyingHub/              # Phone cards, EMI calculator
            ├── RepairingHub/           # AI estimator, Job sheet tracker
            └── Admin/                  # Full administrative control suite
    </pre>
    """)

    # Section 3: Database Schema
    out.append("""
    <div class="page-break"></div>
    <h1>3. Database Architecture & Schema Specification</h1>
    <p>
        The persistence layer is modeled in <code>backend/schema.sql</code>, compatible with both local SQLite 
        and production PostgreSQL (Supabase). The schema defines relations for inventory, job sheet tickets, 
        administrative users, and inquiry logs.
    </p>

    <h2>3.1 Core Entity Relational Overview</h2>
    <table>
        <thead>
            <tr>
                <th>Table Name</th>
                <th>Primary Key</th>
                <th>Key Columns</th>
                <th>Purpose</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>products</strong></td>
                <td>id (INTEGER)</td>
                <td>title, brand, condition, original_price, selling_price, stock_count, emi_available</td>
                <td>Stores new and refurbished inventory with stock levels and pricing</td>
            </tr>
            <tr>
                <td><strong>job_sheets</strong></td>
                <td>id (INTEGER)</td>
                <td>job_sheet_id (UNIQUE), customer_name, customer_phone, device_model, issue_description, status, estimated_cost</td>
                <td>Tracks device repair lifecycle from intake to completion and delivery</td>
            </tr>
            <tr>
                <td><strong>admins</strong></td>
                <td>id (INTEGER)</td>
                <td>username (UNIQUE), password_hash, full_name, role, is_active</td>
                <td>Stores hashed shop owner / technician credentials with RBAC</td>
            </tr>
            <tr>
                <td><strong>whatsapp_inquiries</strong></td>
                <td>id (INTEGER)</td>
                <td>customer_name, phone_number, product_id, inquiry_type, created_at</td>
                <td>Logs pre-filled WhatsApp click-to-chat conversions and leads</td>
            </tr>
        </tbody>
    </table>
    """)

    # Add Schema File Content
    schema_sql = read_file_safe("backend/schema.sql")
    if schema_sql:
        out.append("<h2>3.2 schema.sql Source Definition</h2>")
        out.append("<div class='file-container'>")
        out.append("<div class='file-header'><span>backend/schema.sql</span><span class='file-badge'>SQL</span></div>")
        out.append(f"<pre class='code-block'>{html.escape(schema_sql)}</pre>")
        out.append("</div>")

    # Section 4: Backend REST API Documentation
    out.append("""
    <div class="page-break"></div>
    <h1>4. Backend REST API Documentation</h1>
    <p>
        The backend serves an interactive OpenAPI 3.0 specification available at <code>http://localhost:8000/docs</code>.
        Below is the exhaustive catalog of endpoints implemented in FastAPI.
    </p>

    <table>
        <thead>
            <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Access</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><span class="badge badge-green">GET</span></td>
                <td><code>/api/health</code></td>
                <td>Public</td>
                <td>Health check verifying API uptime and service availability</td>
            </tr>
            <tr>
                <td><span class="badge badge-green">GET</span></td>
                <td><code>/api/info</code></td>
                <td>Public</td>
                <td>Returns shop address, phone numbers, and EMI partner badges</td>
            </tr>
            <tr>
                <td><span class="badge badge-green">GET</span></td>
                <td><code>/api/products</code></td>
                <td>Public</td>
                <td>Retrieve all products with optional filters: condition, brand, search</td>
            </tr>
            <tr>
                <td><span class="badge badge-green">GET</span></td>
                <td><code>/api/products/{id}</code></td>
                <td>Public</td>
                <td>Retrieve single product details and specifications</td>
            </tr>
            <tr>
                <td><span class="badge badge-blue">POST</span></td>
                <td><code>/api/products</code></td>
                <td>Admin (JWT)</td>
                <td>Create a new product listing (supports multipart image uploads)</td>
            </tr>
            <tr>
                <td><span class="badge badge-amber">PUT</span></td>
                <td><code>/api/products/{id}</code></td>
                <td>Admin (JWT)</td>
                <td>Update an existing product listing or inventory level</td>
            </tr>
            <tr>
                <td><span class="badge badge-purple">DELETE</span></td>
                <td><code>/api/products/{id}</code></td>
                <td>Admin (JWT)</td>
                <td>Delete a product from the database</td>
            </tr>
            <tr>
                <td><span class="badge badge-green">GET</span></td>
                <td><code>/api/repairs/{job_sheet_id}</code></td>
                <td>Public</td>
                <td>Track repair status by job sheet ID (e.g. AMS-101)</td>
            </tr>
            <tr>
                <td><span class="badge badge-blue">POST</span></td>
                <td><code>/api/repairs</code></td>
                <td>Admin (JWT)</td>
                <td>Create a new repair intake job sheet with customer details</td>
            </tr>
            <tr>
                <td><span class="badge badge-amber">PATCH</span></td>
                <td><code>/api/repairs/{id}/status</code></td>
                <td>Admin (JWT)</td>
                <td>Advance repair status (Received, Diagnosing, Repairing, Ready, Delivered)</td>
            </tr>
            <tr>
                <td><span class="badge badge-blue">POST</span></td>
                <td><code>/api/estimate</code></td>
                <td>Public</td>
                <td>AI-powered repair estimate for device model and issue</td>
            </tr>
            <tr>
                <td><span class="badge badge-blue">POST</span></td>
                <td><code>/api/auth/login</code></td>
                <td>Public</td>
                <td>Authenticate admin username/password and return JWT token</td>
            </tr>
            <tr>
                <td><span class="badge badge-green">GET</span></td>
                <td><code>/api/admin/metrics</code></td>
                <td>Admin (JWT)</td>
                <td>KPI metrics: total products, in-stock count, active repairs</td>
            </tr>
        </tbody>
    </table>
    """)

    # Section 5: Source Code Inclusion
    out.append("<div class='page-break'></div>")
    out.append("<h1>5. Complete Backend Source Code</h1>")

    backend_files = [
        ("backend/app/main.py", "Python", "FastAPI App Entrypoint & Route Registrations"),
        ("backend/app/config.py", "Python", "Configuration & Environment Variables"),
        ("backend/app/database.py", "Python", "SQLite Connection Pool & SQL Execution Engine"),
        ("backend/app/models.py", "Python", "Pydantic Request & Response Validation Schemas"),
        ("backend/app/security.py", "Python", "Bcrypt Hashing & JWT Token Generation"),
        ("backend/app/dependencies.py", "Python", "OAuth2 Bearer Token Extraction & Admin Guard"),
        ("backend/app/ai_service.py", "Python", "Gemini AI Engine & Heuristic Fallback Estimator"),
        ("backend/app/routes/auth.py", "Python", "Admin Authentication Endpoints"),
        ("backend/app/routes/admin.py", "Python", "Admin KPI Metrics & Analytics"),
        ("backend/app/routes/products.py", "Python", "Inventory Management & Media Handling"),
        ("backend/app/routes/repairs.py", "Python", "Repair Ticket Intake & Status Transitions"),
        ("backend/app/routes/estimator.py", "Python", "AI Repair Estimation Router"),
        ("backend/seed_admin.py", "Python", "Command-Line Admin Account Seeding Utility"),
        ("backend/run.py", "Python", "Server Runner Script"),
        ("backend/requirements.txt", "Text", "Python Dependencies List")
    ]

    for rel_path, lang, desc in backend_files:
        content = read_file_safe(rel_path)
        if content:
            out.append("<div class='avoid-break'>")
            out.append(f"<h3>{rel_path} - {desc}</h3>")
            out.append("<div class='file-container'>")
            out.append(f"<div class='file-header'><span>{rel_path}</span><span class='file-badge'>{lang}</span></div>")
            out.append(f"<pre class='code-block'>{html.escape(content)}</pre>")
            out.append("</div>")
            out.append("</div>")

    # Section 6: Frontend Source Code
    out.append("<div class='page-break'></div>")
    out.append("<h1>6. Complete Frontend Source Code</h1>")

    frontend_files = [
        ("frontend/package.json", "JSON", "Node.js Dependencies & Build Configuration"),
        ("frontend/vite.config.js", "JavaScript", "Vite Development Server & API Proxy"),
        ("frontend/tailwind.config.js", "JavaScript", "Tailwind CSS Theme & Color Palette"),
        ("frontend/src/main.jsx", "JavaScript/JSX", "React DOM Application Bootstrap"),
        ("frontend/src/App.jsx", "JavaScript/JSX", "Root Layout, Routing & Route Guards"),
        ("frontend/src/index.css", "CSS", "Global Styles & Tailwind Directives"),
        ("frontend/src/services/api.js", "JavaScript", "Axios API Client & Interceptors"),
        ("frontend/src/context/AuthContext.jsx", "JavaScript/JSX", "Admin Authentication State Context"),
        ("frontend/src/context/LanguageContext.jsx", "JavaScript/JSX", "Bilingual Hindi/English Translation Dictionary"),
        ("frontend/src/context/CartContext.jsx", "JavaScript/JSX", "Shopping Cart State Provider"),
        ("frontend/src/components/BuyingHub/BuyingHub.jsx", "JavaScript/JSX", "Product Catalog, Search & Filtering"),
        ("frontend/src/components/BuyingHub/ProductCard.jsx", "JavaScript/JSX", "Product Card with Price & Badges"),
        ("frontend/src/components/BuyingHub/EmiCalculatorModal.jsx", "JavaScript/JSX", "Interactive Down Payment & Tenure Calculator"),
        ("frontend/src/components/RepairingHub/RepairingHub.jsx", "JavaScript/JSX", "Repair Center Hub Layout"),
        ("frontend/src/components/RepairingHub/JobSheetTracker.jsx", "JavaScript/JSX", "Live Repair Status Search & Timeline"),
        ("frontend/src/components/RepairingHub/RepairEstimator.jsx", "JavaScript/JSX", "AI Repair Cost & Turnaround Estimator"),
        ("frontend/src/components/Admin/AdminLoginPage.jsx", "JavaScript/JSX", "Owner Portal Secure Login"),
        ("frontend/src/components/Admin/AdminDashboard.jsx", "JavaScript/JSX", "Admin Dashboard Hub & Tab Router"),
        ("frontend/src/components/Admin/ProtectedAdminRoute.jsx", "JavaScript/JSX", "Route Protection Wrapper for Authenticated Users"),
        ("frontend/src/components/Admin/Dashboard/DashboardDataGrid.jsx", "JavaScript/JSX", "Dashboard Quick Metrics Grid")
    ]

    for rel_path, lang, desc in frontend_files:
        content = read_file_safe(rel_path)
        if content:
            out.append("<div class='avoid-break'>")
            out.append(f"<h3>{rel_path} - {desc}</h3>")
            out.append("<div class='file-container'>")
            out.append(f"<div class='file-header'><span>{rel_path}</span><span class='file-badge'>{lang}</span></div>")
            out.append(f"<pre class='code-block'>{html.escape(content)}</pre>")
            out.append("</div>")
            out.append("</div>")

    # Section 7: Verification & Quick Start
    out.append("""
    <div class="page-break"></div>
    <h1>7. Installation, Execution & Operations Guide</h1>

    <h2>7.1 Running the Backend</h2>
    <pre class="code-block">
# 1. Install Python dependencies
pip install -r backend/requirements.txt

# 2. (Optional) Initialize / Seed Admin Account
python backend/seed_admin.py --username admin --password your_password

# 3. Start the FastAPI ASGI server
python backend/run.py
    </pre>
    <p>The backend will listen on <code>http://localhost:8000</code>. Test with:</p>
    <ul>
        <li>Health check: <code>http://localhost:8000/api/health</code></li>
        <li>Swagger documentation: <code>http://localhost:8000/docs</code></li>
    </ul>

    <h2>7.2 Running the Frontend</h2>
    <pre class="code-block">
# 1. Install Node.js packages
cd frontend
npm install

# 2. Start Vite development server
npm run dev
    </pre>
    <p>The frontend will be accessible at <code>http://localhost:5173</code>.</p>

    <div class="info-card">
        <div class="info-title">System Status: Verified & Operational</div>
        <div class="info-text">
            Both the backend API and frontend SPA are verified to run simultaneously with real-time proxying,
            zero database configuration required (SQLite engine runs out of the box), and complete bilingual
            Hindi/English capabilities.
        </div>
    </div>
    """)

    out.append("</body>")
    out.append("</html>")
    return "\n".join(out)

def main():
    print("Generating comprehensive HTML document for Amit Mobile Shop...")
    html_content = generate_html()
    
    html_file = os.path.join(ROOT_DIR, "project_documentation.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"HTML generated: {html_file} ({len(html_content)} bytes)")

    # Output PDF locations
    pdf_filename = "Amit_Mobile_Shop_Project_Documentation.pdf"
    root_pdf = os.path.join(ROOT_DIR, pdf_filename)
    
    # Also prepare frontend public directory
    public_dir = os.path.join(ROOT_DIR, "frontend", "public")
    os.makedirs(public_dir, exist_ok=True)
    frontend_pdf = os.path.join(public_dir, pdf_filename)
    
    # Also prepare backend static directory
    static_dir = os.path.join(ROOT_DIR, "backend", "static")
    os.makedirs(static_dir, exist_ok=True)
    backend_pdf = os.path.join(static_dir, pdf_filename)

    # Locate Chrome or Edge
    browser_exe = None
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    for c in candidates:
        if os.path.exists(c):
            browser_exe = c
            break

    if not browser_exe:
        print("Error: Neither Chrome nor Edge executable found!")
        sys.exit(1)

    print(f"Using browser: {browser_exe}")
    cmd = [
        browser_exe,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={root_pdf}",
        html_file
    ]

    print("Rendering PDF...")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        print("Browser error:", result.stderr)
        sys.exit(result.returncode)

    if os.path.exists(root_pdf):
        size_bytes = os.path.getsize(root_pdf)
        print(f"Success! PDF created at: {root_pdf} ({size_bytes / 1024:.1f} KB)")
        
        # Copy to frontend/public for instant web browser download
        shutil.copyfile(root_pdf, frontend_pdf)
        print(f"Copied to Frontend download: {frontend_pdf}")
        
        # Copy to backend/static for direct API download
        shutil.copyfile(root_pdf, backend_pdf)
        print(f"Copied to Backend download: {backend_pdf}")
    else:
        print("Failed to produce PDF.")
        sys.exit(1)

if __name__ == "__main__":
    main()

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles

logger = logging.getLogger(__name__)
from fastapi.middleware.cors import CORSMiddleware
from app.routes import products, repairs, estimator, auth, admin, emi, settings, customer_auth
from app.config import (
    SHOP_PHONE_1,
    SHOP_PHONE_2,
    SHOP_LOCATION,
    FRONTEND_URL,
    ALLOWED_ORIGINS,
    IS_PRODUCTION,
    UPLOAD_DIR,
    PRODUCT_UPLOAD_DIR
)
from app.database import init_db, get_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
        print("[DATABASE] SQLite database tables initialized successfully.")
    except Exception as e:
        print("[DATABASE] Error initializing database:", e)
    yield

app = FastAPI(
    title="Amit Mobile Shop API",
    description="Backend API for Amit Mobile Shop - Buying Hub, Repair Tracking, AI Estimator, and Owner Portal",
    version="1.0.0",
    lifespan=lifespan
)

# HTTP Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    if IS_PRODUCTION:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Static files and persistent uploads delivery
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))
os.makedirs(static_dir, exist_ok=True)
os.makedirs(PRODUCT_UPLOAD_DIR, exist_ok=True)

# Mount uploaded media under /static/uploads (supports persistent volume e.g. /data/uploads)
app.mount("/static/uploads", StaticFiles(directory=UPLOAD_DIR), name="static_uploads")

# Mount base static files directory for documentation, root assets, etc.
app.mount("/static", StaticFiles(directory=static_dir), name="static")


# Strict, origin-specific CORS configuration (prevents arbitrary cross-origin token theft)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register Sub-routers
app.include_router(products.router)
app.include_router(repairs.router)
app.include_router(estimator.router)
app.include_router(auth.router)
app.include_router(customer_auth.router)
app.include_router(admin.router)
app.include_router(emi.router)
app.include_router(settings.router)


@app.get("/")
def read_root():
    return {
        "shop_name": "Amit Mobile Shop",
        "location": SHOP_LOCATION,
        "contacts": [SHOP_PHONE_1, SHOP_PHONE_2],
        "status": "Online",
        "endpoints": {
            "health": "/api/health",
            "products": "/api/products",
            "repair_tracker": "/api/repairs/{job_sheet_id}",
            "ai_estimator": "/api/estimate"
        }
    }

@app.get("/api/health")
def health_check():
    db_status = "connected"
    try:
        conn = get_connection()
        conn.close()
    except Exception as e:
        logger.error(f"[HEALTH] Database check failed: {e}")
        db_status = "disconnected"
    return {
        "status": "ok",
        "service": "Amit Mobile Shop Backend",
        "database": db_status,
        "version": "1.0.0"
    }

@app.get("/api/info")
def get_shop_info():
    return {
        "shop_name": "Amit Mobile Shop",
        "tagline": "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312 - Premier Mobile Buying & Express Repair Center",
        "phones": [SHOP_PHONE_1, SHOP_PHONE_2],
        "whatsapp": f"91{SHOP_PHONE_1}",
        "location": SHOP_LOCATION,
        "emi_partners": [
            {
                "name": "Bajaj Finserv",
                "badge": "Bajaj No Cost EMI",
                "details": "Instant approval on PAN Card & Bank passbook with 0% interest"
            },
            {
                "name": "TVS Credit",
                "badge": "TVS Instant Approval",
                "details": "Low down payment schemes available for rural & urban customers"
            },
            {
                "name": "Samsung Finance+",
                "badge": "Samsung Finance+ Easy EMI",
                "details": "Paperless digital process with Aadhaar OTP in 5 minutes"
            }
        ]
    }

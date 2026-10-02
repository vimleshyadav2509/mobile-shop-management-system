import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

SHOP_PHONE_1 = os.getenv("SHOP_PHONE_1", "6306657432")
SHOP_PHONE_2 = os.getenv("SHOP_PHONE_2", "9721996477")
SHOP_LOCATION = os.getenv("SHOP_LOCATION", "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312")
SHOP_LATITUDE = float(os.getenv("SHOP_LATITUDE", "27.0161817"))
SHOP_LONGITUDE = float(os.getenv("SHOP_LONGITUDE", "82.5375051"))
SHOP_MAPS_URL = os.getenv("SHOP_MAPS_URL", "https://maps.app.goo.gl/Cumott8vek7HA85K9")

# SMS / OTP Provider Configuration (Fast2SMS, Twilio, etc.)
SMS_PROVIDER = os.getenv("SMS_PROVIDER", "").strip().lower() # 'fast2sms', 'twilio', or ''
FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY", "").strip()
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "").strip()

# Environment Mode: 'development' or 'production'
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower().strip()
IS_PRODUCTION = ENVIRONMENT == "production"

# Database Configuration (Supabase PostgreSQL in production, SQLite fallback in development)
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL.startswith("postgres://"):
    # Normalize postgres:// to postgresql:// for SQLAlchemy/psycopg2
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if IS_PRODUCTION and not DATABASE_URL:
    raise RuntimeError(
        "FATAL: DATABASE_URL is missing in production! "
        "A valid Supabase PostgreSQL connection string must be configured in environment variables."
    )

# Cloudinary Image Storage Configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "").strip()
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "").strip()

# Customer & Admin Token Expiry
CUSTOMER_TOKEN_EXPIRE_DAYS = int(os.getenv("CUSTOMER_TOKEN_EXPIRE_DAYS", "30")) # 30 days for customer sessions

# Admin Authentication & Security Config
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "ams_default_dev_secret_change_in_production_2025")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "480")) # 8 hours default

# Enforce secure JWT Secret in production
INSECURE_SECRETS = {
    "ams_default_dev_secret_change_in_production_2025",
    "secret",
    "admin",
    "admin123",
    "CHANGE_ME_TO_A_LONG_RANDOM_SECRET",
    "your_secure_random_jwt_secret_key_here",
    ""
}

if IS_PRODUCTION:
    if not JWT_SECRET_KEY or JWT_SECRET_KEY in INSECURE_SECRETS or len(JWT_SECRET_KEY) < 32:
        raise RuntimeError(
            "FATAL: Insecure or missing JWT_SECRET_KEY in production! "
            "Please configure a cryptographically random secret of at least 32 characters in .env."
        )

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "Amit_MS2026")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

if IS_PRODUCTION and ADMIN_PASSWORD.strip() in ("admin123", "password", "12345678", "admin"):
    raise RuntimeError(
        "FATAL: Insecure default ADMIN_PASSWORD detected in production! "
        "Remove ADMIN_PASSWORD from .env and initialize the administrator account using 'python seed_admin.py'."
    )


# Allowed Origins for CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").strip()
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")

if _allowed_origins_env.strip():
    ALLOWED_ORIGINS = [orig.strip() for orig in _allowed_origins_env.split(",") if orig.strip()]
elif IS_PRODUCTION:
    ALLOWED_ORIGINS = [FRONTEND_URL] if FRONTEND_URL else []
else:
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        FRONTEND_URL
    ]
    # Remove duplicates preserving order
    ALLOWED_ORIGINS = list(dict.fromkeys(ALLOWED_ORIGINS))


# ==============================================================================
# Persistent Storage Configuration (SQLite DB & Uploads)
# ==============================================================================
# In development, defaults to backend/ams_store.db and backend/static/uploads
# In production on persistent volume (e.g. /data or /var/data), configure DB_PATH & UPLOAD_DIR
_backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

_DEFAULT_DB_PATH = os.path.abspath(os.path.join(_backend_root, "ams_store.db"))
_env_db_path = os.getenv("DB_PATH", "").strip()

if _env_db_path:
    if os.path.isabs(_env_db_path):
        DB_PATH = os.path.abspath(_env_db_path)
    else:
        DB_PATH = os.path.abspath(os.path.join(_backend_root, _env_db_path))
else:
    DB_PATH = _DEFAULT_DB_PATH

# Ensure parent directory for database exists
_db_dir = os.path.dirname(DB_PATH)
if _db_dir:
    os.makedirs(_db_dir, exist_ok=True)

_DEFAULT_UPLOAD_DIR = os.path.abspath(os.path.join(_backend_root, "static", "uploads"))
_env_upload_dir = os.getenv("UPLOAD_DIR", "").strip()

if _env_upload_dir:
    if os.path.isabs(_env_upload_dir):
        UPLOAD_DIR = os.path.abspath(_env_upload_dir)
    else:
        UPLOAD_DIR = os.path.abspath(os.path.join(_backend_root, _env_upload_dir))
else:
    UPLOAD_DIR = _DEFAULT_UPLOAD_DIR

PRODUCT_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "products")
os.makedirs(PRODUCT_UPLOAD_DIR, exist_ok=True)




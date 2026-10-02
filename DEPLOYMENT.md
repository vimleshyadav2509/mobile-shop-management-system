# Production Cloud Deployment Guide

This guide documents the production cloud architecture and migration of **Amit Mobile Shop** (`vimleshyadav2509/mobile-shop-management-system`) from Railway + SQLite + local filesystem image storage to a cloud-persistent, resilient, free-tier architecture.

---

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   Customer / Admin                     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS
                            ▼
┌────────────────────────────────────────────────────────┐
│             Frontend: Netlify (Free Tier)              │
│       React 18 + Vite SPA + Tailwind CSS               │
│       Automatic Git Continuous Deployment              │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (CORS restricted)
                            ▼
┌────────────────────────────────────────────────────────┐
│              Backend: Render (Free Tier)               │
│       FastAPI + Uvicorn ASGI Server                    │
│       Stateless Compute / Automatic Git Deploy         │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
         Database Queries          Direct Uploads / CDN
                │                        │
                ▼                        ▼
┌──────────────────────────────┐  ┌──────────────────────┐
│  Database: Supabase (Free)   │  │   Cloudinary (Free)  │
│  Managed PostgreSQL 15+      │  │   Media Cloud CDN    │
│  Connection Pooling          │  │   Product Images     │
└──────────────────────────────┘  └──────────────────────┘
```

### Key Architectural Safeguards
- **Stateless Compute**: Render web service is purely stateless. Filesystem restarts/spin-downs do not affect application state.
- **Relational Integrity**: Managed PostgreSQL hosted on Supabase stores products, repairs, repair history, admin users, EMI plans, store settings, customers, and customer sessions.
- **Durable Image Assets**: All mobile product images reside in Cloudinary CDN. Render filesystem is never used as permanent image storage.
- **Zero Production Fallback**: In `ENVIRONMENT=production`, the backend requires an explicit `DATABASE_URL`. SQLite is strictly limited to local offline development.
- **Seamless Frontend Fallback**: Frontend image helper detects missing, legacy, or broken image URLs and provides smooth SVG placeholder fallbacks.

---

## 2. Free-Tier Limitations & Safeguards

> [!IMPORTANT]
> No cloud service provides a lifetime guarantee. The system is designed to operate within current free-tier specifications.

| Provider | Free Tier Specification | Operational Consideration & System Safeguard |
|---|---|---|
| **Render** | 512 MB RAM, shared CPU, 750 free instance hrs/month | Service spins down (sleeps) after 15 minutes of inactivity. Initial wake-up request takes ~30–50s. System handles wake-up smoothly without data loss. |
| **Supabase** | 500 MB PostgreSQL database, 2 projects, 50k monthly active users | Free databases pause if inactive for 7 days. Regularly active shops remain unpaused. Connection pooling (`pool_pre_ping=True`) handles re-connections. |
| **Cloudinary** | 25 Monthly Credits (~25,000 transformations or 25 GB storage/bandwidth) | Image uploads are limited to 5 MB per file with automatic format optimization (`f_auto,q_auto`). |
| **Netlify** | 100 GB bandwidth/month, 300 build minutes/month | Static assets are cached globally with hash-based bundle busting and 1-year cache headers. |

---

## 3. Environment Variable Matrix

### Backend / Render Service Environment Variables

| Variable Name | Required | Example / Format | Description |
|---|---|---|---|
| `ENVIRONMENT` | **Yes** | `production` | Enables production security checks (blocks SQLite fallback). |
| `DATABASE_URL` | **Yes** | `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres` | Supabase PostgreSQL URI (session mode or pooler). |
| `JWT_SECRET_KEY` | **Yes** | 64+ char random hex string | Signs and verifies Admin authentication tokens. |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | `your_cloud_name` | Cloudinary account cloud name. |
| `CLOUDINARY_API_KEY` | **Yes** | `123456789012345` | Cloudinary public API key. |
| `CLOUDINARY_API_SECRET` | **Yes** | `abcdefghijklmnopqrstuv_123` | Cloudinary secret key for server-side signed uploads. |
| `ALLOWED_ORIGINS` | **Yes** | `https://amit-mobile-shop.netlify.app` | Comma-separated list of allowed frontend origins for CORS. |
| `FRONTEND_URL` | Optional | `https://amit-mobile-shop.netlify.app` | Default frontend link for notifications or links. |
| `PORT` | Auto | Provided by Render (`10000`) | Application port. Managed automatically. |

### Frontend / Netlify Environment Variables

| Variable Name | Required | Example / Format | Description |
|---|---|---|---|
| `VITE_API_URL` | **Yes** | `https://amit-mobile-shop-api.onrender.com` | Public URL of the deployed Render FastAPI backend. |

> [!CAUTION]
> Never put backend secrets (`JWT_SECRET_KEY`, `CLOUDINARY_API_SECRET`, database passwords) into Netlify frontend variables. Vite embeds `VITE_*` variables directly into public JavaScript bundles.

---

## 4. Setup Procedures

### Step 1: Supabase Setup (Database)
1. Sign in to [Supabase](https://supabase.com/) and create a new project (e.g. `amit-mobile-shop`).
2. Choose a region close to your primary customers (e.g. `ap-south-1` Mumbai).
3. Set a strong database password and store it securely.
4. Navigate to **Project Settings** → **Database** → **Connection String** → **URI**.
5. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   *(Note: Replace `[YOUR-PASSWORD]` with your actual database password).*

### Step 2: Cloudinary Setup (Image Storage)
1. Sign in to [Cloudinary](https://cloudinary.com/) (Free plan).
2. Go to your **Dashboard**.
3. Under **Product Environment Credentials**, copy:
   - **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   - **API Key** (`CLOUDINARY_API_KEY`)
   - **API Secret** (`CLOUDINARY_API_SECRET`)

### Step 3: Render Setup (Backend API)
1. Sign in to [Render](https://render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `vimleshyadav2509/mobile-shop-management-system`.
4. Configure service settings:
   - **Name**: `amit-mobile-shop-api`
   - **Region**: Choose closest to database (e.g. Singapore or Frankfurt).
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --no-cache-dir -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Navigate to **Environment Variables** and add all Backend variables specified in the Matrix above.
6. Under **Advanced**, set **Health Check Path** to `/api/health`.
7. Click **Create Web Service**. Wait for the initial deployment to succeed.
8. Copy your Render service URL (e.g. `https://amit-mobile-shop-api.onrender.com`).

### Step 4: Netlify Setup (Frontend SPA)
1. Sign in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** → **Import an existing project**.
3. Connect GitHub and select `vimleshyadav2509/mobile-shop-management-system`.
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Under **Environment variables**, add:
   - `VITE_API_URL` = `https://amit-mobile-shop-api.onrender.com`
6. Click **Deploy Site**.
7. Once deployed, copy your Netlify site URL (e.g. `https://amit-mobile-shop.netlify.app`).
8. Return to Render Dashboard → Environment Variables: update `ALLOWED_ORIGINS` to include your Netlify site URL so CORS requests are permitted.

---

## 5. Migration Execution

### A. Migrating Data from SQLite to Supabase PostgreSQL
The repository includes a standalone, non-destructive migration script: `backend/scripts/migrate_sqlite_to_postgres.py`.

Run this locally with the destination Supabase `DATABASE_URL`:
```bash
cd backend
python scripts/migrate_sqlite_to_postgres.py --sqlite ams_store.db --postgres "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
```
**Features of the migration script:**
- Idempotent: Can be run multiple times safely using `ON CONFLICT (id) DO NOTHING`.
- Automatically establishes PostgreSQL schemas, tables, and foreign keys.
- Validates row counts before and after for all 8 tables (`users`, `products`, `repairs`, `repair_status_history`, `emi_plans`, `shop_settings`, `customers`, `customer_sessions`).
- Resets PostgreSQL auto-increment sequences (`pg_get_serial_sequence`).
- Generates a validation report with zero data loss.

### B. Migrating Existing Local Images to Cloudinary
If you have local product images stored in `backend/static/uploads/`, use the migration tool: `backend/scripts/migrate_local_images_to_cloudinary.py`.

Run locally with Cloudinary credentials:
```bash
cd backend
python scripts/migrate_local_images_to_cloudinary.py --cloud-name [NAME] --api-key [KEY] --api-secret [SECRET] --database-url "postgresql://..."
```
**Features of the image migration script:**
- Uploads local assets directly to the `amit_mobile_shop/products` Cloudinary folder.
- Updates database references from `/static/uploads/...` to HTTPS Cloudinary CDN URLs.
- Preserves the local files untouched as backup.
- Produces a detailed migration summary of successful and skipped images.

---

## 6. GitHub Auto-Deployment Workflow

Continuous deployment is fully active via GitHub webhooks:
```
Developer pushes code
         │
         ▼
  git push origin main
         ├──► Netlify Webhook: Automatically builds & deploys Frontend
         └──► Render Webhook: Automatically builds & restarts Backend
```
- No manual redeploy button is required for standard code changes.
- To verify in Render: **Settings** → **Auto-Deploy** is set to `Yes`.
- To verify in Netlify: **Site configuration** → **Build & deploy** → **Continuous deployment** is linked to branch `main`.

---

## 7. Health Checks & Verification

### 1. Backend Health Check
Run in browser or terminal:
```bash
curl -i https://amit-mobile-shop-api.onrender.com/api/health
```
Expected Response (HTTP 200 OK):
```json
{
  "status": "ok",
  "service": "amit-mobile-shop-backend",
  "version": "1.0.0",
  "database": "connected"
}
```

### 2. Frontend SPA Deep-Link Refresh
1. Open the Netlify frontend URL.
2. Navigate to deep routes like `/admin/dashboard` or `/repairs`.
3. Press **Browser Refresh (Ctrl+F5)**.
4. The page must reload smoothly without returning a 404 error (handled by `_redirects` and `netlify.toml`).

### 3. Image CDN Persistence Test
1. Log in to the Admin Panel.
2. Add or edit a mobile product and upload an image.
3. Verify the image preview loads from `https://res.cloudinary.com/...`.
4. Trigger a Render manual restart or wait for Render sleep.
5. Reload the storefront on mobile/desktop: the image loads instantly from the Cloudinary CDN.

---

## 8. Rollback & Backup Procedures

### Database Backups
- **Supabase Automatic Backups**: Available in Supabase Dashboard → Database → Backups.
- **Manual PostgreSQL Dump**:
  ```bash
  pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" -F c -b -v -f supabase_backup.dump
  ```
- **Local SQLite Archive**: The pre-migration SQLite backup remains safely preserved in `backend/ams_store.db.backup` (git-ignored for security).

### Rollback Strategy
If any provider encounters prolonged downtime:
1. **Frontend**: Netlify allows 1-click rollback to any previous deploy under **Deploys** → **Publish deploy**.
2. **Backend**: Render allows deploying any previous commit under **Events** → **Rollback**.
3. **Database**: PostgreSQL can be restored from the latest `pg_dump` or Supabase snapshot.

---

## 9. Railway Decommissioning Procedure

> [!CAUTION]
> Do NOT decommission Railway until all manual dashboard steps have been verified and the production domain DNS points to Netlify and Render.

Follow these steps once end-to-end verification succeeds:
1. Confirm zero critical traffic remains on `mobile-shop-management-system-production.up.railway.app`.
2. Take a final database backup if Railway had active records.
3. Open Railway Dashboard → Select the project.
4. Go to **Settings** → **Service** → click **Delete Service** (or remove project) to stop resource consumption.

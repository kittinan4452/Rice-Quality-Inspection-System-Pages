# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rice Quality Inspection System — split into a Django 5 REST API backend and a React + Vite frontend. The backend uses YOLOv8 (ultralytics) to analyze rice images and report quality metrics: grain size distribution (whole vs. broken), contamination percentages (Glutinous/G, Chalky/C, Broken/B, Yellow/Y, Damaged/D), and average grain dimensions in mm.

## Commands

The project runs via **Docker Compose** (db, redis, backend, worker, frontend). `docker-compose.override.yml` mounts source for live reload and runs `migrate` + `runserver` on backend startup.

```bash
# --- Docker (preferred, run from repo root) ---
docker compose up --build           # start all services
docker compose restart backend worker   # reload backend code / run new migrations
docker compose exec backend python manage.py <cmd>   # manage.py inside container
docker compose logs backend --tail 40    # view backend logs (reset emails print here in console mode)

# --- Backend without Docker (run from backend/) ---
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver        # API at http://127.0.0.1:8000
python manage.py test myapp
celery -A myproject worker -l info   # Celery worker (requires Redis); does NOT auto-reload on code change

# --- Frontend without Docker (run from frontend/) ---
npm install
npm run dev     # Vite dev server at http://localhost:5173
npm run build   # Production build
```

> Media is stored in the `media_data` Docker volume (not bind-mounted to `backend/media`). YOLO weights live in `backend/myapp/weights/` (mounted into the container). The Celery worker caches imported modules — **restart the `worker` service after editing `predict2.py`/`tasks.py`**.

## Architecture

### Repository layout
- `backend/` — Django REST API (no templates served to users)
- `frontend/` — React 18 + Vite SPA; talks to the backend via Axios

### Backend

**Django apps / packages**
- `myproject/` — project settings and root URL conf; all API routes are under `/api/`
- `myapp/` — sole app; contains models, views (class-based APIViews), serializers, and ML logic

**Database (`myproject/settings.py`)**
Configured for **MySQL** (`rice-data` database). Update `NAME`, `USER`, and `PASSWORD` in `DATABASES` before first run. Three app tables:
- `Dataperson` — per-inspection metadata (customer name, rice type, uploaded image path). Has `owner` **ForeignKey to `auth.User`** (the canonical ownership link); the legacy `user_name`/`username` string columns are kept only for backward compatibility/backfill and are being phased out.
- `Data_size` — size results (whole %, broken %, b1/b2/b3 subcategories, average height/width in mm)
- `Data_type` — contamination percentages and paths to the five annotated output images

> `Data_size`/`Data_type` are linked to `Dataperson` only by **matching `id`** (no FK); they are created in lockstep by the task and read via `.get(id=person.id)`. This coupling is fragile — keep the three records' lifecycles in sync.

**Authentication & roles**
JWT via `djangorestframework-simplejwt`. Access token lifetime: 1 hour; refresh token: 7 days. Tokens are issued by `POST /api/auth/login/` and refreshed via `POST /api/token/refresh/`.

Two roles via Django's built-in `is_staff`: **admin** (`is_staff=True`) vs **normal user**. `login`/`me` responses include `is_staff`. Normal users see/access only their own inspections (filtered by `owner`); admins see all. Admin-only endpoints use DRF `IsAdminUser`. A bootstrap admin is created by migration `0028_create_admin` (username/password overridable via `ADMIN_USERNAME`/`ADMIN_PASSWORD` env, default `admin`/`Admin@1234` — change in production).

**API endpoints (`myapp/urls.py`)**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login/` | Returns `access`, `refresh`, `username`, `first_name`, `is_staff` |
| POST | `/api/auth/register/` | Creates a new user |
| GET | `/api/auth/me/` | Returns current user info (incl. `is_staff`) |
| POST | `/api/auth/password-reset/` | Sends a password-reset email (always 200, even if email unknown) |
| POST | `/api/auth/password-reset/confirm/` | Confirms reset with `uid`, `token`, `new_password` |
| GET/POST | `/api/inspections/` | List (paginated, 5/page; admins see all, users see own) or submit an inspection (returns `task_id`) |
| GET | `/api/inspections/task/<task_id>/` | Poll Celery task status (`PENDING`/`SUCCESS`/`FAILURE`) |
| GET/DELETE | `/api/inspections/<id>/` | Retrieve or delete one inspection (scoped to owner unless admin) |
| GET | `/api/admin/stats/` | **Admin only** — KPI totals, rice-type distribution, 14-day timeseries, recent |
| GET | `/api/admin/users/` | **Admin only** — user list with per-user inspection counts |
| PATCH | `/api/admin/users/<id>/` | **Admin only** — toggle `is_active`/`is_staff` (cannot modify self) |

Media files (uploaded images + annotated outputs) are served at `/media/` and stored in the `media_data` Docker volume (`backend/media/` when run without Docker).

**Email (password reset)**
Configured via `EMAIL_*` env vars. Default `EMAIL_BACKEND` is the **console backend** (emails print to the backend log, not delivered). Set SMTP env vars in `.env` to send real email. The reset link in `password_reset_email.html` points at `${FRONTEND_URL}/password-reset/<uid>/<token>/`.

**Async ML pipeline**
`POST /api/inspections/` saves the uploaded file, then dispatches a Celery task (`myapp/tasks.run_inspection`) and returns a `task_id` immediately (HTTP 202). The task calls `predict2(uploaded_file_path, date)` in a background worker and writes all three DB records on completion. The frontend polls `GET /api/inspections/task/<task_id>/` every 2 seconds until `status` is `SUCCESS` or `FAILURE`.

**`myapp/predict2.py`**
`predict2(uploaded_file_path, date)` is called from `myapp/tasks.run_inspection`. It runs **five separate YOLO models** in sequence (one per class: Y, B, G, C, D), each reading the same source image. For each detection (above `CONF_THRESHOLD`) it:
1. **Counts the grain** based on the YOLO class — this is decoupled from contour detection, so counting/percentages stay correct even when a contour can't be measured.
2. **Only for the B model**, measures grain size: crops the box, grayscale + **Otsu** threshold, picks the single largest contour (`area ≥ MIN_CONTOUR_AREA`), fits a `minAreaRect`, and converts to mm via the `PPI` constant (default 300).
3. Classifies grains as whole (≥ 5.2 mm) or broken (< 5.2 mm), with three broken subcategories.
4. Draws annotated boxes and writes five annotated images to the `images/` dir under media.

Tunable module constants at the top: `PPI` (pixels-per-inch — **must match the real image DPI or mm sizes are wrong**), `CONF_THRESHOLD`, `MIN_CONTOUR_AREA`. Helper functions guard against division-by-zero so an image with no detections returns zeros instead of crashing. Returns a tuple of two JSON strings (`data_size`, `data_type`) consumed by the task.

**YOLO weights**
Must be downloaded separately (Google Drive link in README) and placed at:
```
backend/myapp/weights/y/best.pt
backend/myapp/weights/b/best.pt
backend/myapp/weights/g/best.pt
backend/myapp/weights/c/best.pt
backend/myapp/weights/d/best.pt
```

**CORS**
`django-cors-headers` allows `http://localhost:5173` and `http://127.0.0.1:5173` (the Vite dev server).

### Frontend

React 18 + React Router v6 + Axios + SweetAlert2 + Tailwind CSS (compiled by Vite/PostCSS).

**Key files**
- `frontend/src/api/axios.js` — Axios instance pointed at `http://localhost:8000`; interceptor attaches `Authorization: Bearer <token>` from `localStorage` and auto-refreshes on 401
- `frontend/src/contexts/AuthContext.jsx` — global auth state (`user` incl. `is_staff`, `login`, `logout`, `loading`); tokens stored in `localStorage` as `access`/`refresh`
- `frontend/src/components/ProtectedRoute.jsx` — redirects to `/login` if unauthenticated
- `frontend/src/components/AdminRoute.jsx` — redirects non-admins (`!is_staff`) to `/`
- `frontend/src/pages/AdminDashboard.jsx` — admin dashboard; charts are pure Tailwind/SVG (no chart library dependency)

**Routes**
| Path | Component | Auth |
|------|-----------|------|
| `/login` | LoginPage | public |
| `/register` | RegisterPage | public |
| `/forgot-password`, `/forgot-password/done` | ForgotPassword* | public |
| `/password-reset/:uid/:token`, `/password-reset/complete` | PasswordReset* | public |
| `/` | HomePage | protected |
| `/inspections` | ListPage | protected |
| `/inspections/:id` | DetailPage | protected |
| `/admin` | AdminDashboard | admin only |

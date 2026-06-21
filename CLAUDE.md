# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rice Quality Inspection System — split into a Django 5 REST API backend and a React + Vite frontend. The backend uses YOLOv8 (ultralytics) to analyze rice images and report quality metrics: grain size distribution (whole vs. broken), contamination percentages (Glutinous/G, Chalky/C, Broken/B, Yellow/Y, Damaged/D), and average grain dimensions in mm.

## Commands

```bash
# --- Backend (run from backend/) ---
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver        # API at http://127.0.0.1:8000
python manage.py test myapp

# Start Celery worker (run from backend/, requires Redis running)
celery -A myproject worker -l info

# --- Frontend (run from frontend/) ---
npm install
npm run dev     # Vite dev server at http://localhost:5173
npm run build   # Production build
```

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
- `Dataperson` — per-inspection metadata (customer name, rice type, uploaded image path, owning user)
- `Data_size` — size results (whole %, broken %, b1/b2/b3 subcategories, average height/width in mm)
- `Data_type` — contamination percentages and paths to the five annotated output images

**Authentication**
JWT via `djangorestframework-simplejwt`. Access token lifetime: 1 hour; refresh token: 7 days. Tokens are issued by `POST /api/auth/login/` and refreshed via `POST /api/token/refresh/`.

**API endpoints (`myapp/urls.py`)**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login/` | Returns `access`, `refresh`, `username`, `first_name` |
| POST | `/api/auth/register/` | Creates a new user |
| GET | `/api/auth/me/` | Returns current user info |
| GET/POST | `/api/inspections/` | List (paginated, 5/page) or submit an inspection (returns `task_id`) |
| GET | `/api/inspections/task/<task_id>/` | Poll Celery task status (`PENDING`/`SUCCESS`/`FAILURE`) |
| GET/DELETE | `/api/inspections/<id>/` | Retrieve or delete one inspection |

Media files (uploaded images + annotated outputs) are served at `/media/` and stored in `backend/media/`.

**Async ML pipeline**
`POST /api/inspections/` saves the uploaded file, then dispatches a Celery task (`myapp/tasks.run_inspection`) and returns a `task_id` immediately (HTTP 202). The task calls `predict2(uploaded_file_path, date)` in a background worker and writes all three DB records on completion. The frontend polls `GET /api/inspections/task/<task_id>/` every 2 seconds until `status` is `SUCCESS` or `FAILURE`.

**`myapp/predict2.py`**
`predict2(uploaded_file_path, date)` is called from `myapp/tasks.run_inspection`. It runs **five separate YOLO models** in sequence (one per class: Y, B, G, C, D), each reading the same source image. For each detection it:
1. Crops the bounding box, converts to grayscale, thresholds, and finds contours
2. Fits a `minAreaRect` to measure grain length in mm (300 ppi assumed)
3. Classifies grains as whole (≥ 5.2 mm) or broken (< 5.2 mm), with three broken subcategories
4. Accumulates per-class counts for contamination percentage calculation
5. Writes five annotated images under `backend/media/`

Returns a tuple of two JSON strings (`data_size`, `data_type`) consumed by the view.

`myapp/predict.py` is an earlier single-model version; it is **not used** by any current views.

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
- `frontend/src/contexts/AuthContext.jsx` — global auth state (`user`, `login`, `logout`, `loading`); tokens stored in `localStorage` as `access`/`refresh`
- `frontend/src/components/ProtectedRoute.jsx` — redirects to `/login` if unauthenticated

**Routes**
| Path | Component | Auth |
|------|-----------|------|
| `/login` | LoginPage | public |
| `/register` | RegisterPage | public |
| `/` | HomePage | protected |
| `/inspections` | ListPage | protected |
| `/inspections/:id` | DetailPage | protected |

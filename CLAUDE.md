# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rice Quality Inspection System — a Django 5 web app that uses YOLOv8 (ultralytics) to analyze rice images and report quality metrics: grain size distribution (whole vs. broken), contamination percentages (Glutinous/G, Chalky/C, Broken/B, Yellow/Y, Damaged/D), and average grain dimensions in mm.

## Commands

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Tailwind CSS tooling (run from resources/)
cd resources && npm install

# Watch and compile Tailwind CSS (run from resources/)
npm run tailwind

# Apply database migrations
python manage.py migrate

# Run the development server (available at http://127.0.0.1:8000)
python manage.py runserver

# Run tests
python manage.py test myapp
```

## Architecture

### Django structure
- `myproject/` — project settings and root URL conf (`myproject/urls.py` includes `myapp.urls`)
- `myapp/` — sole Django app; contains all views, models, templates, and ML logic

### Database (`myproject/settings.py`)
Configured for **MySQL** (`rice-data` database). Update `NAME`, `USER`, and `PASSWORD` in `DATABASES` before first run. Run `python manage.py migrate` to create the three app tables:
- `Dataperson` — per-inspection customer metadata and uploaded image path
- `Data_size` — rice size results (whole %, broken %, broken subcategories b1/b2/b3, average height/width in mm)
- `Data_type` — contamination percentages and paths to the five annotated output images

### ML pipeline (`myapp/predict2.py`)
`predict2(uploaded_file_path, date)` is called from `views.AddData`. It runs **five separate YOLO models** in sequence (one per class: Y, B, G, C, D), each reading the same source image. For each detection it:
1. Crops the bounding box, converts to grayscale, thresholds, and finds contours
2. Fits a `minAreaRect` to measure grain length in mm (300 ppi assumed)
3. Classifies grains as whole (≥ 5.2 mm) or broken (< 5.2 mm), with three broken subcategories
4. Accumulates per-class counts for contamination percentage calculation
5. Writes five annotated images to `myapp/static/images/`

Returns a tuple of two JSON strings (`data_size`, `data_type`) consumed by the view.

`myapp/predict.py` is an earlier single-model version; it is **not used** by the current views.

### YOLO weights
Must be downloaded separately (Google Drive link in README) and placed at:
```
myapp/weights/y/best.pt
myapp/weights/b/best.pt
myapp/weights/g/best.pt
myapp/weights/c/best.pt
myapp/weights/d/best.pt
```

### CSS
Tailwind source is `myapp/static/src/input.css`; compiled output goes to `myapp/static/output/output.css`. Run `npm run tailwind` from `resources/` during development.

### Notifications
Uses `sweetify` (Django wrapper for SweetAlert2) for all user-facing success/error/warning messages.

### Authentication
Relies on Django's built-in `django.contrib.auth`. `LOGIN_URL` is set to `/loginuser/`. Most views are guarded with `@login_required`. The `registeruser` view creates `User` objects via `User.objects.create_user`.

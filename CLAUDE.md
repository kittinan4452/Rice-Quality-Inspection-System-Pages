# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Rice Quality Inspection System** (ระบบตรวจสอบคุณภาพของข้าว) - a Django web application that uses machine learning (YOLO) and image processing (OpenCV) to analyze rice quality. The system detects:
- Rice type percentages (Good, Chalky, Broken, Yellow, Damage)
- Rice size classifications (Good kernel vs Broken grain)
- Broken grain subcategories (large broken, small broken, brewers)

## Architecture

### Django Application Structure

```
myproject/          # Django project settings
myapp/              # Main Django app
├── models.py       # Dataperson, Datauser, Data_size, Data_type models
├── views.py        # Main view functions (login, register, AddData, showlist, etc.)
├── urls.py         # App URL routing
├── predict2.py     # ML inference pipeline (YOLO + OpenCV)
├── templates/      # HTML templates (index, loginuser, registeruser, showlist, showdata)
└── static/         # Static files and uploaded images
```

### Key Models

- **Dataperson**: Stores customer rice inspection records (name, register, member, type_rice, user_name, username, image)
- **Datauser**: User registration data (firstname, lastname, email, username, password)
- **Data_size**: Size analysis results (resultall_G, resultall_B, totalall, resultall_b1/b2/b3, average_h, average_w)
- **Data_type**: Type analysis results (percentages for G/C/B/Y/D types, 5 annotated images)

### Machine Learning Pipeline (predict2.py)

The `predict2()` function is the core ML pipeline:

1. **Multi-model YOLO detection**: Uses 5 separate YOLO models (one for each rice type: Y, B, G, C, D)
   - Model paths: `myapp/weights/{y,b,g,c,d}/best.pt` (must be manually downloaded)

2. **Image processing**: For each detected grain:
   - Crops bounding box
   - Converts to grayscale and binary threshold
   - Finds contours and calculates minAreaRect
   - Converts pixels to mm (300 PPI)

3. **Classification**:
   - Size classification based on length: Good (>=5.2mm), Broken (<5.2mm)
   - Broken subcategories: b1 (>=3.25mm), b2 (>=1.75mm), b3 (<1.75mm)
   - Generates 5 annotated images with bounding boxes

4. **Returns**: JSON objects for `data_size` and `data_type`

## Development Commands

### Initial Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install JS dependencies (SweetAlert2)
npm install
```

### Database Setup

MySQL is required. Update `myproject/settings.py` with your database credentials:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'rice-data',      # Change to your database name
        'USER': 'root',            # Change to your MySQL user
        'PASSWORD': '',            # Change to your MySQL password
        'HOST': '127.0.0.1',
        'PORT': '3307',
    }
}
```

### Running the Application

```bash
# Run migrations (create tables)
python manage.py migrate

# Create superuser (for Django admin)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Access the application at `http://localhost:8000` (default Django port) or `http://localhost:5000` (as noted in README - may require additional configuration).

### Django Admin

Access admin interface at `http://localhost:8000/admin/` - models are registered in `myapp/admin.py`:
- Dataperson
- Datauser
- Data_size
- Data_type

## Key Dependencies

- **Django 5.0.3**: Web framework
- **mysqlclient 2.2.4**: MySQL database connector
- **ultralytics 8.1.26**: YOLO model loading and inference
- **opencv-python 4.9.0.80**: Image processing
- **torch 2.2.1 / torchvision 0.17.1**: PyTorch for YOLO
- **sweetify 2.3.1**: SweetAlert2 integration for Django
- **ujson**: Fast JSON encoding

## Authentication & User Management

- Uses Django's built-in User model for authentication
- Custom `Datauser` model stores additional user info
- Login required for main views (`@login_required` decorator)
- `loginuser` view handles login, `registeruser` handles registration
- User-specific data filtering in `showlist`: filters by both `user_name` (first name) and `username` (Django username)

## Important Notes

### ML Model Weights

The YOLO model weights are NOT included in the repository and must be downloaded separately:
- Download from: https://drive.google.com/drive/folders/1yLBpLO_PjkgbKLM0vWjzl8bm8RPR6Eo9?usp=drive_link
- Extract to `myapp/weights/` with subdirectories: `y/`, `b/`, `g/`, `c/`, `d/`
- Each subdirectory should contain `best.pt`

### Static Files

- Uploaded images stored in `myapp/static/upload/`
- Generated annotated images stored in `myapp/static/images/`
- Static URL configuration: `STATIC_URL = "myapp/static/"`

### File Upload Handling

The `handle_uploaded_file()` function saves uploaded images with timestamp naming: `YYYYmmddHHMMSS.jpg`

### Image Deletion

When deleting records (`deletedata` view), the function properly deletes associated image files from storage before deleting database records.

## URL Routes

Key routes defined in `myapp/urls.py`:
- `/` - index (login required)
- `/loginuser` - login page
- `/registeruser` - registration
- `/AddData` - POST endpoint for rice analysis
- `/showlist` - list user's inspection records (paginated, 5 per page)
- `/showdata/<id_rice>` - detail view for single record
- `/deletedata/<id_rice>` - delete record
- `/singout` - logout

## Code Style Notes

- Thai language comments and strings throughout the codebase
- Mixed Thai/English in variable names and user-facing messages
- SweetAlert2 used for notifications via `sweetify.success()`, `sweetify.error()`, etc.

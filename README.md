# Rice Quality Inspection System — ระบบตรวจสอบคุณภาพข้าว

โครงการนี้นำเทคโนโลยี **Machine Learning (YOLOv8)** และ **Image Processing** มาช่วยตรวจสอบคุณภาพข้าว ให้สะดวกและแม่นยำยิ่งขึ้น — วิเคราะห์ขนาดเมล็ด (ต้นข้าว/ข้าวหัก), เปอร์เซ็นต์การปลอมปน (Glutinous/G, Chalky/C, Broken/B, Yellow/Y, Damaged/D) และขนาดเฉลี่ยของเมล็ดเป็นมิลลิเมตร

## Member
- นายเสฎฐวุฒิ นัตธิลม เลขประจำตัว 633040607-7
- นายกิตินันท์ กุณโฮง เลขประจำตัว 633040148-3

## สถาปัตยกรรม

ระบบถูกแยกเป็น 2 ส่วน:
- **`backend/`** — Django 5 REST API (ไม่มี template ฝั่งผู้ใช้แล้ว) ใช้ YOLOv8 วิเคราะห์ภาพผ่าน Celery (async) + MySQL + Redis
- **`frontend/`** — React 18 + Vite (SPA) คุยกับ backend ผ่าน Axios

**เทคโนโลยีหลัก:** Django REST Framework, JWT auth, Celery + Redis, MySQL, YOLOv8 (ultralytics), OpenCV, React + React Router + Tailwind CSS

**ฟีเจอร์:**
- สมัคร/เข้าสู่ระบบด้วย JWT, ลืมรหัสผ่าน (ส่งลิงก์รีเซ็ตทางอีเมล)
- อัปโหลดภาพข้าวเพื่อวิเคราะห์ (ประมวลผลแบบ background ผ่าน Celery)
- ดูรายการ/รายละเอียดผลการตรวจ
- **ระบบสิทธิ์ 2 ระดับ** (admin / user) — admin มี **Dashboard** ดูภาพรวม สถิติ และจัดการผู้ใช้

## เครื่องมือที่ต้องมี

- [Docker + Docker Compose](https://docs.docker.com/get-docker/) — **วิธีที่แนะนำ** (จัดการ db, redis, backend, worker, frontend ให้อัตโนมัติ)
- โมเดล Machine Learning (weights) ดาวน์โหลดแยกที่ → [Google Drive](https://drive.google.com/drive/folders/1yLBpLO_PjkgbKLM0vWjzl8bm8RPR6Eo9?usp=drive_link)

> ถ้าไม่ใช้ Docker ต้องติดตั้งเอง: Python 3.11, Node.js, MySQL, Redis

## การติดตั้งและใช้งาน (Docker — แนะนำ)

**1. โคลนโปรเจกต์**
```bash
git clone https://github.com/kittinan4452/Rice-Quality-Inspection-System-Pages.git
cd Rice-Quality-Inspection-System-Pages
```

**2. วาง YOLO weights** — ดาวน์โหลดโฟลเดอร์ `weights` จากลิงก์ด้านบน แล้ววางให้ได้ path:
```
backend/myapp/weights/y/best.pt
backend/myapp/weights/b/best.pt
backend/myapp/weights/g/best.pt
backend/myapp/weights/c/best.pt
backend/myapp/weights/d/best.pt
```

**3. ตั้งค่า environment** — คัดลอกไฟล์ตัวอย่างแล้วแก้ค่าตามต้องการ
```bash
cp .env.example .env
# แก้ DB_PASSWORD, SECRET_KEY และ (ถ้าต้องการส่งเมลจริง) ค่า EMAIL_* ใน .env
```

**4. รันทั้งระบบ**
```bash
docker compose up --build
```

**5. เปิดใช้งาน**
- เว็บแอป (frontend): http://localhost:5173
- API (backend): http://localhost:8000

### บัญชี admin เริ่มต้น
ระบบสร้างบัญชีผู้ดูแลให้อัตโนมัติตอนรัน migration:
- username: `admin` · password: `Admin@1234` (ตั้งค่าใหม่ได้ผ่าน `ADMIN_USERNAME`/`ADMIN_PASSWORD` ใน `.env`)

> ⚠️ ควรเปลี่ยนรหัสผ่านนี้ทันทีหลังเข้าใช้งานครั้งแรก

### คำสั่งที่ใช้บ่อย (Docker)
```bash
docker compose restart backend worker          # โหลดโค้ดใหม่ / รัน migration ใหม่
docker compose exec backend python manage.py <cmd>   # รันคำสั่ง manage.py ใน container
docker compose logs backend --tail 40          # ดู log (อีเมลรีเซ็ตโผล่ที่นี่ในโหมด console)
```

## การติดตั้งแบบรันเอง (ไม่ใช้ Docker)

ต้องมี MySQL และ Redis รันอยู่ก่อน แล้วแก้ค่า `DATABASES` ใน `backend/myproject/settings.py`

**Backend** (รันจาก `backend/`)
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver               # API ที่ http://127.0.0.1:8000
celery -A myproject worker -l info       # Celery worker (อีกเทอร์มินัล, ต้องมี Redis)
```

**Frontend** (รันจาก `frontend/`)
```bash
npm install
npm run dev                              # Vite ที่ http://localhost:5173
```

## โครงสร้างโปรเจกต์
```
Rice-Quality-Inspection-System-Pages/
├─ backend/          # Django REST API
│  ├─ myproject/     # settings, urls, celery config
│  └─ myapp/         # models, views, serializers, ML (predict2.py), weights/
├─ frontend/         # React + Vite SPA
├─ docker-compose.yml
└─ .env.example
```

# Project-Rice-Quality-Inspection-System (MCV)
## Rice Quality Inspection System หรือ ระบบตรวจสอบคุณภาพของข้าว
โครงการนี้มีจุดประสงค์เพื่อนำเทคโนโลยี  machine learning  และ  image processing  มาใช้ในการช่วยตรวจสอบคุณภาพข้าวให้มีความสะดวกสบายและมีความแม่นยำมากยิ่งขึ้น  
## Member
- นายเสฎฐวุฒิ นัตธิลม เลขประจำตัว 633040607-7
- นายกิตินันท์  กุณโฮง เลขประจำตัว 633040148-3
## วิธีการใช้งาน Project Rice Quality Inspection System
## เครื่องมือที่จำเป็นในการใช้งาน Project Rice Quality Inspection System 
- Visual Studio Code สามารถโหลดได้ที่ [คลิก](https://code.visualstudio.com/)
- Anaconda VM สามารถโหลดได้ที่ [คลิก](https://www.anaconda.com/download)
- Python สามารถโหลดได้ที่ [คลิก](https://www.python.org/downloads/windows/)
- machine learning ที่ใช้ในการตรวจสอบข้าวอยู่ในโฟล์เดอร์สามารถ Download ได้ที่ [คลิก](https://drive.google.com/drive/folders/1yLBpLO_PjkgbKLM0vWjzl8bm8RPR6Eo9?usp=drive_link)
- Database mysql สามารถ Download  [คลิก](https://dev.mysql.com/downloads/installer/) สามารถดูวิธีการติดตั้งได้ที่ [คลิก] 
## หลังจากทำการติดตั้งเครื่องมือทั้งหมดที่ไว้ข้างต้น
ขั้นตอนที่ 1 ทำการโหลดโปรแกรมลงมาที่เครื่องโดยใช้คำสั่งต่อไปนี้ 
``` bash
git clone https://github.com/kittinan4452/Rice-Quality-Inspection-System-Pages.git
```
ขั้นตอนที่ 2 นำโฟลเดอร์ machine learning ที่โหลดจากลิ้งคด้านบนที่ชื่อว่า weights ใส่ลงในโฟล์เดอร์ myapp เหมือน Path 
```bash
|-myapp-
       |-__pycache
       |-migrations
       |-static
       |-templates
       |-weights  
|-myproject
|-node_modules
|-resources
|-static/images
```
ขั้นตอนที่ 3 เปิดโปรแกรม Anaconda สร้าง Environment โดยเลือกใช้ภาษา Python จากนั้นทำการเปิดโปรแกรม Visual Studio Code ผ่านตัวโปรแกรม Anaconda VM
ขั้นตอนที่ 4 เข้าไปในโฟลเดอร์ Rice-Quality-Inspection-System-Pages
```bash
cd Rice-Quality-Inspection-System-Pages
cd Myapp
```
ขั้นตอนที่ 5 ทำการติดตั้ง Packages library ที่จะใช้ในโปรแกรม
```bash
pip install -r requirements.txt
pip list
```
ขั้นตอนที่ 6 สร้าง Database ตามชื่อที่ต้องการสร้าง จากนั้นแก้ไขไฟล์ setting.py  
```bash
|-myapp- 
|-myproject
       |-__pycache__
       |-__init__.py
       |-asgi.py
       |-settings.py
       |-urls.py 
       |-wsgi.py 
|-node_modules
|-resources
|-static/images
```
เปิดไฟล์ settings.py เพื่อแก้ไขไฟล์ NAME ชื่อ Database , USER ชื่อ ผู้ใช้งาน , PASSWORD รหัสผ่าน ของผู้ใช้งาน  
```bash
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', 
        'NAME': 'rice-data',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}

```
ขั้นตอนที่ 7 ทำการสร้าง Table ใน Database โดยผ่าน migrations ที่สร้างไว้เรียบร้อย โดยใช้คำสั้ง
```bash
python manage.py migrate
``` 
ขั้นตอนที่ 8 จากนั้นทำการรัน คำสั่งเพื่อเริ่ม Run Sever Django
```bash
python manage.py runserver
```
ขั้นตอนที่ 9 เปิดหน้า Web application ผ่าน Browser โดยใช้คำสั่งนี้
```bash
http:localhost:5000
```
หรือ
```bash
http:127.0.0.1:5000
```


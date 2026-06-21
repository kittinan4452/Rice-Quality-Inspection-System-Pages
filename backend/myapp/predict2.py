
import cv2
from ultralytics import YOLO
import numpy as np
import ujson
from pathlib import Path
from django.conf import settings

_WEIGHTS_DIR = Path(__file__).resolve().parent / 'weights'

# ความละเอียดของภาพที่สแกน (pixels per inch) ใช้แปลง pixel -> mm
# ** สำคัญมาก: ค่านี้ต้องตรงกับ dpi จริงของภาพ ไม่งั้นขนาด mm และการแยกต้นข้าว/ข้าวหักจะผิด **
PPI = 300

# ค่าความมั่นใจขั้นต่ำของ YOLO ที่จะนำ detection มานับ (0-1) กรองกล่องที่ไม่มั่นใจทิ้ง
CONF_THRESHOLD = 0.25

# พื้นที่ contour ขั้นต่ำ (pixel^2) กรอง noise เล็ก ๆ ทิ้ง
# ใช้ค่าเล็กเพราะเมล็ดในบางรูปมีขนาดเล็ก (ความละเอียดต่ำ) ถ้าตั้งสูงจะวัดขนาดไม่ได้เลย
MIN_CONTOUR_AREA = 30

#function  totalall_count ใช้ในการหาค่าเฉลี่ยของเมล็ดข้าวทั้งหมดเพื่อหาว่ามีกี่เม็ด
def totalall_count(total_B,total_C,total_G,total_Y,total_D):
    totall_class = 5
    totalall = (total_B + total_C + total_G + total_Y + total_D) / totall_class
    totalall = int(totalall)
    return totalall  # return จำนวนเมล็ดทั้งหมดที่ model นับได้

#function ใช้ในการหาว่าข้าวปลอมปนแต่ล่ะ class เป็นกี่เปอร์เซ็น
def percent_rice(totalall,G,C,B,Y,D):
    if totalall == 0:           # กันหารด้วยศูนย์เมื่อไม่พบเมล็ดเลย
        return 0, 0, 0, 0, 0
    percen = 100

    G = (G / totalall) * percen
    C = (C / totalall) * percen
    B = (B / totalall) * percen
    Y = (Y / totalall) * percen
    D = (D / totalall) * percen
    return  G,C,B,Y,D

#function ใช้ในการหาขนาดของข้าวว่า ต้นข้าว กับ ข้าวหัก มีกี่เปอร์เซ็น
def calculapersen(totalall,g,b):
    if totalall == 0:           # กันหารด้วยศูนย์
        return 0, 0
    percen = 100
    percen_g = (g / totalall) * percen
    percen_b = (b / totalall) * percen
    return percen_g ,percen_b

#function ใช้ในการหาขนาดของข้าวหักว่าข้าวหักแต่ล่ะขนาดที่แยกออกจากเปอร์เซ็นหลักมีกี่เปอร์เซ็น
def calculapersen_broken(totalall,broken,b1,b2,b3):
    percen = 100
    broken1 = (broken  * totalall) / percen
    print("broken",broken)
    if broken1 == 0:            # ไม่มีข้าวหัก -> ไม่ต้องแบ่งย่อย
        return 0, 0, 0
    b1 = (b1 / broken1) * broken  #ข้าวหักใหญ่
    b2 = (b2 / broken1) * broken  #ข้าวหักเล็ก
    b3 = (b3 / broken1) * broken  #ข้าวซีวัน
    return  b1,b2,b3

#function ใช้ในการหาค่าเฉลี่ยของ ความสูง และ ความกว้างต่อความสูง
def calcula_average(average_w,average_h,totalall):
    if totalall == 0 or average_w == 0:   # กันหารด้วยศูนย์
        return 0, 0
    average_h = average_h / totalall
    average_w = average_w / totalall
    average_w = average_h / average_w   # หมายเหตุ: ค่านี้คือ "อัตราส่วน สูง:กว้าง" ไม่ใช่ความกว้างเฉลี่ย
    return  average_h , average_w
#funtion แปลงความยาวของข้าวจาก Pixels เป็น mm
def pixels_to_mm(pixels):
    # 1 นิ้ว = 25.4 มิลลิเมตร
    inches = pixels / PPI
    mm = inches * 25.4
    return mm

#--------------------------------------------------------------------------------------------------------------------------------------------------------

#function main ของการตรวจข้าว
def predict2(uploaded_file_path,date):
    #เก็บ Model ไว้ในตัวแปร Model_yolo โดยจะเก็บเป็น Key และ value
    images_dir = settings.MEDIA_ROOT / 'images'
    images_dir.mkdir(parents=True, exist_ok=True)

    model_yolo = {
            "Y": str(_WEIGHTS_DIR / "y/best.pt"),
            "B": str(_WEIGHTS_DIR / "b/best.pt"),
            "G": str(_WEIGHTS_DIR / "g/best.pt"),
            "C": str(_WEIGHTS_DIR / "c/best.pt"),
            "D": str(_WEIGHTS_DIR / "d/best.pt"),
    }
    #สีของกรอบแต่ละ class
    colors = {
            "Y": [255, 0, 0],
            "Broken": [0, 255, 0],
            "C": [0, 0, 255],
            "G": [255, 255, 0],
            "Damage":[255,255,255],
            "N": [255, 0, 255],
            "Not": [255, 0, 255]
        }
    #มีไว้เก็บขนาดของข้าว ดี กับ ข้าวหัก
    g = 0 # ข้าวขนาดดี
    b = 0 # ต้นข้าว
    b1 = 0  # ข้าวหักใหญ่
    b2 = 0  # ข้าวหักเล็ก
    b3 = 0  # ข้าวหักซีวัน

    average_h = 0
    average_w = 0
    totalall = 0
    i0 = 0

    G = 0
    Y = 0
    B = 0
    C = 0
    D = 0

    total_G = 0
    total_Y = 0
    total_B = 0
    total_C = 0
    total_D = 0

    for key, value in model_yolo.items():
        i0 += 1
        model = YOLO(f'{value}')

        # Read an image using OpenCV
        source = cv2.imread(f'{uploaded_file_path}')
        if source is None:      # imread คืน None เมื่ออ่านไฟล์ไม่ได้ -> แจ้ง error ที่อ่านเข้าใจ
            raise FileNotFoundError(f'ไม่สามารถอ่านไฟล์รูปภาพได้: {uploaded_file_path}')
        results = model(source)[0]
        print("i0",i0)

        for i in range(len(results.boxes.data)):
            # นำค่าพิกัด bounding box, confidence, class index มาเก็บไว้ที่ boxes
            boxes = results.boxes.data[i].numpy().tolist()

            # ข้าม detection ที่ความมั่นใจต่ำกว่าเกณฑ์
            if boxes[4] < CONF_THRESHOLD:
                continue

            x1, y1, x2, y2 = int(boxes[0]), int(boxes[1]), int(boxes[2]), int(boxes[3])
            cropped_image = source[y1:y2, x1:x2]
            if cropped_image.size == 0:     # กรอบว่าง/นอกภาพ -> ข้าม
                continue

            # ----- นับเมล็ด: ทำทุก detection ที่มั่นใจพอ (ไม่ผูกกับ contour) -----
            # YOLO ตรวจเจอแล้ว = 1 เมล็ด ไม่ต้องรอ contour ถึงจะนับ
            class_name = results.names[int(boxes[5])]
            color = colors.get(class_name, colors["Not"])   # .get กัน KeyError เมื่อเจอชื่อ class ที่ไม่รู้จัก
            if class_name == "Y":
                Y += 1
            elif class_name == "Broken":
                B += 1
            elif class_name == "G":
                G += 1
            elif class_name == "C":
                C += 1
            elif class_name == "Damage":
                D += 1

            if key == "B":
                total_B += 1
            elif key == "Y":
                total_Y += 1
            elif key == "G":
                total_G += 1
            elif key == "C":
                total_C += 1
            elif key == "D":
                total_D += 1

            cv2.rectangle(source, (x1, y1), (x2, y2), color, 2)
            #เพิ่ม Text ที่บอก class เเละ confident ratio
            cv2.putText(source,
                        f'{class_name}:{int(boxes[4]*100)}',
                        (x1, y1 - 2),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        [252, 252, 252],
                        thickness=2)

            # ----- วัดขนาด (ต้นข้าว/ข้าวหัก): ทำเฉพาะโมเดล B และต้องหา contour เจอ -----
            if key != "B":
                continue
            gray_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2GRAY)
            # ใช้ Otsu หา threshold อัตโนมัติ ทนต่อสภาพแสงที่ต่างกัน
            thresh, binary = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            contours, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            valid_contours = [c for c in contours if cv2.contourArea(c) >= MIN_CONTOUR_AREA]
            if not valid_contours:
                continue   # นับเมล็ดไปแล้ว แค่วัดขนาดไม่ได้ในกรอบนี้
            cnt = max(valid_contours, key=cv2.contourArea)   # contour ใหญ่สุดอันเดียว กันนับซ้ำ

            rect = cv2.minAreaRect(cnt)
            box = np.intp(cv2.boxPoints(rect))
            # คำนวณด้านยาว/ด้านสั้นของกรอบ minAreaRect
            w = np.linalg.norm(box[0] - box[1])
            h = np.linalg.norm(box[1] - box[2])
            max_h = max(w, h)
            max_w = min(w, h)
            result_mm_h = pixels_to_mm(max_h)
            result_mm_w = pixels_to_mm(max_w)

            average_h += result_mm_h
            average_w += result_mm_w
            if result_mm_h >= 5.2:
                g += 1                      # ต้นข้าว (เมล็ดเต็ม)
            else:
                b += 1                      # ข้าวหัก
                if result_mm_h >= 3.25:
                    b1 += 1                 # ข้าวหักใหญ่
                elif result_mm_h >= 1.75:
                    b2 += 1                 # ข้าวหักเล็ก
                else:
                    b3 += 1                 # ข้าวหักซีวัน

        cv2.imwrite(str(images_dir / f'{date}{i0}.jpg'), source)


    image_1 = f"images/{date}1.jpg"
    image_2 = f"images/{date}2.jpg"
    image_3 = f"images/{date}3.jpg"
    image_4 = f"images/{date}4.jpg"
    image_5 = f"images/{date}5.jpg"
    print("g",g)
    print("b",b)
    print("b1",b1)
    print("b2",b2)
    print("b3",b3)
    print("G",G)
    print("C",C)
    print("B",B)
    print("Y",Y)
    print("D",D)

    print("B1",total_B)
    print("C1",total_C)
    print("G1",total_G)
    print("Y1",total_Y)
    print("D1",total_D)
    totalall = totalall_count(total_B,total_C,total_G,total_Y,total_D)
    print("cunt",totalall)
    resultall = calculapersen(totalall,g,b)
    resultall_rice = resultall[0] + resultall[1]
    print("all",resultall_rice)
    print("resultall_G",resultall[0])
    print("resultall_B",resultall[1])
    resultall_G = round(resultall[0],2)
    resultall_B = round(resultall[1],2)
    broken = resultall[1]
    broken_resultall = calculapersen_broken(totalall,broken,b1,b2,b3)
    print("resultall_b1",broken_resultall[0])
    print("resultall_b2",broken_resultall[1])
    print("resultall_b3",broken_resultall[2])
    resultall_b1 = round(broken_resultall[0],2)
    resultall_b2 = round(broken_resultall[1],2)
    resultall_b3 = round(broken_resultall[2],2)


    type_news = percent_rice(totalall,G,C,B,Y,D)

    resultall_type = type_news[0] + type_news[1] + type_news[2] + type_news[3] +type_news[4]
    print("resultall_G",type_news[0])
    print("resultall_C",type_news[1])
    print("resultall_B",type_news[2])
    print("resultall_Y",type_news[3])
    print("resultall_D",type_news[4])
    resultall_percent_G = round(type_news[0],2)
    resultall_percent_C = round(type_news[1],2)
    resultall_percent_B = round(type_news[2],2)
    resultall_percent_Y = round(type_news[3],2)
    resultall_percent_D = round(type_news[4],2)
    average = calcula_average(average_w,average_h,totalall)
    print("average_h",round(average[0],2))
    print("average_w",round(average[1],2))
    average_h = round(average[0],2)
    average_w = round(average[1],2)
    cv2.imwrite(str(images_dir / 'output.jpg'), source)


    data_size = {
      "resultall_G":resultall_G,
      "resultall_B":resultall_B,
      "totalall":totalall,
      "resultall_b1":resultall_b1,
      "resultall_b2":resultall_b2,
      "resultall_b3":resultall_b3,
      "average_h":average_h,
      "average_w":average_w
    }
    data_type = {
        "resultall_percent_G":resultall_percent_G,
        "resultall_percent_C":resultall_percent_C,
        "resultall_percent_B":resultall_percent_B,
        "resultall_percent_Y":resultall_percent_Y,
        "resultall_percent_D":resultall_percent_D,
        "image_1":image_1,
        "image_2":image_2,
        "image_3":image_3,
        "image_4":image_4,
        "image_5":image_5,

    }
    data_all = ujson.dumps(data_size)
    data_all2 = ujson.dumps(data_type)
    return data_all,data_all2

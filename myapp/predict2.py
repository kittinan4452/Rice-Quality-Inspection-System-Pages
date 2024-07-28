
import cv2
from ultralytics import YOLO
import numpy as np
from scipy.spatial.distance import euclidean
import ujson

#function  totalall_count ใช้ในการหาค่าเฉลี่ยของเมล็ดข้าวทั้งหมดเพื่อหาว่ามีกี่เม็ด
def totalall_count(total_B,total_C,total_G,total_Y,total_D):
    totall_class = 5
    totalall = (total_B + total_C + total_G + total_Y + total_D) / totall_class
    totalall = int(totalall)  
    return totalall  # return จำนวนเมล็ดทั้งหมดที่ model นับได้

#function ใช้ในการหาว่าข้าวปลอมปนแต่ล่ะ class เป็นกี่เปอร์เซ็น
def percent_rice(totalall,G,C,B,Y,D):
    percen = 100
    
    G = (G / totalall) * percen
    C = (C / totalall) * percen
    B = (B / totalall) * percen
    Y = (Y / totalall) * percen
    D = (D / totalall) * percen
    return  G,C,B,Y,D

#function ใช้ในการหาขนาดของข้าวว่า ต้นข้าว กับ ข้าวหัก มีกี่เปอร์เซ็น
def calculapersen(totalall,g,b):
    percen = 100
    totalall = totalall
    percen_g = (g / totalall) * percen
    percen_b = (b / totalall) * percen
    return percen_g ,percen_b  

#function ใช้ในการหาขนาดของข้าวหักว่าข้าวหักแต่ล่ะขนาดที่แยกออกจากเปอร์เซ็นหลักมีกี่เปอร์เซ็น
def calculapersen_broken(totalall,broken,b1,b2,b3):
    percen = 100
    broken1 = (broken  * totalall) / percen
    print("broken",broken)
    b1 = (b1 / broken1) * broken  #ข้าวหักใหญ่
    b2 = (b2 / broken1) * broken  #ข้าวหักเล็ก   
    b3 = (b3 / broken1) * broken  #ข้าวซีวัน
    return  b1,b2,b3

#function ใช้ในการหาค่าเฉลี่ยของ ความสูง และ ความกว้างต่อความสูง
def calcula_average(average_w,average_h,totalall):
    average_h = average_h / totalall
    average_w = average_w / totalall
    average_w = average_h / average_w
    return  average_h , average_w
#funtion แปลงความยาวของข้าวจาก Pixels เป็น mm
def pixels_to_mm(pixels):
    # 1 นิ้ว = 25.4 มิลลิเมตร
    ppi = 300
    inches = pixels / ppi
    mm = inches * 25.4
    return mm
#function ในการแยก
def get_classification(ratio):
    ratio = ratio
    to_ret = ""
    if ratio >= 7:
        to_ret = "t"
    elif  ratio > 5.2:
        to_ret = "g"
    elif ratio < 5.2:
         if ratio >= 3.25 and ratio < 5.2 :
              to_ret = "b"
         elif ratio < 3.25 and ratio >= 1.75:
             to_ret = "bl"
         elif ratio < 1.75:
             to_ret = "bll"
    to_ret = "(" + to_ret + ")"
    return to_ret

#--------------------------------------------------------------------------------------------------------------------------------------------------------
# Load a pretrained YOLOv8n model
#model = YOLO('weights/best.pt')

# Read an image using OpenCV
#source = cv2.imread('img/rice-Glutinous-1.jpg')
#results = model(source)[0]
#--------------------------------------------------------------------------------------------------------------------------------------------------------
       
#function main ของการตรวจข้าว
def predict2(uploaded_file_path,date):
    #เก็บ Model ไว้ในตัวแปร Model_yolo โดยจะเก็บเป็น Key และ value
    model_yolo = {
            "Y": "../myapp/weights/y/best.pt",
            "B": "../myapp/weights/b/best.pt",
            "G": "../myapp/weights/g/best.pt",
            "C": "../myapp/weights/c/best.pt",
            "D": "../myapp/weights/d/best.pt"
    } 
     #เก็บ Model ไว้ในตัวแปร Model_yolo โดยจะเก็บเป็น Key และ value
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
        results = model(source)[0]
        print("i0",i0)
        
        for i in range(len(results.boxes.data)):
                    # นำค่าพิกัดbounding box,ค่าความมั่นใจ(confidet ratio),class 
                    # มาเก็บไว้ที่ตัวแปร boxes
                boxes = results.boxes.data[i].numpy().tolist()
                    #สร้าง bounding box
                print(boxes)
                print(len(boxes))
                #image = source[int(boxes[1]):int(boxes[1])+int(boxes[3]),int(boxes[0]):int(boxes[0])+int(boxes[2])]
                x1, y1, x2, y2 = int(boxes[0]), int(boxes[1]), int(boxes[2]), int(boxes[3])
                cropped_image = source[y1:y2, x1:x2]
                gray_image = cv2.cvtColor(cropped_image,cv2.COLOR_BGR2GRAY)
                thresh ,binary = cv2.threshold(gray_image,30,255,cv2.THRESH_BINARY)
               # edged = cv2.Canny(binary, 50, 100)
                #edged1 = cv2.dilate(edged, None, iterations=1)
               # tii = cv2.erode(edged1, None, iterations=1)
                contours, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
                #cv2.imwrite("images/output1.jpg",edged )
                #cv2.imwrite("images/output2.jpg",hierarchy )
                height, width, channels = source.shape
                height1, width1, channels1 = cropped_image.shape
                print(height)
                print(height1)
                print(width1)
                for cnt in contours:
                    area = cv2.contourArea(cnt)
                    if area < 128:
                        continue
                    rect = cv2.minAreaRect(cnt)
                    box1 = cv2.boxPoints(rect)
                    box = np.intp(box1)
                        #print(box)
                            # คำนวณ aspect ratio
                    w = np.linalg.norm(box[0] - box[1])
                    h = np.linalg.norm(box[1] - box[2])
                    #aspect_ratio = max(w, h) / min(w, h)
                    #print("h1",w)
                    #print("w2",h)
                    #print("h",max(w, h))
                    #print("w",min(w, h))
                    #print("aspect_ratio",aspect_ratio)
                    max_w = min(w, h)
                    max_h = max(w, h)
                    
                    result_mm_h = pixels_to_mm(max_h)
                    result_mm_w = pixels_to_mm(max_w)
                            # กลับด้าน aspect ratio หากมีค่าน้อยกว่า 1

                    print(f"result_h {round(result_mm_h,3)} mm")
                    print(f"result_W {round(result_mm_w,3)} mm")
                            # กลับด้าน aspect ratio หากมีค่าน้อยกว่า 1
                    if key == "B" :
                        average_h += result_mm_h
                        average_w += result_mm_w
                        total_B += 1
                        if result_mm_h >= 5.2:
                            g += 1
                        elif result_mm_h < 5.2:
                            b += 1
                            if result_mm_h >= 3.25 and result_mm_h < 5.2 :
                                b1 += 1
                            elif result_mm_h < 3.25 and result_mm_h >= 1.75:
                                b2 += 1
                            elif result_mm_h < 1.75:
                                b3 += 1  
                    elif key == "Y" : 
                         total_Y += 1
                    elif key == "G":
                        total_G += 1
                    elif key == "C":
                        total_C += 1
                    elif key == "D":
                        total_D += 1
                    #earn = get_classification(result_mm_h)
                    #print(earn)
                    #print(round(result_mm_h,3))
                    #print("cunt",totalall)
                    #print("gun",total_ar)
                    #cv2.polylines(cropped_image, [box], isClosed=True, color=(0, 255, 0), thickness=2)
                   # cv2.imwrite("images/output4.jpg",cropped_image )
                    # ใส่โค้ดที่คำนวณ aspect_ratio หลังจากนั้น

                    

                
                    color = colors[results.names[int(boxes[5])]]
                    if results.names[int(boxes[5])] == "Y":
                         Y += 1
                    elif results.names[int(boxes[5])] == "Broken":
                         B += 1 
                    elif results.names[int(boxes[5])] == "G":
                         G += 1 
                    elif results.names[int(boxes[5])] == "C":
                         C += 1 
                    elif results.names[int(boxes[5])] == "Damage":
                         D += 1 
                    cv2.rectangle(source,(int(boxes[0]),int(boxes[1])),
                                (int(boxes[2]),int(boxes[3])),color,2)
                    #เพิ่ม Text ที่บอก class เเละ confident ratio
                    cv2.putText(source,
                                f'{results.names[int(boxes[5])]}:{int(boxes[4]*100)}', 
                                (int(boxes[0]), int(boxes[1] - 2)),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                1, 
                                [252, 252, 252],
                                thickness=2)
                    
        cv2.imwrite(f"myapp/static/images/{date}{i0}.jpg",source)


    image_1 = f"myapp/static/images/{date}1.jpg"
    image_2 = f"myapp/static/images/{date}2.jpg"
    image_3 = f"myapp/static/images/{date}3.jpg"
    image_4 = f"myapp/static/images/{date}4.jpg"
    image_5 = f"myapp/static/images/{date}5.jpg"
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
    cv2.imwrite("images/output.jpg",source)


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
    #cv2.imwrite("images/output1.jpg",binary)
    return data_all,data_all2

#cv2.imwrite("images/output1.jpg",image)
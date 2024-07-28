from django.shortcuts import render ,redirect
from myapp.predict2 import predict2
from myapp.models import Dataperson ,Data_type ,Data_size
from django.contrib.auth.models import User
from datetime import datetime
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login ,logout
from django.contrib.auth.hashers import make_password, check_password
from django.contrib import messages
from django.db import IntegrityError
import json
import sweetify

# ตัวอย่างการเข้ารหัสรหัสผ่าน
#raw_password = 'my_password'
#hashed_password = make_password(raw_password)

# ตรวจสอบรหัสผ่าน
#is_correct = check_password(raw_password, hashed_password)
#print(is_correct)

#from django.contrib.auth import authenticate

# สมมติว่า username และ password มาจากฟอร์ม
#username = 'example_user'
#password = 'example_password'

# ทำการตรวจสอบ
#user = authenticate(username=username, password=password)

#if user is not None:
    # ข้อมูลถูกต้อง, user คืออ็อบเจกต์ผู้ใช้
   # print(f"User {user.username} is authenticated.")
    #print(f"User email: {user.email}")
   # print(f"User first name: {user.first_name}")
    # เป็นต้น
#else:
    # ข้อมูลไม่ถูกต้อง
    #print("Authentication failed.")


#pred = LICENSEPLATE_DETECTION("../myapp/weights/best.pt")


def handle_uploaded_file(uploaded_file, filename):
    
    with open(filename, 'wb') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    return filename

@login_required(login_url="loginuser")    
def index(request):
    if request.user.is_authenticated:
        username = request.user.first_name
        return render(request,"index.html",{"username":username})
    
    else:
        return redirect("/loginuser")
# Create your views here.
def loginuser(request):
    if request.user.is_authenticated:
        return redirect('/')
    else:
        if request.method=="POST":
            username=request.POST['username']
            password=request.POST["password"]
            print(username)
            print(password)
            user=authenticate(request,username=username,password=password)
            print(user)
            if user is not None:
                login(request,user)
                #sweetify.success(request, 'You did it', text='Good job! You successfully showed a SweetAlert message', persistent='Hell yeah')
                sweetify.success(request , f"ยินดีต้อนรับ {username}")
                return redirect('/')
            else:
                print("tii")
                #sweetify.toast(request, 'Oops, something went wrong !', icon="error", timer=3000)
                sweetify.error(request, 'กรุณาเข้าสู่ระบบอีกครั้งเกิดการผิดพลาด', persistent=':(')
                return redirect('/loginuser')
        else:
            return render(request,"loginuser.html")
def registeruser(request):
    if request.method == "POST":
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']

        try:
            # ตรวจสอบว่าไม่มีผู้ใช้ที่มี username และ firstname ที่ระบุ
            if not User.objects.filter(username=username, first_name=firstname).exists():
                # สร้างผู้ใช้ใหม่
                user = User.objects.create_user(first_name=firstname, last_name=lastname, username=username, password=password, email=email)
                user.save()
                sweetify.success(request, "คุณได้สมัครสมาชิกเรียบร้อย")
                # ทำการ redirect หรือส่ง response ตามที่คุณต้องการ
                return render(request, "registeruser.html")  # แก้ไข 'your_redirect_url' เป็น URL ที่คุณต้องการ

            else:
                # จัดการกรณีที่มีชื่อผู้ใช้มีอยู่แล้ว
                sweetify.warning(request, 'ชื่อสมาชิกนี้ได้ใช้แล้วกรุณาตรวจสอบ ชื่อ และ Username', button='Ok', timer=3000)
                return render(request, "registeruser.html")

        except IntegrityError as e:
            # จัดการ IntegrityError
            sweetify.error(request, f'เกิดข้อผิดพลาด: {str(e)}', button='Ok', timer=3000)
            return render(request, "registeruser.html")

    return render(request, "registeruser.html")
        
def AddData(request):
    if request.method == "POST":
        username_user = request.user.username
       
        name =  request.POST['name-customer']
        register = request.POST['register-customer']
        member = request.POST['member-customer']
        type_rice = request.POST['type-rice']
        user_name = request.POST['user-name']
        uploaded_file = request.FILES['file']
        if uploaded_file.name != "":
            date = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"myapp/static/upload/{date}.jpg"
            output = f"myapp/static/upload/{date}.jpg"
            uploaded_file_path = handle_uploaded_file(uploaded_file, filename)
            data = predict2(uploaded_file_path,date)
            print("tii",data)
            data_size = json.loads(data[0])
            data_type = json.loads(data[1])
            Person = Dataperson.objects.create(
                name=name,
                register=register,
                member=member,
                type_rice=type_rice,
                image=output,
                user_name=user_name,
                username=username_user,


            )
            Data_typeDB = Data_type.objects.create(
                resultall_percent_G =data_type['resultall_percent_G'],
                resultall_percent_C=data_type['resultall_percent_C'],
                resultall_percent_B =data_type['resultall_percent_B'],
                resultall_percent_Y =data_type['resultall_percent_Y'],
                resultall_percent_D =data_type['resultall_percent_D'],
                image1=data_type['image_1'],
                image2=data_type['image_2'],
                image3=data_type['image_3'],
                image4=data_type['image_4'],
                image5=data_type['image_5'],

            )
            Data_sizeDB = Data_size.objects.create(
                resultall_G = data_size['resultall_G'],
                resultall_B = data_size['resultall_B'],
                totalall = data_size['totalall'],
                resultall_b1 =data_size['resultall_b1'],
                resultall_b2 =data_size['resultall_b2'],
                resultall_b3=data_size['resultall_b3'],
                average_h =data_size['average_h'],
                average_w =data_size['average_w']

            )
            Person.save()
            Data_typeDB.save()
            Data_sizeDB.save()
            sweetify.success(request, 'ระบบทำการตรวจสำเร็จแลัว')
            return redirect('/')
    return render(request,"index.html")


@login_required(login_url="loginuser") 
def showlist(request):
    if request.user.is_authenticated:
        username = request.user.first_name
        username2 = request.user.username
        print(username)
        emplist = Dataperson.objects.filter(user_name=username,username=username2).order_by('id') 
        page = request.GET.get('page', 1)
    
        paginator = Paginator(emplist, 5 )
        try:
            employees = paginator.page(page)
        except PageNotAnInteger:
            employees = paginator.page(1)
        except EmptyPage:
            employees = paginator.page(paginator.num_pages)
        return render(request,"showlist.html",{"dataperson":employees,"username":username})
    else:
        return redirect("/loginuser")
def showdata(request,id_rice):
    if request.user.is_authenticated:
        username = request.user.first_name  
        dataperson = Dataperson.objects.get(id=id_rice)
        data_size = Data_size.objects.get(id=id_rice)
        data_type = Data_type.objects.get(id=id_rice)
        return render(request,"showdata.html",{"person":dataperson,"username":username,"datasize":data_size,"datatype":data_type})
    else:
        return redirect("/loginuser")
def deletedata(request,id_rice):
    dataperson = Dataperson.objects.get(id=id_rice)
    data_size = Data_size.objects.get(id=id_rice)
    data_type = Data_type.objects.get(id=id_rice)
  # ใช้ delete() เพื่อลบไฟล์และลบบันทึกในฐานข้อมูล
    dataperson.image.delete(save=False)
    data_type.image1.delete(save=False)
    data_type.image2.delete(save=False)
    data_type.image3.delete(save=False)
    data_type.image4.delete(save=False)
    data_type.image5.delete(save=False)
    dataperson.delete()
    data_size.delete()
    data_type.delete()
    sweetify.success(request, 'ลบข้อมูลสำเร็จ')
    return redirect("/showlist")

def singout(request):
    logout(request)
    return redirect('/')


   

        

#def searchbar(request):

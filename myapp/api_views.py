from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError, connection
from django.views.decorators.csrf import csrf_exempt
from .models import Dataperson, Data_type, Data_size
from .serializers import (
    DatapersonSerializer, Data_sizeSerializer, Data_typeSerializer,
    LoginSerializer, RegisterSerializer, UserSerializer,
    RiceInspectionCreateSerializer
)
from .predict2 import predict2
from datetime import datetime
import json
import os


# ==================== Health Check ====================

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint to verify backend is running"""
    # Check database connection
    db_status = "ok"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_status = f"error: {str(e)}"

    return Response({
        'status': 'healthy',
        'message': 'Backend is running!',
        'service': 'Rice Quality Inspection System API',
        'version': '1.0.0',
        'database': db_status,
        'timestamp': datetime.now().isoformat()
    }, status=status.HTTP_200_OK)


def handle_uploaded_file(uploaded_file, filename):
    """Handle uploaded file and save to disk"""
    with open(filename, 'wb') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    return filename


# ==================== Auth Views ====================

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({
            'error': 'กรุณาระบุ username และ password'
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return Response({
            'message': f'ยินดีต้อนรับ {username}',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'กรุณาเข้าสู่ระบบอีกครั้งเกิดการผิดพลาด'
        }, status=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Registration endpoint"""
    firstname = request.data.get('firstname')
    lastname = request.data.get('lastname')
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not all([firstname, lastname, username, password, email]):
        return Response({
            'error': 'กรุณาระบุข้อมูลให้ครบถ้วน'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        if not User.objects.filter(username=username, first_name=firstname).exists():
            user = User.objects.create_user(
                first_name=firstname,
                last_name=lastname,
                username=username,
                password=password,
                email=email
            )
            return Response({
                'message': 'คุณได้สมัครสมาชิกเรียบร้อย',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': 'ชื่อสมาชิกนี้ได้ใช้แล้วกรุณาตรวจสอบ ชื่อ และ Username'
            }, status=status.HTTP_400_BAD_REQUEST)

    except IntegrityError as e:
        return Response({
            'error': f'เกิดข้อผิดพลาด: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    """Logout endpoint"""
    logout(request)
    return Response({'message': 'ออกจากระบบสำเร็จ'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Get current user info"""
    return Response(UserSerializer(request.user).data)


# ==================== Inspection Views ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def inspection_list(request):
    """Get list or create rice inspections for current user"""
    if request.method == 'GET':
        username = request.user.first_name
        username2 = request.user.username
        emplist = Dataperson.objects.filter(
            user_name=username,
            username=username2
        ).order_by('id')

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 5))

        start = (page - 1) * page_size
        end = start + page_size

        page_data = emplist[start:end]
        data = []

        for item in page_data:
            try:
                data_size = Data_size.objects.get(id=item.id)
                data_type = Data_type.objects.get(id=item.id)
                data.append({
                    'id': item.id,
                    'person': DatapersonSerializer(item, context={'request': request}).data,
                    'data_size': Data_sizeSerializer(data_size, context={'request': request}).data,
                    'data_type': Data_typeSerializer(data_type, context={'request': request}).data
                })
            except (Data_size.DoesNotExist, Data_type.DoesNotExist):
                pass

        return Response({
            'data': data,
            'total': emplist.count(),
            'page': page,
            'page_size': page_size
        })

    return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inspection_detail(request, pk):
    """Get single rice inspection detail"""
    try:
        dataperson = Dataperson.objects.get(id=pk)
        data_size = Data_size.objects.get(id=pk)
        data_type = Data_type.objects.get(id=pk)

        return Response({
            'person': DatapersonSerializer(dataperson, context={'request': request}).data,
            'data_size': Data_sizeSerializer(data_size, context={'request': request}).data,
            'data_type': Data_typeSerializer(data_type, context={'request': request}).data
        })
    except Dataperson.DoesNotExist:
        return Response({'error': 'ไม่พบข้อมูล'}, status=status.HTTP_404_NOT_FOUND)


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def inspection_create(request):
    """Create new rice inspection with ML prediction"""
    name = request.data.get('name')
    register = request.data.get('register')
    member = request.data.get('member')
    type_rice = request.data.get('type_rice')
    user_name = request.data.get('user_name')

    if 'image' not in request.FILES:
        return Response({'error': 'กรุณาอัพโหลดรูปภาพ'}, status=status.HTTP_400_BAD_REQUEST)

    uploaded_file = request.FILES['image']

    if not all([name, register, member, type_rice, user_name]):
        return Response({'error': 'กรุณาระบุข้อมูลให้ครบถ้วน'}, status=status.HTTP_400_BAD_REQUEST)

    username_user = request.user.username

    # Create upload directory if not exists
    upload_dir = 'myapp/static/upload'
    os.makedirs(upload_dir, exist_ok=True)
    images_dir = 'myapp/static/images'
    os.makedirs(images_dir, exist_ok=True)

    date = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"myapp/static/upload/{date}.jpg"
    output = f"myapp/static/upload/{date}.jpg"

    try:
        uploaded_file_path = handle_uploaded_file(uploaded_file, filename)
        data = predict2(uploaded_file_path, date)

        data_size = json.loads(data[0])
        data_type = json.loads(data[1])

        person = Dataperson.objects.create(
            name=name,
            register=register,
            member=member,
            type_rice=type_rice,
            image=output,
            user_name=user_name,
            username=username_user,
        )

        Data_typeDB = Data_type.objects.create(
            resultall_percent_G=data_type['resultall_percent_G'],
            resultall_percent_C=data_type['resultall_percent_C'],
            resultall_percent_B=data_type['resultall_percent_B'],
            resultall_percent_Y=data_type['resultall_percent_Y'],
            resultall_percent_D=data_type['resultall_percent_D'],
            image1=data_type['image_1'],
            image2=data_type['image_2'],
            image3=data_type['image_3'],
            image4=data_type['image_4'],
            image5=data_type['image_5'],
        )

        Data_sizeDB = Data_size.objects.create(
            resultall_G=data_size['resultall_G'],
            resultall_B=data_size['resultall_B'],
            totalall=data_size['totalall'],
            resultall_b1=data_size['resultall_b1'],
            resultall_b2=data_size['resultall_b2'],
            resultall_b3=data_size['resultall_b3'],
            average_h=data_size['average_h'],
            average_w=data_size['average_w']
        )

        return Response({
            'message': 'ระบบทำการตรวจสำเร็จแลัว',
            'id': person.id,
            'person': DatapersonSerializer(person, context={'request': request}).data,
            'data_size': Data_sizeSerializer(Data_sizeDB, context={'request': request}).data,
            'data_type': Data_typeSerializer(Data_typeDB, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'error': f'เกิดข้อผิดพลาด: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def inspection_delete(request, pk):
    """Delete rice inspection"""
    try:
        dataperson = Dataperson.objects.get(id=pk)
        data_size = Data_size.objects.get(id=pk)
        data_type = Data_type.objects.get(id=pk)

        # Delete image files
        if dataperson.image:
            dataperson.image.delete(save=False)
        if data_type.image1:
            data_type.image1.delete(save=False)
        if data_type.image2:
            data_type.image2.delete(save=False)
        if data_type.image3:
            data_type.image3.delete(save=False)
        if data_type.image4:
            data_type.image4.delete(save=False)
        if data_type.image5:
            data_type.image5.delete(save=False)

        dataperson.delete()
        data_size.delete()
        data_type.delete()

        return Response({'message': 'ลบข้อมูลสำเร็จ'}, status=status.HTTP_200_OK)

    except Dataperson.DoesNotExist:
        return Response({'error': 'ไม่พบข้อมูล'}, status=status.HTTP_404_NOT_FOUND)

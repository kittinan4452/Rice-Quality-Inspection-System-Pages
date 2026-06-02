import json
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Data_size, Data_type, Dataperson
from .predict2 import predict2
from .serializers import InspectionDetailSerializer, InspectionListSerializer


def _save_upload(uploaded_file, filepath: Path):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'wb') as f:
        for chunk in uploaded_file.chunks():
            f.write(chunk)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {'detail': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'first_name': user.first_name,
        })


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        firstname = request.data.get('firstname', '')
        lastname = request.data.get('lastname', '')
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        email = request.data.get('email', '')

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'ชื่อสมาชิกนี้ถูกใช้แล้ว'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.create_user(
                first_name=firstname, last_name=lastname,
                username=username, password=password, email=email,
            )
            user.save()
            return Response({'detail': 'สมัครสมาชิกสำเร็จ'}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    def get(self, request):
        return Response({
            'username': request.user.username,
            'first_name': request.user.first_name,
        })


class InspectionListView(APIView):
    def get(self, request):
        qs = Dataperson.objects.filter(
            user_name=request.user.first_name,
            username=request.user.username,
        ).order_by('id')
        paginator = PageNumberPagination()
        paginator.page_size = 5
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(
            InspectionListSerializer(page, many=True).data
        )

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'detail': 'กรุณาแนบไฟล์รูปภาพ'}, status=status.HTTP_400_BAD_REQUEST)

        date = datetime.now().strftime('%Y%m%d%H%M%S')
        upload_path = settings.MEDIA_ROOT / 'upload' / f'{date}.jpg'
        _save_upload(uploaded_file, upload_path)

        size_json, type_json = predict2(str(upload_path), date)
        data_size = json.loads(size_json)
        data_type = json.loads(type_json)

        person = Dataperson.objects.create(
            name=request.data.get('name', ''),
            register=request.data.get('register', ''),
            member=request.data.get('member', ''),
            type_rice=request.data.get('type_rice', ''),
            image=f'upload/{date}.jpg',
            user_name=request.user.first_name,
            username=request.user.username,
        )
        Data_size.objects.create(
            resultall_G=data_size['resultall_G'],
            resultall_B=data_size['resultall_B'],
            totalall=data_size['totalall'],
            resultall_b1=data_size['resultall_b1'],
            resultall_b2=data_size['resultall_b2'],
            resultall_b3=data_size['resultall_b3'],
            average_h=data_size['average_h'],
            average_w=data_size['average_w'],
        )
        Data_type.objects.create(
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
        return Response({'detail': 'ตรวจสอบเสร็จสิ้น', 'id': person.id}, status=status.HTTP_201_CREATED)


class InspectionDetailView(APIView):
    def get(self, request, pk):
        try:
            person = Dataperson.objects.get(id=pk, username=request.user.username)
        except Dataperson.DoesNotExist:
            return Response({'detail': 'ไม่พบข้อมูล'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InspectionDetailSerializer(person, context={'request': request}).data)

    def delete(self, request, pk):
        try:
            person = Dataperson.objects.get(id=pk, username=request.user.username)
            size = Data_size.objects.get(id=pk)
            type_data = Data_type.objects.get(id=pk)
        except (Dataperson.DoesNotExist, Data_size.DoesNotExist, Data_type.DoesNotExist):
            return Response({'detail': 'ไม่พบข้อมูล'}, status=status.HTTP_404_NOT_FOUND)
        person.delete()
        size.delete()
        type_data.delete()
        return Response({'detail': 'ลบข้อมูลสำเร็จ'}, status=status.HTTP_204_NO_CONTENT)

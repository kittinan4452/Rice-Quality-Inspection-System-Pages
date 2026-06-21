from datetime import datetime, timedelta
from pathlib import Path

from celery.result import AsyncResult
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.db import IntegrityError
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.utils.http import urlsafe_base64_decode
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Data_size, Data_type, Dataperson
from .serializers import InspectionDetailSerializer, InspectionListSerializer
from .tasks import run_inspection


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
            'is_staff': user.is_staff,
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
            'is_staff': request.user.is_staff,
        })


class InspectionListView(APIView):
    def get(self, request):
        # admin เห็นทุกรายการ, user ทั่วไปเห็นเฉพาะของตัวเอง
        if request.user.is_staff:
            qs = Dataperson.objects.all().order_by('id')
        else:
            qs = Dataperson.objects.filter(owner=request.user).order_by('id')
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

        task = run_inspection.delay(
            str(upload_path),
            date,
            request.data.get('name', ''),
            request.data.get('register', ''),
            request.data.get('member', ''),
            request.data.get('type_rice', ''),
            request.user.first_name,
            request.user.username,
            request.user.id,
        )
        return Response({'task_id': task.id, 'detail': 'กำลังประมวลผล...'}, status=status.HTTP_202_ACCEPTED)


class InspectionDetailView(APIView):
    def _scoped_qs(self, request):
        # admin เข้าถึงได้ทุกรายการ, user ทั่วไปเฉพาะของตัวเอง
        if request.user.is_staff:
            return Dataperson.objects.all()
        return Dataperson.objects.filter(owner=request.user)

    def get(self, request, pk):
        try:
            person = self._scoped_qs(request).get(id=pk)
        except Dataperson.DoesNotExist:
            return Response({'detail': 'ไม่พบข้อมูล'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InspectionDetailSerializer(person, context={'request': request}).data)

    def delete(self, request, pk):
        try:
            person = self._scoped_qs(request).get(id=pk)
            size = Data_size.objects.get(id=pk)
            type_data = Data_type.objects.get(id=pk)
        except (Dataperson.DoesNotExist, Data_size.DoesNotExist, Data_type.DoesNotExist):
            return Response({'detail': 'ไม่พบข้อมูล'}, status=status.HTTP_404_NOT_FOUND)
        person.delete()
        size.delete()
        type_data.delete()
        return Response({'detail': 'ลบข้อมูลสำเร็จ'}, status=status.HTTP_204_NO_CONTENT)


class TaskStatusView(APIView):
    def get(self, request, task_id):
        result = AsyncResult(task_id)
        if result.state == 'SUCCESS':
            return Response({'status': 'SUCCESS', 'inspection_id': result.result})
        if result.state == 'FAILURE':
            return Response({'status': 'FAILURE', 'error': str(result.result)})
        return Response({'status': result.state, 'inspection_id': None})


class AdminStatsView(APIView):
    """สรุปข้อมูลสำหรับ Admin Dashboard (เฉพาะ is_staff)"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        qs = Dataperson.objects.all()

        totals = {
            'inspections': qs.count(),
            'users': User.objects.count(),
            'today': qs.filter(date__date=today).count(),
            'week': qs.filter(date__gte=now - timedelta(days=7)).count(),
            'month': qs.filter(date__gte=now - timedelta(days=30)).count(),
        }

        # สัดส่วนชนิดข้าว
        rice_types = list(
            qs.values('type_rice').annotate(count=Count('id')).order_by('-count')
        )

        # จำนวนการตรวจย้อนหลัง 14 วัน (เติมวันที่ไม่มีข้อมูลให้ครบ)
        days = 14
        start = (now - timedelta(days=days - 1)).date()
        raw = (
            qs.filter(date__date__gte=start)
            .annotate(d=TruncDate('date'))
            .values('d').annotate(count=Count('id'))
        )
        counts = {r['d']: r['count'] for r in raw}
        timeseries = [
            {'date': (start + timedelta(days=i)).isoformat(),
             'count': counts.get(start + timedelta(days=i), 0)}
            for i in range(days)
        ]

        recent = InspectionListSerializer(qs.order_by('-id')[:5], many=True).data

        return Response({
            'totals': totals,
            'rice_types': rice_types,
            'timeseries': timeseries,
            'recent': recent,
        })


class AdminUserListView(APIView):
    """รายชื่อผู้ใช้ทั้งหมดพร้อมจำนวนการตรวจ (เฉพาะ is_staff)"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.annotate(
            inspection_count=Count('inspections')
        ).order_by('-date_joined')
        data = [{
            'id': u.id,
            'username': u.username,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'email': u.email,
            'is_staff': u.is_staff,
            'is_active': u.is_active,
            'inspection_count': u.inspection_count,
            'date_joined': u.date_joined,
        } for u in users]
        return Response(data)


class AdminUserDetailView(APIView):
    """เปิด/ปิดการใช้งาน หรือเลื่อน/ลดสิทธิ์ admin (เฉพาะ is_staff)"""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({'detail': 'ไม่พบผู้ใช้'}, status=status.HTTP_404_NOT_FOUND)
        # กันแก้สิทธิ์ตัวเอง (ป้องกันล็อกตัวเองออกจากระบบ admin)
        if user.id == request.user.id:
            return Response(
                {'detail': 'ไม่สามารถแก้สิทธิ์ของบัญชีตัวเองได้'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for field in ('is_active', 'is_staff'):
            if field in request.data:
                setattr(user, field, bool(request.data[field]))
        user.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
        })


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        form = PasswordResetForm({'email': email})
        if form.is_valid():
            form.save(
                request=request,
                email_template_name='password_reset_email.html',
                extra_email_context={'frontend_url': settings.FRONTEND_URL},
            )
        return Response({'detail': 'หากอีเมลนี้ถูกลงทะเบียนไว้ คุณจะได้รับอีเมลรีเซ็ตรหัสผ่าน'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')
        try:
            user = User.objects.get(pk=urlsafe_base64_decode(uid).decode())
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'detail': 'ลิงก์ไม่ถูกต้องหรือหมดอายุ'}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'ลิงก์ไม่ถูกต้องหรือหมดอายุ'}, status=status.HTTP_400_BAD_REQUEST)
        form = SetPasswordForm(user, {'new_password1': new_password, 'new_password2': new_password})
        if form.is_valid():
            form.save()
            return Response({'detail': 'รีเซ็ตรหัสผ่านสำเร็จ'})
        errors = ' '.join([e for errs in form.errors.values() for e in errs])
        return Response({'detail': errors}, status=status.HTTP_400_BAD_REQUEST)

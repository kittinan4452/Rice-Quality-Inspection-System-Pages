import os

from django.conf import settings
from django.db import migrations


def create_admin(apps, schema_editor):
    """สร้างบัญชี admin เริ่มต้นถ้ายังไม่มี (ตั้งค่าผ่าน env ได้)"""
    from django.contrib.auth.hashers import make_password

    User = apps.get_model('auth', 'User')
    username = os.environ.get('ADMIN_USERNAME', 'SuperAdmin')
    password = os.environ.get('ADMIN_PASSWORD', 'Admin@1234')
    email = os.environ.get('ADMIN_EMAIL', 'superadmin@gmail.com')

    if User.objects.filter(username=username).exists():
        return

    User.objects.create(
        username=username,
        email=email,
        password=make_password(password),
        first_name='Admin',
        is_staff=True,
        is_superuser=True,
        is_active=True,
    )


def remove_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    User.objects.filter(username=os.environ.get('ADMIN_USERNAME', 'SuperAdmin')).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0027_dataperson_owner'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(create_admin, remove_admin),
    ]

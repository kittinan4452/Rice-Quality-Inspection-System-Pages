import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def backfill_owner(apps, schema_editor):
    """เซ็ต owner ของรายการตรวจเดิม โดยจับคู่จาก username ที่เก็บไว้เป็น string"""
    Dataperson = apps.get_model('myapp', 'Dataperson')
    User = apps.get_model('auth', 'User')
    users = {u.username: u.id for u in User.objects.all()}
    for person in Dataperson.objects.all():
        owner_id = users.get(person.username)
        if owner_id:
            person.owner_id = owner_id
            person.save(update_fields=['owner'])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('myapp', '0026_alter_dataperson_username'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataperson',
            name='owner',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='inspections',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RunPython(backfill_owner, noop),
    ]

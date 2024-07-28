# Generated by Django 5.0 on 2024-01-23 13:41

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0015_data_size_data_type_alter_dataperson_image"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="dataperson",
            name="data",
        ),
        migrations.AddField(
            model_name="data_size",
            name="date_size",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name="data_type",
            name="date_type",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name="dataperson",
            name="date",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
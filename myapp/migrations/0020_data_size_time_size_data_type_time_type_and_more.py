# Generated by Django 5.0 on 2024-01-24 09:18

import datetime
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0019_alter_data_size_date_size_alter_data_type_date_type_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="data_size",
            name="time_size",
            field=models.TimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name="data_type",
            name="time_type",
            field=models.TimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name="dataperson",
            name="time",
            field=models.TimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name="data_size",
            name="date_size",
            field=models.DateField(default=datetime.date.today),
        ),
        migrations.AlterField(
            model_name="data_type",
            name="date_type",
            field=models.DateField(default=datetime.date.today),
        ),
        migrations.AlterField(
            model_name="dataperson",
            name="date",
            field=models.DateField(default=datetime.date.today),
        ),
    ]

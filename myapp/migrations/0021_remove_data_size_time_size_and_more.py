# Generated by Django 5.0 on 2024-01-24 10:00

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0020_data_size_time_size_data_type_time_type_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="data_size",
            name="time_size",
        ),
        migrations.RemoveField(
            model_name="data_type",
            name="time_type",
        ),
        migrations.RemoveField(
            model_name="dataperson",
            name="time",
        ),
        migrations.AlterField(
            model_name="data_size",
            name="date_size",
            field=models.DateTimeField(default="2024-01-24 17-00-53"),
        ),
        migrations.AlterField(
            model_name="data_type",
            name="date_type",
            field=models.DateTimeField(default="2024-01-24 17-00-53"),
        ),
        migrations.AlterField(
            model_name="dataperson",
            name="date",
            field=models.DateTimeField(default="2024-01-24 17-00-53"),
        ),
    ]

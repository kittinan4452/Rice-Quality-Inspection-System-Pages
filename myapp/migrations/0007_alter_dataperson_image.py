# Generated by Django 5.0 on 2023-12-24 18:52

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0006_alter_dataperson_image"),
    ]

    operations = [
        migrations.AlterField(
            model_name="dataperson",
            name="image",
            field=models.ImageField(
                blank=True, null=True, upload_to="myapp/static/upload"
            ),
        ),
    ]

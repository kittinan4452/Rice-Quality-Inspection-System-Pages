from django.db import models
from django.utils import timezone
from datetime import datetime


class Dataperson(models.Model):
    name = models.CharField(max_length=100)
    register = models.CharField(max_length=100)
    member = models.CharField(max_length=100)
    type_rice = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)
    user_name = models.CharField(max_length=100, default="Guest")
    username = models.CharField(max_length=50 ,default='Null')
    image = models.ImageField(upload_to="static/images",null=True, blank=True)
    
    
class Datauser(models.Model):
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    email = models.EmailField()
    username = models.CharField(max_length=50, unique=True)  # เพิ่มฟิลด์ username
    password = models.CharField(max_length=100)

class Data_size(models.Model):
    resultall_G = models.CharField(max_length=100)
    resultall_B = models.CharField(max_length=100)
    totalall = models.CharField(max_length=100)
    resultall_b1 = models.CharField(max_length=100)
    resultall_b2 = models.CharField(max_length=100)
    resultall_b3 = models.CharField(max_length=100)
    average_h = models.CharField(max_length=100)
    average_w = models.CharField(max_length=100)
    date_size = models.DateTimeField(auto_now_add=True)

class Data_type(models.Model):
    resultall_percent_G = models.CharField(max_length=100)
    resultall_percent_C = models.CharField(max_length=100)
    resultall_percent_B = models.CharField(max_length=100)
    resultall_percent_Y = models.CharField(max_length=100)
    resultall_percent_D = models.CharField(max_length=100, default='SOME STRING')
    image1 = models.ImageField(upload_to="static/images",null=True, blank=True)
    image2 = models.ImageField(upload_to="static/images",null=True, blank=True)
    image3 = models.ImageField(upload_to="static/images",null=True, blank=True)
    image4 = models.ImageField(upload_to="static/images",null=True, blank=True)
    image5 = models.ImageField(upload_to="static/images",null=True, blank=True)
    date_type = models.DateTimeField(auto_now_add=True)
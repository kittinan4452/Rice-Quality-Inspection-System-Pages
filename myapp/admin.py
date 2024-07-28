from django.contrib import admin
from myapp.models import Dataperson ,Datauser , Data_size, Data_type
# Register your models here.

admin.site.register(Dataperson)
admin.site.register(Datauser)
admin.site.register(Data_size)
admin.site.register(Data_type)

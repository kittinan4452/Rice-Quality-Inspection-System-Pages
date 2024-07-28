from django import forms  
from myapp.models import Dataperson #models.py
     
class Dataperson (forms.ModelForm):  
    class Meta:  
        model = Dataperson   
        fields = ('name','register','member','type_rice','data','image')
 
    
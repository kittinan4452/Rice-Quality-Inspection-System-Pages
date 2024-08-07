from django.urls import path
from myapp import views
from django.contrib.auth.views import (
    LogoutView, 
    PasswordResetView, 
    PasswordResetDoneView, 
    PasswordResetConfirmView,
    PasswordResetCompleteView
)
urlpatterns = [
    path('',views.index),
    path('AddData',views.AddData),
    path('showlist',views.showlist),
    path('loginuser',views.loginuser,name="loginuser"),
    path('singout',views.singout),
    path('registeruser',views.registeruser),
    path('showdata/<id_rice>',views.showdata),
    path('deletedata/<id_rice>',views.deletedata),

    #path('password-reset/', 
     #   PasswordResetView.as_view(
            
      #      html_email_template_name='password_reset_email.html'
      #  ),
       # name='password-reset'
    #),
    #path('password-reset/done/', PasswordResetDoneView.as_view(template_name='password_reset_done.html'),name='password_reset_done'),
    #path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(template_name='password_reset_confirm.html'),name='password_reset_confirm'),
    #path('password-reset-complete/',PasswordResetCompleteView.as_view(template_name='password_reset_complete.html'),name='password_reset_complete'),
    
]
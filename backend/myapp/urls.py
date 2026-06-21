from django.urls import path
from .views import (
    LoginView, RegisterView, MeView,
    InspectionListView, InspectionDetailView, TaskStatusView,
    PasswordResetRequestView, PasswordResetConfirmView,
    AdminStatsView, AdminUserListView, AdminUserDetailView,
)

urlpatterns = [
    path('auth/login/', LoginView.as_view()),
    path('auth/register/', RegisterView.as_view()),
    path('auth/me/', MeView.as_view()),
    path('auth/password-reset/', PasswordResetRequestView.as_view()),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view()),
    path('inspections/', InspectionListView.as_view()),
    path('inspections/task/<str:task_id>/', TaskStatusView.as_view()),
    path('inspections/<int:pk>/', InspectionDetailView.as_view()),
    path('admin/stats/', AdminStatsView.as_view()),
    path('admin/users/', AdminUserListView.as_view()),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view()),
]

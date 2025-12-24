from django.urls import path
from .api_views import (
    health_check,
    login_view, register_view, logout_view, me_view,
    inspection_list, inspection_detail, inspection_create, inspection_delete
)

urlpatterns = [
    # Health check endpoint
    path('health/', health_check, name='api-health'),

    # Auth endpoints
    path('auth/login/', login_view, name='api-login'),
    path('auth/register/', register_view, name='api-register'),
    path('auth/logout/', logout_view, name='api-logout'),
    path('auth/me/', me_view, name='api-me'),

    # Inspection endpoints
    path('inspections/', inspection_list, name='api-inspections'),
    path('inspections/create/', inspection_create, name='api-inspection-create'),
    path('inspections/<int:pk>/', inspection_detail, name='api-inspection-detail'),
    path('inspections/<int:pk>/delete/', inspection_delete, name='api-inspection-delete'),
]

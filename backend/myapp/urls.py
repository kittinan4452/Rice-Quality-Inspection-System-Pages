from django.urls import path
from .views import LoginView, RegisterView, MeView, InspectionListView, InspectionDetailView

urlpatterns = [
    path('auth/login/', LoginView.as_view()),
    path('auth/register/', RegisterView.as_view()),
    path('auth/me/', MeView.as_view()),
    path('inspections/', InspectionListView.as_view()),
    path('inspections/<int:pk>/', InspectionDetailView.as_view()),
]

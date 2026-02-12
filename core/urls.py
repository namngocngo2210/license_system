from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import LogoutView, LoginView

urlpatterns = [
    path('login/', LoginView.as_view(), name='api_token_auth'),
    path('logout/', LogoutView.as_view(), name='api_token_logout'),
]

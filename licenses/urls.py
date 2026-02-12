from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LicenseCategoryViewSet, LicenseViewSet, ActivateLicenseView, CheckLicenseView, DashboardStatsView

router = DefaultRouter()
router.register(r'categories', LicenseCategoryViewSet, basename='licensecategory')
router.register(r'items', LicenseViewSet, basename='license')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('activate/', ActivateLicenseView.as_view(), name='activate-license'),
    path('check/', CheckLicenseView.as_view(), name='check-license'),
]

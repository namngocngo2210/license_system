from django.db.models import Count, Avg
from django.db.models.functions import TruncDate
from rest_framework import viewsets, status, views, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import LicenseCategory, License, RequestLog
from .serializers import LicenseCategorySerializer, LicenseSerializer

class LicenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = LicenseCategory.objects.filter(is_deleted=False)
    serializer_class = LicenseCategorySerializer
    pagination_class = None

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class LicenseViewSet(viewsets.ModelViewSet):
    queryset = License.objects.filter(is_deleted=False).order_by('-created_at')
    serializer_class = LicenseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'is_used']
    search_fields = ['key', 'device_id']
    ordering_fields = ['created_at', 'updated_at']

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class DashboardStatsView(views.APIView):
    def get(self, request):
        # Requests per day (last 7 days)
        daily_requests = RequestLog.objects.annotate(
            date=TruncDate('timestamp')
        ).values('date').annotate(
            count=Count('id'),
            avg_time=Avg('response_time')
        ).order_by('date')[:7]

        # Keys per category
        category_stats = License.objects.filter(is_deleted=False).values(
            'category__name'
        ).annotate(
            count=Count('id')
        )

        return Response({
            'daily_requests': daily_requests,
            'category_stats': category_stats,
            'overall': {
                'total_licenses': License.objects.filter(is_deleted=False).count(),
                'active_licenses': License.objects.filter(is_deleted=False, is_active=True).count(),
                'used_licenses': License.objects.filter(is_deleted=False, is_used=True).count(),
                'avg_response_time': RequestLog.objects.aggregate(Avg('response_time'))['response_time__avg'] or 0
            }
        })

class ActivateLicenseView(views.APIView):
# ... existing code ...
    authentication_classes = [] # Allow public access if needed for device activation
    permission_classes = []

    def post(self, request):
        key = request.data.get('key')
        device_id = request.data.get('device_id')

        if not key or not device_id:
            return Response({'error': 'Key and device_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            license_obj = License.objects.get(key=key, is_deleted=False)
        except License.DoesNotExist:
            return Response({'error': 'Invalid license key'}, status=status.HTTP_404_NOT_FOUND)

        if not license_obj.is_active:
             return Response({'error': 'License is inactive'}, status=status.HTTP_403_FORBIDDEN)

        if license_obj.is_used:
            if license_obj.device_id == device_id:
                return Response({'message': 'License already active for this device', 'valid': True})
            else:
                return Response({'error': 'License already used on another device'}, status=status.HTTP_403_FORBIDDEN)

        # Activate
        license_obj.device_id = device_id
        license_obj.is_used = True
        license_obj.save()

        return Response({'message': 'License activated successfully', 'valid': True})

class CheckLicenseView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        device_id = request.query_params.get('device_id')
        if not device_id:
             return Response({'error': 'device_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            license_obj = License.objects.get(device_id=device_id, is_deleted=False, is_active=True)
            return Response({'valid': True, 'license': license_obj.key})
        except License.DoesNotExist:
            return Response({'valid': False}, status=status.HTTP_404_NOT_FOUND)

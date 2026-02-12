from rest_framework import serializers
from .models import LicenseCategory, License

class LicenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LicenseCategory
        fields = '__all__'

class LicenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    key = serializers.CharField(read_only=True)
    
    class Meta:
        model = License
        fields = '__all__'

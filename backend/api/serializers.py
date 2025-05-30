from rest_framework import serializers
from .models import SearchHistory
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        extra_kwargs = {'password': {'write_only': True}}

class SearchHistorySerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    searched_at = serializers.DateTimeField(source='timestamp')
    
    class Meta:
        model = SearchHistory
        fields = ['id', 'city', 'country', 'searched_at', 'temperature', 'weather_description', 'username']
    
    def get_username(self, obj):
        return obj.user.username 
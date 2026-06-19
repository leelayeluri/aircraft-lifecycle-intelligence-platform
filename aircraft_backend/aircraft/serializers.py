from rest_framework import serializers
from .models import AircraftSearch

class AircraftSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = AircraftSearch
        fields = '__all__'
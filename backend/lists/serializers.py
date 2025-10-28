from rest_framework import serializers
from tasks.serializers import TaskSerializer
from .models import List

class ListSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    class Meta:
        model = List
        fields = ["id", "public_token", "name", "description", "priority", "created_at", "updated_at", "tasks"]
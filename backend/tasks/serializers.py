from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["name", "description", "level", "priority", "done", "due_at", "created_at", "updated_at", "list", "parent"]
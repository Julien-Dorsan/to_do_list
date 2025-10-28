from rest_framework import viewsets
from tasks.models import Task
from tasks.serializers import TaskSerializer
from lists.models import List
from lists.serializers import ListSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class ListViewSet(viewsets.ModelViewSet):
    queryset = List.objects.all()
    serializer_class = ListSerializer
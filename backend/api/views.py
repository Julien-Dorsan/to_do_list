from rest_framework import viewsets
from tasks.models import Task
from tasks.serializers import TaskSerializer
from lists.models import List
from lists.serializers import ListSerializer
from categories.models import Category
from categories.serializers import CategorySerializer
from django.db.models import Prefetch

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class ListViewSet(viewsets.ModelViewSet):
    serializer_class = ListSerializer
    lookup_field = "public_token"
    lookup_url_kwarg = "token"
    queryset = List.objects.all().prefetch_related(
        Prefetch(
            "tasks",
            queryset=Task.objects.order_by("done", "-priority", "due_at")
        )
    )
    
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
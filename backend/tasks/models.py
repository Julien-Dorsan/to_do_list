from django.db import models
class Task(models.Model):
        name = models.CharField(max_length=30, null=False, unique=True)
        description = models.CharField(max_length=200)
        level = models.SmallIntegerField(default=0)
        priority = models.SmallIntegerField(default=3)
        done = models.BooleanField(default=False)
        due_at = models.DateTimeField()
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        
        # foreign keys
        list = models.ForeignKey("lists.List", verbose_name="Task lists", on_delete=models.CASCADE, null=False)
        parent = models.ForeignKey("self", verbose_name="Parent task", on_delete=models.CASCADE, related_name="subtasks", null=True, blank=True)
        categories = models.ManyToManyField("categories.Category", related_name="tasks", blank=True)
        
        def __str__(self):
                return self.name
from django.db import models

class Category(models.Model):
        name = models.CharField(max_length=30, null=False, unique=True)
        description = models.CharField(max_length=200)
        color = models.CharField(max_length=7)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        
        # foreign keys
        task = models.ForeignKey("tasks.Task", verbose_name="Task categories", on_delete=models.CASCADE, null=False)
        
        def __str__(self):
                return self.name
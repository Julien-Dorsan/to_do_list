from django.db import models

class Category(models.Model):
        name = models.CharField(max_length=30, null=False, unique=True)
        description = models.CharField(max_length=200)
        color = models.CharField(max_length=7)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        
        def __str__(self):
                return self.name
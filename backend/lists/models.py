from django.db import models

class List(models.Model):
        public_token = models.CharField(max_length=30, unique=True, null=False)
        name = models.CharField(max_length=30, null=False)
        description = models.CharField(max_length=200)
        priority = models.SmallIntegerField(default=3)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        
        # foreign keys
        # TODO user ?
        
        def __str__(self):
            return self.name
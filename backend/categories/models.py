from django.db import models
from django.core.validators import RegexValidator

color_validator = RegexValidator(
    regex=r"^#[0-9A-Fa-f]{6}$",
    message="Color must be hex format (#RRGGBB)."
)
class Category(models.Model):
        name = models.CharField(max_length=30, null=False, unique=True)
        description = models.CharField(max_length=200)
        color = models.CharField(max_length=7, validators=[color_validator])
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        
        def __str__(self):
                return self.name
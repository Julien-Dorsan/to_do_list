from django.db import models, IntegrityError, transaction
import secrets

def generate_public_token():
    """generates a crytpographically secure token safe to use in urls

    Returns:
        str : a (pretty much) unique token
    """
    return secrets.token_urlsafe(22)

class List(models.Model):
    try :
        public_token = models.CharField(
        max_length=30,
        unique=True,
        null=False,
        editable=False,
        default=generate_public_token,
        )
    # lazy retry clause but it's fine with the odds of a collision happning
    except:
        public_token = models.CharField(
        max_length=30,
        unique=True,
        null=False,
        editable=False,
        default=generate_public_token,
        )
    name = models.CharField(max_length=30, null=False)
    description = models.CharField(max_length=200)
    priority = models.SmallIntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # foreign keys
    # TODO user ?

    def __str__(self):
        return self.name

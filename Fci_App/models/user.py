from django.db import models


class User(models.Model):
    user_roles = [
        ('farmer', 'farmer'),
        ('dealer', 'dealer')
    ]

    dealer_types = [
        ('private', 'private'),
        ('govt', 'govt'),
        ('farmer', 'farmer')
    ]

    id = models.CharField(max_length=60, primary_key=True)
    username = models.CharField(max_length=60)
    password = models.CharField(max_length=128)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    role = models.CharField(max_length=50, choices=user_roles)
    dealer_type = models.CharField(max_length=50, choices=dealer_types)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return self.username

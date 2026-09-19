from django.db import models
from django.utils import timezone
from .user import User

class Crop_register(models.Model):
    REGISTER_OPTIONS = [
        ('p', 'private'),
        ('g', 'govt'),
        ('b', 'both'),
    ]

    GRADE_CHOICES = [
        ('A', 'Grade A (FAQ Premium +5%)'),
        ('B', 'Grade B (Standard FAQ)'),
        ('C', 'Grade C (Below Standard -10%)'),
    ]

    farmer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='crop_registered'
    )
    name = models.CharField(max_length=60, db_index=True)
    quantity = models.IntegerField(help_text="Quantity in kg")
    farmer_city = models.CharField(max_length=100, db_index=True)
    farmer_name = models.CharField(max_length=60)
    dealer_type = models.CharField(max_length=10, choices=REGISTER_OPTIONS)
    grade = models.CharField(max_length=10, choices=GRADE_CHOICES, default='B')
    moisture_pct = models.FloatField(default=12.0, help_text="Harvest moisture percentage (standard 12-14%)")
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['farmer_city', 'dealer_type']),
            models.Index(fields=['name']),
            models.Index(fields=['farmer']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Listing: {self.name} - {self.quantity}kg by {self.farmer_name} in {self.farmer_city}"

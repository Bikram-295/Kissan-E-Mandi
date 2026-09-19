from django.db import models

class Crop(models.Model):
    name = models.CharField(max_length=60, unique=True)
    msp = models.IntegerField(help_text="Government Minimum Support Price in INR per kg")

    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f"{self.name} (MSP: ₹{self.msp}/kg)"

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from Fci_App.serializers.crop import CropSerializer
from Fci_App.models.crop import Crop


class CropViewSet(viewsets.ModelViewSet):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [IsAuthenticated]

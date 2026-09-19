from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from Fci_App.serializers.crop_register import Crop_registerSerializer
from Fci_App.models.crop_register import Crop_register


class Crop_registerViewSet(viewsets.ModelViewSet):
    """
    Optimized Crop Listing ViewSet:
    - Uses select_related('farmer') to eliminate N+1 queries when fetching listing author details
    - Provides server-side filtering by city, crop name, and dealer type to optimize network payload
    """
    queryset = Crop_register.objects.select_related('farmer').all()
    serializer_class = Crop_registerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        city = self.request.query_params.get('city') or self.request.query_params.get('farmer_city')
        farmer_id = self.request.query_params.get('farmer')
        crop_name = self.request.query_params.get('name')
        dealer_type = self.request.query_params.get('dealer_type')

        if city:
            qs = qs.filter(farmer_city__iexact=city)
        if farmer_id:
            qs = qs.filter(farmer_id=farmer_id)
        if crop_name:
            qs = qs.filter(name__icontains=crop_name)
        if dealer_type:
            qs = qs.filter(dealer_type=dealer_type)

        return qs

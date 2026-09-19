from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from Fci_App.serializers.user import UserSerializer
from Fci_App.models.user import User


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

from django.contrib.auth.hashers import check_password, make_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from Fci_App.models.user import User


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        user_id = request.data.get('id')
        passwd = request.data.get('password')
        if not user_id or not passwd:
            return Response(
                {"status": "error", "message": "ID and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            usr = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"status": "error", "message": "User does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if check_password(passwd, usr.password):
            pass
        elif usr.password == passwd:
            usr.password = make_password(passwd)
            usr.save(update_fields=['password'])
        else:
            return Response(
                {"status": "error", "message": "Password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refresh = RefreshToken.for_user(usr)
        return Response(
            {
                "status": "success",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "id": usr.id,
                "username": usr.username,
                "dealer_type": usr.dealer_type,
                "role": usr.role,
                "city": usr.city,
                "state": usr.state,
            },
            status=status.HTTP_200_OK,
        )

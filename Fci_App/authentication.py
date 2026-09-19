from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

from Fci_App.models.user import User


class KisaanJWTAuthentication(BaseAuthentication):
    """Authenticate requests with a Bearer access token against the custom User model."""

    def authenticate(self, request):
        header = request.headers.get("Authorization")
        if not header:
            return None

        parts = header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None

        raw_token = parts[1]
        try:
            token = AccessToken(raw_token)
            user_id = token.get("user_id")
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")
        except (InvalidToken, TokenError, KeyError):
            raise AuthenticationFailed("Invalid or expired token")

        return (user, token)

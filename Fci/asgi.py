"""
ASGI config for Fci project.

Exposes the ASGI callable as a module-level variable named ``application``.
Supports both standard HTTP traffic and WebSockets for real-time
transaction lifecycle updates via Django Channels and Daphne.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Fci.settings")

# Initialize Django ASGI application early to ensure the AppRegistry is populated
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import Fci_App.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            Fci_App.routing.websocket_urlpatterns
        )
    ),
})

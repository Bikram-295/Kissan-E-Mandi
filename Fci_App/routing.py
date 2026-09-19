from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"^ws/transactions/(?P<user_id>[\w-]+)/$", consumers.TransactionLifecycleConsumer.as_asgi()),
    re_path(r"^ws/lifecycle/(?P<transaction_id>\d+)/$", consumers.TransactionLifecycleConsumer.as_asgi()),
    re_path(r"^ws/marketplace/$", consumers.TransactionLifecycleConsumer.as_asgi()),
]

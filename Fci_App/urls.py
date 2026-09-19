from django.urls import include, path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView
from Fci_App.views.auth import LoginView
from Fci_App.views.crop import CropViewSet
from Fci_App.views.user import UserViewSet
from Fci_App.views.crop_register import Crop_registerViewSet
from Fci_App.views.transaction import TransactionViewSet, TransactionReadOnlyViewSet
from Fci_App.views.msp_valuation import MSPValuationView

router = routers.DefaultRouter()
router.register('users', UserViewSet)
router.register('crops', CropViewSet)
router.register('crop_registers', Crop_registerViewSet)
router.register('transactions', TransactionViewSet)
router.register('readonly', TransactionReadOnlyViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('msp-valuation/evaluate/', MSPValuationView.as_view(), name='msp_valuation_evaluate'),
    path('msp-valuation/', MSPValuationView.as_view(), name='msp_valuation_root'),
    path('auth/', include('rest_framework.urls')),
]

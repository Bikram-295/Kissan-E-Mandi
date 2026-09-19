import logging
from django.db import transaction as db_transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from Fci_App.serializers.transaction import TransactionSerializer, TransactionVerboseSerializer
from Fci_App.models.transaction import Transaction

logger = logging.getLogger(__name__)


def broadcast_transaction_event(event_type: str, transaction_instance: Transaction):
    """
    Helper function to broadcast real-time transaction lifecycle events
    over Django Channels to subscribed WebSockets.
    """
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        # Serialize full verbose data for real-time frontend consumers
        serialized_data = TransactionVerboseSerializer(transaction_instance).data
        payload = {
            "type": "transaction_status_changed",
            "data": {
                "event": event_type,
                "transaction": serialized_data,
                "stage": transaction_instance.stage_number,
                "progress": transaction_instance.progress_percentage,
                "status": transaction_instance.status,
            }
        }

        # 1. Notify farmer's channel
        farmer_id = transaction_instance.farmer.id
        async_to_sync(channel_layer.group_send)(
            f"user_transactions_{farmer_id}", payload
        )

        # 2. Notify dealer's channel
        dealer_id = transaction_instance.dealer.id
        async_to_sync(channel_layer.group_send)(
            f"user_transactions_{dealer_id}", payload
        )

        # 3. Notify dedicated deal lifecycle room
        async_to_sync(channel_layer.group_send)(
            f"lifecycle_{transaction_instance.id}", payload
        )

        # 4. Notify global marketplace feed
        async_to_sync(channel_layer.group_send)(
            "marketplace_updates", payload
        )
    except Exception as e:
        logger.warning(f"Failed to broadcast WebSocket event: {e}")


class TransactionViewSet(viewsets.ModelViewSet):
    """
    Transactional ViewSet optimized for PostgreSQL:
    - Eliminates N+1 queries using select_related()
    - Implements concurrency-safe state transitions using select_for_update() inside atomic transactions
    - Dispatches real-time WebSocket lifecycle updates
    """
    queryset = Transaction.objects.select_related(
        'farmer', 'dealer', 'crop_register', 'crop_register__farmer'
    ).all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        farmer_id = self.request.query_params.get('farmer')
        dealer_id = self.request.query_params.get('dealer')
        status_filter = self.request.query_params.get('status')
        if farmer_id:
            qs = qs.filter(farmer_id=farmer_id)
        if dealer_id:
            qs = qs.filter(dealer_id=dealer_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        instance = serializer.save()
        broadcast_transaction_event("offer_created", instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        broadcast_transaction_event("status_updated", instance)

    @action(detail=True, methods=['post'], url_path='transition')
    def transition(self, request, pk=None):
        """
        Concurrency-safe transition endpoint:
        POST /fci/transactions/<id>/transition/ {"status": "deal_done"}
        Validates against the 6-stage lifecycle finite state machine.
        """
        target_status = request.data.get('status')
        if not target_status:
            return Response(
                {"error": "Field 'status' is required for lifecycle transition."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with db_transaction.atomic():
            # Concurrency row-locking prevents race conditions during simultaneous transitions
            try:
                tx = Transaction.objects.select_for_update().select_related(
                    'farmer', 'dealer', 'crop_register'
                ).get(pk=pk)
            except Transaction.DoesNotExist:
                return Response(
                    {"error": "Transaction not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            if not tx.can_transition_to(target_status):
                current_state = tx.status
                allowed = tx.ALLOWED_TRANSITIONS.get(current_state, [])
                return Response(
                    {
                        "error": (
                            f"Invalid transition from '{current_state}' to '{target_status}'. "
                            f"6-Stage Lifecycle flow: Pending -> Deal Done -> Dispatched -> Delivered -> Inspected -> Payment Done."
                        ),
                        "current_status": current_state,
                        "allowed_transitions": allowed,
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            old_status = tx.status
            tx.status = target_status
            tx.save(update_fields=['status', 'updated_at'])

        broadcast_transaction_event("stage_transitioned", tx)

        return Response(
            {
                "status": "success",
                "message": f"Transitioned deal #{tx.id} from '{old_status}' to '{tx.status}'.",
                "data": TransactionVerboseSerializer(tx).data,
            },
            status=status.HTTP_200_OK
        )


class TransactionReadOnlyViewSet(viewsets.ModelViewSet):
    """
    Optimized Read-Only ViewSet with nested user/crop information.
    Uses select_related to execute in a single low-latency query.
    """
    queryset = Transaction.objects.select_related(
        'farmer', 'dealer', 'crop_register', 'crop_register__farmer'
    ).all()
    serializer_class = TransactionVerboseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        farmer_id = self.request.query_params.get('farmer')
        dealer_id = self.request.query_params.get('dealer')
        status_filter = self.request.query_params.get('status')
        if farmer_id:
            qs = qs.filter(farmer_id=farmer_id)
        if dealer_id:
            qs = qs.filter(dealer_id=dealer_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

import json
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer

logger = logging.getLogger(__name__)


class TransactionLifecycleConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer managing real-time notifications for the 6-stage
    transaction lifecycle:
      Pending -> Deal Done -> Dispatched -> Delivered -> Inspected -> Payment Done
    """

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs'].get('user_id')
        self.transaction_id = self.scope['url_route']['kwargs'].get('transaction_id')
        self.groups_joined = []

        if self.user_id:
            self.user_group_name = f"user_transactions_{self.user_id}"
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )
            self.groups_joined.append(self.user_group_name)

        if self.transaction_id:
            self.lifecycle_group_name = f"lifecycle_{self.transaction_id}"
            await self.channel_layer.group_add(
                self.lifecycle_group_name,
                self.channel_name
            )
            self.groups_joined.append(self.lifecycle_group_name)

        # Always subscribe to global marketplace events
        self.global_group_name = "marketplace_updates"
        await self.channel_layer.group_add(
            self.global_group_name,
            self.channel_name
        )
        self.groups_joined.append(self.global_group_name)

        await self.accept()
        logger.info(f"WebSocket connected: user={self.user_id}, transaction={self.transaction_id}")
        await self.send_json({
            "type": "connection_established",
            "message": "Connected to Kisaan-E-Mandi Real-Time Lifecycle Channel",
            "user_id": self.user_id,
            "transaction_id": self.transaction_id,
        })

    async def disconnect(self, close_code):
        for group in self.groups_joined:
            await self.channel_layer.group_discard(
                group,
                self.channel_name
            )
        logger.info(f"WebSocket disconnected (code={close_code}): groups={self.groups_joined}")

    async def receive_json(self, content):
        """
        Handle incoming WebSocket messages from client.
        """
        action = content.get("action")
        if action == "ping":
            await self.send_json({"type": "pong"})
        elif action == "subscribe_transaction":
            tx_id = content.get("transaction_id")
            if tx_id:
                group_name = f"lifecycle_{tx_id}"
                await self.channel_layer.group_add(group_name, self.channel_name)
                self.groups_joined.append(group_name)
                await self.send_json({
                    "type": "subscribed",
                    "transaction_id": tx_id
                })

    # Handler for transaction status changes
    async def transaction_status_changed(self, event):
        await self.send_json({
            "type": "transaction_status_changed",
            "data": event["data"]
        })

    # Handler for new offer notifications
    async def new_offer_created(self, event):
        await self.send_json({
            "type": "new_offer_created",
            "data": event["data"]
        })

    # Handler for general lifecycle updates
    async def lifecycle_update(self, event):
        await self.send_json({
            "type": "lifecycle_update",
            "data": event["data"]
        })

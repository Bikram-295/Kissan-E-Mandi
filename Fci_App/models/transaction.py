from django.db import models
from django.utils import timezone
from .user import User
from .crop_register import Crop_register


class Transaction(models.Model):
    """
    Represents an agricultural trade agreement governed by a 6-Stage
    Transaction Lifecycle Management System:
      Stage 1: Pending (Offer placed, awaiting farmer response)
      Stage 2: Deal Done (Terms locked, binding contract agreed)
      Stage 3: Dispatched (Crops loaded & in transit to mandi)
      Stage 4: Delivered (Arrived at buyer's warehouse/mandi)
      Stage 5: Inspected (Quality & moisture verified against MSP standards)
      Stage 6: Payment Done (Settlement released, transaction closed)
    Terminal Exception State:
      Rejected (Offer rejected or deal cancelled)
    """

    STAGE_PENDING = 'pending'
    STAGE_DEAL_DONE = 'deal_done'
    STAGE_DISPATCHED = 'dispatched'
    STAGE_DELIVERED = 'delivered'
    STAGE_INSPECTED = 'inspected'
    STAGE_PAYMENT_DONE = 'payment_done'
    STAGE_REJECTED = 'rejected'
    STAGE_WAITING = 'waiting_for_farmer'  # backward compatibility alias

    STATUS_CHOICES = [
        (STAGE_PENDING, 'Pending'),
        (STAGE_DEAL_DONE, 'Deal Done'),
        (STAGE_DISPATCHED, 'Dispatched'),
        (STAGE_DELIVERED, 'Delivered'),
        (STAGE_INSPECTED, 'Inspected'),
        (STAGE_PAYMENT_DONE, 'Payment Done'),
        (STAGE_REJECTED, 'Rejected'),
        (STAGE_WAITING, 'Waiting for Farmer'),
    ]

    LIFECYCLE_STAGES = [
        STAGE_PENDING,
        STAGE_DEAL_DONE,
        STAGE_DISPATCHED,
        STAGE_DELIVERED,
        STAGE_INSPECTED,
        STAGE_PAYMENT_DONE,
    ]

    ALLOWED_TRANSITIONS = {
        STAGE_PENDING: [STAGE_DEAL_DONE, STAGE_REJECTED],
        STAGE_WAITING: [STAGE_DEAL_DONE, STAGE_REJECTED],
        STAGE_DEAL_DONE: [STAGE_DISPATCHED, STAGE_REJECTED],
        STAGE_DISPATCHED: [STAGE_DELIVERED],
        STAGE_DELIVERED: [STAGE_INSPECTED],
        STAGE_INSPECTED: [STAGE_PAYMENT_DONE],
        STAGE_PAYMENT_DONE: [],
        STAGE_REJECTED: [],
    }

    farmer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='transactions_as_farmer'
    )
    dealer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='transactions_as_dealer'
    )
    status = models.CharField(
        max_length=30, choices=STATUS_CHOICES, default=STAGE_PENDING, db_index=True
    )
    price = models.IntegerField(help_text="Agreed/Offered price per kg in INR")
    crop_register = models.ForeignKey(
        Crop_register, on_delete=models.CASCADE, related_name='transactions'
    )
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['farmer', 'status']),
            models.Index(fields=['dealer', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

    def can_transition_to(self, target_status):
        """
        Validate state machine transition rule.
        """
        # Treat waiting_for_farmer as pending
        current = STAGE_PENDING if self.status == self.STAGE_WAITING else self.status
        allowed = self.ALLOWED_TRANSITIONS.get(current, [])
        return target_status in allowed

    @property
    def stage_number(self):
        normalized = STAGE_PENDING if self.status == self.STAGE_WAITING else self.status
        if normalized in self.LIFECYCLE_STAGES:
            return self.LIFECYCLE_STAGES.index(normalized) + 1
        return 0

    @property
    def progress_percentage(self):
        num = self.stage_number
        if num > 0:
            return round((num / len(self.LIFECYCLE_STAGES)) * 100)
        return 0

    def __str__(self):
        return (
            f"Transaction #{self.pk}: {self.crop_register.name} | "
            f"Farmer: {self.farmer.username} -> Dealer: {self.dealer.username} | "
            f"Status: {self.status} (Stage {self.stage_number}/6)"
        )

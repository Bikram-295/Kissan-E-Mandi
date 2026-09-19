from rest_framework import serializers
from Fci_App.models.transaction import Transaction
from Fci_App.serializers import UserSerializer, Crop_registerSerializer


class TransactionSerializer(serializers.ModelSerializer):
    stage_number = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'


class TransactionVerboseSerializer(serializers.ModelSerializer):
    dealer = UserSerializer(read_only=True)
    farmer = UserSerializer(read_only=True)
    crop_register = Crop_registerSerializer(read_only=True)
    stage_number = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'dealer', 'farmer', 'status', 'price',
            'crop_register', 'created_at', 'stage_number', 'progress_percentage'
        ]
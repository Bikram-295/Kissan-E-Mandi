from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from Fci_App.services.msp_engine import MSPValuationEngine
from Fci_App.models.crop import Crop


class MSPValuationView(APIView):
    """
    API endpoint for automated MSP (Minimum Support Price) Valuation Engine.
    Provides transparent pricing estimates and validates trade offers against
    official government MSP standards.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """
        Quick evaluation via GET query parameters:
        ?crop=Wheat&quantity=500&grade=A&moisture=13.5&offered_price=24
        """
        crop_name = request.query_params.get('crop') or request.query_params.get('crop_id')
        if not crop_name:
            # If no crop param, return master list of MSP baselines
            crops = Crop.objects.all().values('id', 'name', 'msp')
            return Response({
                "message": "MSP Valuation Engine API active. Specify ?crop=<name>&quantity=<kg> to evaluate.",
                "available_crops": list(crops),
            })

        try:
            quantity = float(request.query_params.get('quantity', 100))
            grade = request.query_params.get('grade', 'B')
            moisture = float(request.query_params.get('moisture', 12.0))
            region = request.query_params.get('region', 'default')
            offered = request.query_params.get('offered_price')
            offered_price = float(offered) if offered else None

            report = MSPValuationEngine.calculate_valuation(
                crop_identifier=crop_name,
                quantity=quantity,
                grade=grade,
                moisture_pct=moisture,
                region_type=region,
                offered_price=offered_price,
            )
            return Response(report, status=status.HTTP_200_OK)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Evaluation error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, *args, **kwargs):
        """
        Full evaluation via JSON payload:
        {
            "crop_id": 1,
            "crop_name": "Wheat",
            "quantity": 1000,
            "grade": "A",
            "moisture_pct": 13.0,
            "region_type": "default",
            "offered_price": 25.5
        }
        """
        data = request.data
        crop_id = data.get('crop_id') or data.get('crop') or data.get('crop_name')
        if not crop_id:
            return Response(
                {"error": "Field 'crop_id' or 'crop_name' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = float(data.get('quantity', 100))
            grade = data.get('grade', 'B')
            moisture = float(data.get('moisture_pct', data.get('moisture', 12.0)))
            region = data.get('region_type', 'default')
            offered = data.get('offered_price')
            offered_price = float(offered) if offered is not None else None

            report = MSPValuationEngine.calculate_valuation(
                crop_identifier=crop_id,
                quantity=quantity,
                grade=grade,
                moisture_pct=moisture,
                region_type=region,
                offered_price=offered_price,
            )
            return Response(report, status=status.HTTP_200_OK)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Evaluation error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

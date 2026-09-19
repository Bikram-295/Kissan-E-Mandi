"""
Automated MSP (Minimum Support Price) Valuation Engine
======================================================
Provides farmers and dealers with transparent, algorithmically verified
crop price estimates based on statutory government MSP benchmarks, quality
grading, moisture penalties, and regional mandi logistics factors.
"""

from decimal import Decimal
from typing import Dict, Any, Optional
from Fci_App.models.crop import Crop


class MSPValuationEngine:
    """
    Core valuation engine implementing fair pricing algorithms for agricultural
    commodities traded on Kisaan-E-Mandi.
    """

    # Grade multipliers (relative to Fair Average Quality baseline)
    GRADE_MULTIPLIERS = {
        'A': Decimal('0.05'),   # +5% Premium for Grade A (Export / Prime quality)
        'B': Decimal('0.00'),   # Standard Fair Average Quality (FAQ)
        'C': Decimal('-0.10'),  # -10% Deduction for Sub-Standard grain/broken kernels
    }

    # Standard safe storage moisture threshold (percentages)
    MOISTURE_BASE_THRESHOLD = Decimal('14.0')
    MOISTURE_PENALTY_PER_PCT = Decimal('0.01')  # 1% price deduction per 1% excess moisture

    # Standard regional transport/logistics variance estimates
    REGIONAL_LOGISTICS_VARIANCE = {
        'default': Decimal('0.00'),
        'remote': Decimal('-0.02'),   # -2% distance adjustment
        'metro': Decimal('0.03'),     # +3% metro terminal mandi premium
    }

    @classmethod
    def get_crop_baseline_msp(cls, crop_identifier: Any) -> Optional[Crop]:
        """
        Lookup statutory MSP from database by name or ID.
        """
        if isinstance(crop_identifier, int) or (isinstance(crop_identifier, str) and crop_identifier.isdigit()):
            return Crop.objects.filter(id=int(crop_identifier)).first()
        elif isinstance(crop_identifier, str):
            return Crop.objects.filter(name__iexact=crop_identifier.strip()).first()
        return None

    @classmethod
    def calculate_valuation(
        cls,
        crop_identifier: Any,
        quantity: float,
        grade: str = 'B',
        moisture_pct: float = 12.0,
        region_type: str = 'default',
        offered_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculates comprehensive valuation report for a crop lot.
        
        :param crop_identifier: Crop ID or Crop Name string
        :param quantity: Quantity in kilograms (kg)
        :param grade: 'A', 'B', or 'C'
        :param moisture_pct: Moisture percentage (e.g., 12.5)
        :param region_type: 'default', 'remote', or 'metro'
        :param offered_price: Optional buyer's offer price to compare against MSP
        :return: Dict containing price breakdowns, statutory floors, and recommendations
        """
        crop = cls.get_crop_baseline_msp(crop_identifier)
        if not crop:
            raise ValueError(f"Crop '{crop_identifier}' not found in official MSP database.")

        qty_dec = Decimal(str(max(1, quantity)))
        base_msp_per_kg = Decimal(str(crop.msp))
        grade_key = grade.upper() if grade else 'B'
        moisture_dec = Decimal(str(max(0.0, moisture_pct)))

        # 1. Statutory Base Value
        base_statutory_total = round(base_msp_per_kg * qty_dec, 2)

        # 2. Quality Grade Adjustment
        grade_pct = cls.GRADE_MULTIPLIERS.get(grade_key, Decimal('0.00'))
        grade_adjustment_per_kg = round(base_msp_per_kg * grade_pct, 2)

        # 3. Moisture Deduction (if moisture exceeds 14%)
        excess_moisture = max(Decimal('0.0'), moisture_dec - cls.MOISTURE_BASE_THRESHOLD)
        moisture_penalty_pct = excess_moisture * cls.MOISTURE_PENALTY_PER_PCT
        moisture_deduction_per_kg = round(base_msp_per_kg * moisture_penalty_pct, 2)

        # 4. Regional Logistics Factor
        region_pct = cls.REGIONAL_LOGISTICS_VARIANCE.get(region_type, Decimal('0.00'))
        logistics_adjustment_per_kg = round(base_msp_per_kg * region_pct, 2)

        # 5. Final Recommended Fair Price per KG
        net_adjustment_per_kg = grade_adjustment_per_kg - moisture_deduction_per_kg + logistics_adjustment_per_kg
        recommended_price_per_kg = max(
            round(base_msp_per_kg * Decimal('0.85'), 2), # Absolute floor guard
            round(base_msp_per_kg + net_adjustment_per_kg, 2)
        )
        total_estimated_valuation = round(recommended_price_per_kg * qty_dec, 2)

        # 6. Fair Market Pricing Band (Floor = Base MSP, Ceiling = Base MSP + 20%)
        fair_band_floor = base_msp_per_kg
        fair_band_ceiling = round(base_msp_per_kg * Decimal('1.20'), 2)

        # 7. Offer Evaluation (if offered_price provided)
        offer_analysis = None
        if offered_price is not None:
            offered_dec = Decimal(str(offered_price))
            variance_from_msp = offered_dec - base_msp_per_kg
            variance_pct = round((variance_from_msp / base_msp_per_kg) * 100, 1)

            if offered_dec < base_msp_per_kg:
                offer_status = "BELOW_MSP_FLOOR_ALERT"
                is_fair = False
                advice = (
                    f"Warning: Offered price ₹{offered_dec}/kg is below statutory MSP ₹{base_msp_per_kg}/kg "
                    f"({variance_pct}% deficit). Government mandi guidelines advise negotiating up."
                )
            elif offered_dec >= recommended_price_per_kg:
                offer_status = "PREMIUM_OFFER"
                is_fair = True
                advice = f"Favorable offer: Exceeds automated fair estimate of ₹{recommended_price_per_kg}/kg."
            else:
                offer_status = "FAIR_MSP_OFFER"
                is_fair = True
                advice = f"Acceptable offer: At or above statutory MSP baseline (₹{base_msp_per_kg}/kg)."

            offer_analysis = {
                "offered_price_per_kg": float(offered_dec),
                "total_offered_amount": float(round(offered_dec * qty_dec, 2)),
                "variance_from_msp_per_kg": float(variance_from_msp),
                "variance_percentage": float(variance_pct),
                "status": offer_status,
                "is_fair_deal": is_fair,
                "advice": advice,
            }

        return {
            "crop": {
                "id": crop.id,
                "name": crop.name,
                "official_msp_per_kg": float(base_msp_per_kg),
            },
            "quantity_kg": float(qty_dec),
            "quantity_quintals": float(round(qty_dec / Decimal('100'), 2)),
            "quality_parameters": {
                "grade": grade_key,
                "grade_premium_pct": float(grade_pct * 100),
                "moisture_percentage": float(moisture_dec),
                "excess_moisture": float(excess_moisture),
                "moisture_penalty_pct": float(moisture_penalty_pct * 100),
                "region_type": region_type,
            },
            "valuation_breakdown": {
                "base_msp_per_kg": float(base_msp_per_kg),
                "grade_adjustment_per_kg": float(grade_adjustment_per_kg),
                "moisture_deduction_per_kg": float(moisture_deduction_per_kg),
                "logistics_adjustment_per_kg": float(logistics_adjustment_per_kg),
                "recommended_price_per_kg": float(recommended_price_per_kg),
                "base_statutory_total": float(base_statutory_total),
                "total_estimated_valuation": float(total_estimated_valuation),
                "fair_price_band": {
                    "floor_price_per_kg": float(fair_band_floor),
                    "ceiling_price_per_kg": float(fair_band_ceiling),
                    "total_floor_amount": float(base_statutory_total),
                    "total_ceiling_amount": float(round(fair_band_ceiling * qty_dec, 2)),
                },
            },
            "offer_analysis": offer_analysis,
        }

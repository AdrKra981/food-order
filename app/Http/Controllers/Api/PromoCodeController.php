<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PromoCodeService;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    protected $promoCodeService;

    public function __construct(PromoCodeService $promoCodeService)
    {
        $this->promoCodeService = $promoCodeService;
    }

    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'restaurant_id' => 'required|exists:restaurants,id',
        ]);

        $userId = auth()->id();
        
        // Validate the promo code
        $validation = $this->promoCodeService->validatePromoCode(
            $request->code,
            $request->restaurant_id,
            $userId
        );

        if (!$validation['valid']) {
            return response()->json([
                'valid' => false,
                'message' => $validation['message']
            ], 422);
        }

        $promoCode = $validation['promo_code'];

        // Calculate discount for current cart
        $discountCalculation = $this->promoCodeService->calculateCartDiscount($promoCode, $userId);

        if (!$discountCalculation['valid']) {
            return response()->json([
                'valid' => false,
                'message' => $discountCalculation['message']
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'promo_code' => [
                'id' => $promoCode->id,
                'code' => $promoCode->code,
                'name' => $promoCode->name,
                'description' => $promoCode->description,
                'discount_type' => $promoCode->discount_type,
                'discount_value' => $promoCode->discount_value,
                'discount_label' => $promoCode->getDiscountTypeLabel(),
            ],
            'discount' => [
                'amount' => $discountCalculation['discount'],
                'applicable_amount' => $discountCalculation['applicable_amount'],
                'total_amount' => $discountCalculation['total_amount'],
                'final_amount' => $discountCalculation['total_amount'] - $discountCalculation['discount'],
            ]
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class PromoCodeApplicationController extends Controller
{
    public function apply(Request $request)
    {
        $data = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'promo_code' => 'required|string',
        ]);

        $order = Order::findOrFail($data['order_id']);
        $promo = PromoCode::where('code', $data['promo_code'])->first();
        if (! $promo || ! $promo->isValid()) {
            return response()->json(['message' => 'Invalid or expired promo code.'], 422);
        }
        if ($promo->minimum_order_amount && $order->total_amount < $promo->minimum_order_amount) {
            return response()->json(['message' => 'Order does not meet minimum amount for this promo code.'], 422);
        }
        if ($promo->isUsageLimitReached()) {
            return response()->json(['message' => 'Promo code usage limit reached.'], 422);
        }
        if (! $promo->canCustomerUse($order->user_id)) {
            return response()->json(['message' => 'You have already used this promo code the maximum number of times.'], 422);
        }
        $discount = $promo->calculateDiscount($order->total_amount);

        return response()->json([
            'discount' => (float) $discount,
            'message' => 'Promo code applied successfully.',
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;

class PromoCodeService
{
    public function validatePromoCode($code, $restaurantId, $userId)
    {
        $promoCode = PromoCode::where('code', $code)
            ->where('restaurant_id', $restaurantId)
            ->first();

        if (! $promoCode) {
            return ['valid' => false, 'message' => 'Promo code not found.'];
        }

        if (! $promoCode->isValid()) {
            return ['valid' => false, 'message' => 'Promo code is not valid or has expired.'];
        }

        if ($promoCode->isUsageLimitReached()) {
            return ['valid' => false, 'message' => 'Promo code usage limit has been reached.'];
        }

        if (! $promoCode->canCustomerUse($userId)) {
            return ['valid' => false, 'message' => 'You have reached the usage limit for this promo code.'];
        }

        return ['valid' => true, 'promo_code' => $promoCode];
    }

    public function calculateCartDiscount($promoCode, $userId)
    {
        $cartItems = CartItem::where('user_id', $userId)->with('menuItem.menuCategory')->get();

        if ($cartItems->isEmpty()) {
            return ['discount' => 0, 'applicable_amount' => 0];
        }

        $totalAmount = $cartItems->sum(function ($item) {
            return $item->quantity * $item->menuItem->price;
        });

        // Check minimum order amount
        if ($totalAmount < $promoCode->minimum_order_amount) {
            return [
                'valid' => false,
                'message' => 'Minimum order amount of $'.number_format($promoCode->minimum_order_amount, 2).' required.',
            ];
        }

        $applicableAmount = $this->calculateApplicableAmount($cartItems, $promoCode);
        $discount = $promoCode->calculateDiscount($totalAmount, $applicableAmount);

        return [
            'valid' => true,
            'discount' => $discount,
            'applicable_amount' => $applicableAmount,
            'total_amount' => $totalAmount,
        ];
    }

    private function calculateApplicableAmount($cartItems, $promoCode)
    {
        // If no categories specified, apply to entire order
        if (empty($promoCode->applicable_categories)) {
            return $cartItems->sum(function ($item) {
                return $item->quantity * $item->menuItem->price;
            });
        }

        // Calculate amount for items in applicable categories
        return $cartItems->sum(function ($item) use ($promoCode) {
            if (in_array($item->menuItem->menu_category_id, $promoCode->applicable_categories)) {
                return $item->quantity * $item->menuItem->price;
            }

            return 0;
        });
    }

    public function applyPromoCode($promoCode, $order, $discountAmount)
    {
        // Update order with promo code info
        $order->update([
            'promo_code_id' => $promoCode->id,
            'promo_code_used' => $promoCode->code,
            'discount_amount' => $discountAmount,
            'subtotal_amount' => $order->total_amount + $discountAmount,
        ]);

        // Create usage record
        PromoCodeUsage::create([
            'promo_code_id' => $promoCode->id,
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'discount_amount' => $discountAmount,
        ]);

        // Increment usage count
        $promoCode->incrementUsage();

        return $order;
    }
}

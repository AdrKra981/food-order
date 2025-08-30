<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\PromoCode;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 15, 100);
        $discountAmount = $this->faker->optional(0.3)->randomFloat(2, 2, 15);
        $totalAmount = $subtotal - ($discountAmount ?? 0);

        return [
            'user_id' => User::factory(),
            'restaurant_id' => Restaurant::factory(),
            'order_number' => 'FG' . date('Ymd') . str_pad($this->faker->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'total_amount' => $totalAmount,
            'subtotal_amount' => $subtotal,
            'discount_amount' => $discountAmount ?? 0,
            'status' => $this->faker->randomElement(OrderStatus::cases()),
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->safeEmail(),
            'customer_phone' => $this->faker->phoneNumber(),
            'delivery_type' => $this->faker->randomElement(['delivery', 'pickup']),
            'delivery_address' => $this->faker->address(),
            'payment_method' => $this->faker->randomElement(['card', 'cash', 'online']),
            'payment_status' => $this->faker->randomElement(['pending', 'completed', 'failed']),
            'payment_intent_id' => $this->faker->optional(0.5)->regexify('pi_[A-Za-z0-9]{24}'),
            'notes' => $this->faker->optional(0.4)->sentence(),
        ];
    }

    public function pending(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => OrderStatus::PENDING,
                'payment_status' => 'pending',
            ];
        });
    }

    public function confirmed(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => OrderStatus::CONFIRMED,
                'payment_status' => 'completed',
            ];
        });
    }

    public function preparing(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => OrderStatus::PREPARING,
                'payment_status' => 'completed',
            ];
        });
    }

    public function ready(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => OrderStatus::READY,
                'payment_status' => 'completed',
            ];
        });
    }

    public function delivered(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => OrderStatus::DELIVERED,
                'payment_status' => 'completed',
                'delivery_type' => 'delivery',
                'delivery_address' => $this->faker->address(),
            ];
        });
    }

    public function cancelled(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => OrderStatus::CANCELLED,
            ];
        });
    }

    public function delivery(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'delivery_type' => 'delivery',
                'delivery_address' => $this->faker->address(),
            ];
        });
    }

    public function pickup(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'delivery_type' => 'pickup',
                'delivery_address' => null,
            ];
        });
    }

    public function withPromoCode(): Factory
    {
        return $this->state(function (array $attributes) {
            $promoCode = PromoCode::factory()->create();
            $subtotal = $this->faker->randomFloat(2, 30, 100);
            $discountAmount = min($subtotal * 0.2, 15); // 20% discount, max $15
            
            return [
                'promo_code_id' => $promoCode->id,
                'promo_code_used' => $promoCode->code,
                'subtotal_amount' => $subtotal,
                'discount_amount' => $discountAmount,
                'total_amount' => $subtotal - $discountAmount,
            ];
        });
    }

    public function guest(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'user_id' => null,
                'customer_name' => $this->faker->name(),
                'customer_email' => $this->faker->safeEmail(),
                'customer_phone' => $this->faker->phoneNumber(),
            ];
        });
    }

    public function cashPayment(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'payment_method' => 'cash',
                'payment_status' => 'pending',
                'payment_intent_id' => null,
            ];
        });
    }

    public function cardPayment(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'payment_method' => 'card',
                'payment_status' => 'completed',
                'payment_intent_id' => 'pi_' . $this->faker->regexify('[A-Za-z0-9]{24}'),
            ];
        });
    }
}

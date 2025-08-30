<?php

namespace Database\Factories;

use App\Models\PromoCode;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

class PromoCodeFactory extends Factory
{
    protected $model = PromoCode::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'code' => strtoupper($this->faker->unique()->lexify('???###')),
            'name' => $this->faker->words(2, true) . ' Discount',
            'description' => $this->faker->sentence(),
            'discount_type' => $this->faker->randomElement(['percentage', 'fixed_amount']),
            'discount_value' => $this->faker->randomFloat(2, 5, 50),
            'minimum_order_amount' => $this->faker->randomFloat(2, 10, 100),
            'maximum_discount_amount' => $this->faker->optional(0.7)->randomFloat(2, 5, 25),
            'usage_limit_per_customer' => $this->faker->optional(0.6)->numberBetween(1, 5),
            'total_usage_limit' => $this->faker->optional(0.5)->numberBetween(10, 1000),
            'used_count' => 0,
            'applicable_categories' => $this->faker->optional(0.3)->randomElements([1, 2, 3, 4], $this->faker->numberBetween(1, 2)),
            'is_active' => $this->faker->boolean(80),
            'valid_from' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'valid_until' => $this->faker->dateTimeBetween('now', '+1 month'),
        ];
    }

    public function active(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => true,
            ];
        });
    }

    public function inactive(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    public function percentage(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'discount_type' => 'percentage',
                'discount_value' => $this->faker->randomFloat(2, 5, 50),
            ];
        });
    }

    public function fixed(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'discount_type' => 'fixed_amount',
                'discount_value' => $this->faker->randomFloat(2, 5, 25),
            ];
        });
    }

    public function expired(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'valid_from' => $this->faker->dateTimeBetween('-1 month', '-1 week'),
                'valid_until' => $this->faker->dateTimeBetween('-1 week', '-1 day'),
            ];
        });
    }

    public function future(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'valid_from' => $this->faker->dateTimeBetween('+1 day', '+1 week'),
                'valid_until' => $this->faker->dateTimeBetween('+1 week', '+1 month'),
            ];
        });
    }

    public function withUsageLimit(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'total_usage_limit' => $this->faker->numberBetween(10, 100),
                'usage_limit_per_customer' => $this->faker->numberBetween(1, 5),
            ];
        });
    }
}

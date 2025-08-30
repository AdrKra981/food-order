<?php

namespace Database\Factories;

use App\Models\CartItem;
use App\Models\User;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartItemFactory extends Factory
{
    protected $model = CartItem::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'menu_item_id' => MenuItem::factory(),
            'restaurant_id' => Restaurant::factory(),
            'quantity' => $this->faker->numberBetween(1, 5),
            'price' => $this->faker->randomFloat(2, 5, 50),
            'notes' => $this->faker->optional(0.3)->sentence(),
            'session_id' => $this->faker->optional(0.4)->uuid(),
        ];
    }

    public function guest(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'user_id' => null,
                'session_id' => $this->faker->uuid(),
            ];
        });
    }

    public function withNotes(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'notes' => $this->faker->sentence(),
            ];
        });
    }
}

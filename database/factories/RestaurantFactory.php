<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RestaurantFactory extends Factory
{
    protected $model = Restaurant::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->company() . ' Restaurant',
            'description' => $this->faker->paragraph(),
            'cuisine_type' => $this->faker->randomElement(['Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'Japanese', 'Thai', 'French']),
            'phone_number' => $this->faker->phoneNumber(),
            'email' => $this->faker->unique()->safeEmail(),
            'website' => $this->faker->optional(0.6)->url(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'lat' => $this->faker->latitude(),
            'lng' => $this->faker->longitude(),
            'opening_hours' => '09:00',
            'closing_hours' => '22:00',
            'delivery_fee' => $this->faker->randomFloat(2, 2, 8),
            'minimum_order' => $this->faker->randomFloat(2, 15, 30),
            'delivery_range_km' => $this->faker->numberBetween(5, 25),
            'is_accepted' => $this->faker->boolean(90),
        ];
    }

    public function active(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => true,
                'is_accepting_orders' => true,
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

    public function notAcceptingOrders(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_accepting_orders' => false,
            ];
        });
    }
}

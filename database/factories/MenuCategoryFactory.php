<?php

namespace Database\Factories;

use App\Models\MenuCategory;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuCategoryFactory extends Factory
{
    protected $model = MenuCategory::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'name' => $this->faker->randomElement([
                'Appetizers', 'Main Courses', 'Desserts', 'Beverages',
                'Salads', 'Soups', 'Pasta', 'Pizza', 'Burgers', 'Seafood',
            ]),
            'description' => $this->faker->optional(0.7)->sentence(),
            'sort_order' => $this->faker->numberBetween(1, 10),
            'is_available' => $this->faker->boolean(90),
        ];
    }

    public function active(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_available' => true,
            ];
        });
    }

    public function inactive(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_available' => false,
            ];
        });
    }
}

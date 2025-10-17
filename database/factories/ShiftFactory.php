<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Shift>
 */
class ShiftFactory extends Factory
{
    protected $model = Shift::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('+0 days', '+1 week');
        $end = (clone $start)->modify('+8 hours');

        return [
            'restaurant_id' => Restaurant::factory(),
            'user_id' => User::factory(),
            'starts_at' => $start,
            'ends_at' => $end,
            'note' => fake()->boolean(30) ? fake()->sentence(4) : null,
        ];
    }
}

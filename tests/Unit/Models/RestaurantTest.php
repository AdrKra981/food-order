<?php

namespace Tests\Unit\Models;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RestaurantTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_create_a_restaurant()
    {
        $restaurant = Restaurant::factory()->create();
        $this->assertInstanceOf(Restaurant::class, $restaurant);
        $this->assertNotEmpty($restaurant->name);
        $this->assertNotEmpty($restaurant->user_id);
    }

    public function test_it_belongs_to_a_user()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create(['user_id' => $user->id]);
        $this->assertInstanceOf(User::class, $restaurant->user);
        $this->assertEquals($user->id, $restaurant->user->id);
    }

    public function test_scope_re_accepted_returns_only_accepted()
    {
        Restaurant::factory()->create(['is_accepted' => true]);
        Restaurant::factory()->create(['is_accepted' => false]);
        $accepted = Restaurant::reAccepted()->get();
        $this->assertGreaterThanOrEqual(1, $accepted->count());
        foreach ($accepted as $restaurant) {
            $this->assertTrue((bool)$restaurant->is_accepted);
        }
    }
}

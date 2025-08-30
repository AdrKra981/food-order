<?php

namespace Tests\Feature;

use App\Models\PromoCode;
use App\Models\User;
use App\Models\Order;
use App\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromoCodeApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_apply_valid_promo_code_to_order()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();
        $promo = PromoCode::factory()->create([
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDay(),
            'minimum_order_amount' => 20.00,
            'discount_type' => 'fixed_amount',
            'discount_value' => 5.00,
        ]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'total_amount' => 25.00,
        ]);

        $response = $this->actingAs($user)->postJson(route('orders.apply-promo'), [
            'order_id' => $order->id,
            'promo_code' => $promo->code,
        ]);
        $response->assertStatus(200);
        $response->assertJsonFragment(['discount' => 5.00]);
    }

    public function test_cannot_apply_expired_promo_code()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();
        $promo = PromoCode::factory()->create([
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
            'valid_from' => now()->subDays(10),
            'valid_until' => now()->subDay(),
        ]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'total_amount' => 25.00,
        ]);

        $response = $this->actingAs($user)->postJson(route('orders.apply-promo'), [
            'order_id' => $order->id,
            'promo_code' => $promo->code,
        ]);
        $response->assertStatus(422);
    }

    public function test_cannot_apply_promo_code_below_minimum_order()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();
        $promo = PromoCode::factory()->create([
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDay(),
            'minimum_order_amount' => 50.00,
        ]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'total_amount' => 25.00,
        ]);

        $response = $this->actingAs($user)->postJson(route('orders.apply-promo'), [
            'order_id' => $order->id,
            'promo_code' => $promo->code,
        ]);
        $response->assertStatus(422);
    }

    public function test_cannot_apply_promo_code_if_usage_limit_reached()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();
        $promo = PromoCode::factory()->create([
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDay(),
            'total_usage_limit' => 1,
            'used_count' => 1,
        ]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'total_amount' => 25.00,
        ]);

        $response = $this->actingAs($user)->postJson(route('orders.apply-promo'), [
            'order_id' => $order->id,
            'promo_code' => $promo->code,
        ]);
        $response->assertStatus(422);
    }
}

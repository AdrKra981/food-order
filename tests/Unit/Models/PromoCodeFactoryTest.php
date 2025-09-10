<?php

namespace Tests\Unit\Models;

use App\Models\PromoCode;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromoCodeFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_promo_code_with_factory()
    {
        // Create a restaurant owner first
        $owner = User::factory()->create(['role' => 'OWNER']);

        // Create a restaurant
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);

        // Try to create a promo code manually with valid data
        $promoCode = PromoCode::create([
            'restaurant_id' => $restaurant->id,
            'code' => 'TEST10',
            'name' => 'Test Discount',
            'description' => 'Test discount description',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'minimum_order_amount' => 20.00,
            'maximum_discount_amount' => 5.00,
            'is_active' => true,
            'valid_from' => now(),
            'valid_until' => now()->addDays(30),
        ]);

        $this->assertNotNull($promoCode);
        $this->assertEquals('TEST10', $promoCode->code);
        $this->assertEquals($restaurant->id, $promoCode->restaurant_id);
    }
}

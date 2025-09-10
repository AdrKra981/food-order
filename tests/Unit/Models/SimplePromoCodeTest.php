<?php

namespace Tests\Unit\Models;

use App\Models\PromoCode;
use App\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimplePromoCodeTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function test_simple_promo_code_creation()
    {
        $user = \App\Models\User::factory()->create();

        $restaurant = Restaurant::create([
            'user_id' => $user->id,
            'name' => 'Test Restaurant',
            'description' => 'Test description',
            'cuisine_type' => 'Italian',
            'phone_number' => '123456789',
            'email' => 'test@restaurant.com',
            'address' => 'Test Address',
            'city' => 'Test City',
            'lat' => 40.7128,
            'lng' => -74.0060,
            'opening_hours' => '09:00',
            'closing_hours' => '22:00',
            'delivery_fee' => 5.00,
            'minimum_order' => 20.00,
            'delivery_range_km' => 10,
            'is_accepted' => true,
        ]);

        $promoCode = new PromoCode;
        $promoCode->restaurant_id = $restaurant->id;
        $promoCode->code = 'TEST10';
        $promoCode->name = 'Test Discount';
        $promoCode->description = 'Test discount description';
        $promoCode->discount_type = 'percentage';
        $promoCode->discount_value = 10.00;
        $promoCode->minimum_order_amount = 20.00;
        $promoCode->maximum_discount_amount = 5.00;
        $promoCode->is_active = true;
        $promoCode->valid_from = now();
        $promoCode->valid_until = now()->addDays(30);
        $promoCode->save();

        $this->assertInstanceOf(PromoCode::class, $promoCode);
        $this->assertEquals('TEST10', $promoCode->code);
        $this->assertTrue($promoCode->exists);
    }
}

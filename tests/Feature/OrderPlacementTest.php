<?php

namespace Tests\Feature;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\PromoCode;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderPlacementTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_place_order_with_items_and_promo_code()
    {
        $user = User::factory()->create(['role' => \App\Enums\UserRole::CLIENT]);
        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item1 = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'menu_category_id' => $category->id, 'price' => 10]);
        $item2 = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'menu_category_id' => $category->id, 'price' => 15]);
        $promo = PromoCode::factory()->create([
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
            'discount_type' => 'fixed_amount',
            'discount_value' => 5,
            'minimum_order_amount' => 20,
        ]);

        $payload = [
            'restaurant_id' => $restaurant->id,
            'items' => [
                ['menu_item_id' => $item1->id, 'quantity' => 1],
                ['menu_item_id' => $item2->id, 'quantity' => 1],
            ],
            'promo_code' => $promo->code,
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'customer_phone' => '+1234567890',
            'delivery_type' => 'delivery',
            'delivery_address' => '123 Main St',
            'payment_method' => 'card',
        ];

    $this->actingAs($user);
    $response = $this->postJson(route('customer.orders.store'), $payload);
        $response->assertStatus(201);
        $response->assertJsonFragment([
            'customer_name' => 'Jane Doe',
            'total_amount' => 20.00,
            'discount_amount' => 5.00,
            'promo_code_used' => $promo->code,
        ]);
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'promo_code_id' => $promo->id,
            'discount_amount' => 5.00,
        ]);
    }
}

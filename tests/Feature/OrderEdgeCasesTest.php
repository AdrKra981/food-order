<?php

namespace Tests\Feature;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderEdgeCasesTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_place_order_with_zero_or_negative_quantity()
    {
        $user = User::factory()->create(['role' => \App\Enums\UserRole::CLIENT]);
        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'menu_category_id' => $category->id, 'price' => 10, 'is_available' => true]);
        $payload = [
            'restaurant_id' => $restaurant->id,
            'items' => [
                ['menu_item_id' => $item->id, 'quantity' => 0],
            ],
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'customer_phone' => '+1234567890',
            'delivery_type' => 'delivery',
            'delivery_address' => '123 Main St',
            'payment_method' => 'card',
        ];
        $this->actingAs($user);
        $response = $this->postJson(route('customer.orders.store'), $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items.0.quantity']);

        // Negative quantity
        $payload['items'][0]['quantity'] = -2;
        $response = $this->postJson(route('customer.orders.store'), $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items.0.quantity']);
    }

    public function test_cannot_place_order_with_invalid_promo_code()
    {
        $user = User::factory()->create(['role' => \App\Enums\UserRole::CLIENT]);
        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'menu_category_id' => $category->id, 'price' => 10, 'is_available' => true]);
        $payload = [
            'restaurant_id' => $restaurant->id,
            'items' => [
                ['menu_item_id' => $item->id, 'quantity' => 1],
            ],
            'promo_code' => 'INVALIDCODE',
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'customer_phone' => '+1234567890',
            'delivery_type' => 'delivery',
            'delivery_address' => '123 Main St',
            'payment_method' => 'card',
        ];
        $this->actingAs($user);
        $response = $this->postJson(route('customer.orders.store'), $payload);
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Invalid or expired promo code.']);
    }

    public function test_cannot_place_order_with_nonexistent_restaurant()
    {
        $user = \App\Models\User::factory()->create(['role' => \App\Enums\UserRole::CLIENT]);
        $payload = [
            'restaurant_id' => 999999, // Non-existent
            'items' => [
                ['menu_item_id' => 1, 'quantity' => 1],
            ],
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'customer_phone' => '+1234567890',
            'delivery_type' => 'delivery',
            'delivery_address' => '123 Main St',
            'payment_method' => 'card',
        ];
        $this->actingAs($user);
        $response = $this->postJson(route('customer.orders.store'), $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['restaurant_id']);
    }

    public function test_cannot_place_order_with_unavailable_menu_item()
    {
        $user = User::factory()->create(['role' => \App\Enums\UserRole::CLIENT]);
        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create([
            'restaurant_id' => $restaurant->id,
            'menu_category_id' => $category->id,
            'price' => 10,
            'is_available' => false,
        ]);

        $payload = [
            'restaurant_id' => $restaurant->id,
            'items' => [
                ['menu_item_id' => $item->id, 'quantity' => 1],
            ],
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'customer_phone' => '+1234567890',
            'delivery_type' => 'delivery',
            'delivery_address' => '123 Main St',
            'payment_method' => 'card',
        ];

        $this->actingAs($user);
        $response = $this->postJson(route('customer.orders.store'), $payload);
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'One or more menu items are unavailable.']);
    }
}

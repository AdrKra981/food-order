<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;



class OrderManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_cannot_update_status_of_other_restaurant_order()
    {
        $owner = User::factory()->create(['role' => \App\Enums\UserRole::OWNER]);
        $ownerRestaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $otherRestaurant = Restaurant::factory()->create();
        $order = Order::factory()->create([
            'restaurant_id' => $otherRestaurant->id,
            'status' => \App\Enums\OrderStatus::PENDING,
        ]);

        $this->actingAs($owner);
        $response = $this->patchJson(route('owner.orders.update-status', ['order' => $order->id]), [
            'status' => 'accepted',
        ]);
        $response->assertStatus(403);
    }

    public function test_customer_can_view_their_order()
    {
        $user = User::factory()->create(['role' => \App\Enums\UserRole::CLIENT]);
        $restaurant = Restaurant::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);

        $this->actingAs($user);
    $response = $this->getJson(route('customer.orders.show', ['order' => $order->id]));
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $order->id,
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);
    }

    public function test_owner_can_update_order_status()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
        ]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $this->actingAs($owner);

        $statuses = [
            'accepted' => \App\Enums\OrderStatus::ACCEPTED,
            'in_progress' => \App\Enums\OrderStatus::IN_PROGRESS,
            'completed' => \App\Enums\OrderStatus::COMPLETED,
            'cancelled' => \App\Enums\OrderStatus::CANCELLED,
        ];
        foreach ($statuses as $statusString => $enumCase) {
            // Create a fresh order for each status change
            $order = Order::factory()->create([
                'restaurant_id' => $restaurant->id,
                'status' => \App\Enums\OrderStatus::PENDING,
            ]);
            $response = $this->patchJson(route('owner.orders.update-status', ['order' => $order->id]), [
                'status' => $statusString
            ]);
            $response->assertStatus(200);
            $order->refresh();
            $this->assertEquals($enumCase, $order->status);
        }
    }

    public function test_customer_can_create_order()
    {
        $user = User::factory()->create([
            'role' => \App\Enums\UserRole::CLIENT,
        ]);
        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'menu_category_id' => $category->id]);

        $this->actingAs($user);

        // Add item to cart for the user
        \App\Models\CartItem::factory()->create([
            'user_id' => $user->id,
            'menu_item_id' => $menuItem->id,
            'restaurant_id' => $restaurant->id,
            'quantity' => 2,
            'price' => $menuItem->price,
        ]);

        $response = $this->postJson('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '123456789',
            'delivery_type' => 'delivery',
            'payment_method' => 'cash',
            'street' => '123 Test St',
            'city' => 'Testville',
            'postal_code' => '12345',
        ]);

        $response->assertRedirect(route('orders.success'));
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'customer_phone' => '123456789',
            'delivery_type' => 'delivery',
            'delivery_address' => '123 Test St, Testville, 12345',
            'payment_method' => 'cash',
        ]);
    }

    // Add more tests for status transitions, price calculation, etc.
}

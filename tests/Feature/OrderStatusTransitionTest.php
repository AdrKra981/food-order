<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\Order;
use App\Enums\OrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderStatusTransitionTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_cannot_update_completed_or_cancelled_order()
    {
        $owner = \App\Models\User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = \App\Models\Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);
        $completedOrder = \App\Models\Order::factory()->create([
            'restaurant_id' => $restaurant->id,
            'status' => \App\Enums\OrderStatus::COMPLETED,
        ]);
        $cancelledOrder = \App\Models\Order::factory()->create([
            'restaurant_id' => $restaurant->id,
            'status' => \App\Enums\OrderStatus::CANCELLED,
        ]);

        $this->actingAs($owner);
        $response = $this->patchJson(route('owner.orders.update-status', ['order' => $completedOrder->id]), [
            'status' => 'accepted',
        ], ['Accept' => 'application/json']);
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Cannot update a completed or cancelled order.']);

        $response = $this->patchJson(route('owner.orders.update-status', ['order' => $cancelledOrder->id]), [
            'status' => 'accepted',
        ], ['Accept' => 'application/json']);
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Cannot update a completed or cancelled order.']);
    }

    public function test_owner_can_update_order_status_to_accepted_and_completed()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);
        $order = Order::factory()->create([
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatus::PENDING,
        ]);

        $this->actingAs($owner);
    $response = $this->patchJson(route('owner.orders.update-status', ['order' => $order->id]), [
            'status' => 'accepted',
        ], ['Accept' => 'application/json']);
        $response->assertStatus(200);
        $this->assertEquals(OrderStatus::ACCEPTED, $order->fresh()->status);

    $response = $this->patchJson(route('owner.orders.update-status', ['order' => $order->id]), [
            'status' => 'completed',
        ], ['Accept' => 'application/json']);
        $response->assertStatus(200);
        $this->assertEquals(OrderStatus::COMPLETED, $order->fresh()->status);
    }

    public function test_owner_cannot_update_order_of_other_restaurant()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $otherRestaurant = Restaurant::factory()->create(['is_accepted' => true]);
        $order = Order::factory()->create([
            'restaurant_id' => $otherRestaurant->id,
            'status' => OrderStatus::PENDING,
        ]);

        $this->actingAs($owner);
        $response = $this->patchJson(route('owner.orders.update-status', ['order' => $order->id]), [
            'status' => 'accepted',
        ], ['Accept' => 'application/json']);
        if ($response->status() === 302) {
            $this->assertTrue(
                $response->headers->has('Location'),
                'Expected a redirect response with a Location header.'
            );
        } else {
            $response->assertStatus(403);
        }
    }

    public function test_customer_cannot_update_order_status()
    {
        $customer = User::factory()->create([
            'role' => \App\Enums\UserRole::CLIENT,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create(['is_accepted' => true]);
        $order = Order::factory()->create([
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatus::PENDING,
        ]);

        $this->actingAs($customer);
        $response = $this->patchJson(route('owner.orders.update-status', ['order' => $order->id]), [
            'status' => 'accepted',
        ], ['Accept' => 'application/json']);
        $response->assertStatus(403);
    }
}

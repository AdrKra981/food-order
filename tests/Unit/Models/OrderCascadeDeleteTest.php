<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCascadeDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleting_order_cascades_to_order_items()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);
        $item1 = OrderItem::factory()->create(['order_id' => $order->id]);
        $item2 = OrderItem::factory()->create(['order_id' => $order->id]);

        $this->assertDatabaseHas('order_items', ['id' => $item1->id]);
        $this->assertDatabaseHas('order_items', ['id' => $item2->id]);

        $order->delete();

        $this->assertDatabaseMissing('order_items', ['id' => $item1->id]);
        $this->assertDatabaseMissing('order_items', ['id' => $item2->id]);
    }
}

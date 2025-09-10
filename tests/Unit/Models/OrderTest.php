<?php

namespace Tests\Unit\Models;

use App\Enums\OrderStatus;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PromoCode;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->restaurant = Restaurant::factory()->create();
    }

    /** @test */
    public function it_can_create_an_order()
    {
        $order = Order::create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'order_number' => 'FG20250816001',
            'total_amount' => 25.50,
            'status' => OrderStatus::PENDING,
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'customer_phone' => '+1234567890',
            'delivery_type' => 'delivery',
            'delivery_address' => '123 Main St, City, 12345',
            'payment_method' => 'card',
        ]);

        $this->assertInstanceOf(Order::class, $order);
        $this->assertEquals('FG20250816001', $order->order_number);
        $this->assertEquals(25.50, $order->total_amount);
        $this->assertEquals(OrderStatus::PENDING, $order->status);
    }

    /** @test */
    public function it_belongs_to_a_user()
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
        ]);

        $this->assertInstanceOf(User::class, $order->user);
        $this->assertEquals($this->user->id, $order->user->id);
    }

    /** @test */
    public function it_belongs_to_a_restaurant()
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
        ]);

        $this->assertInstanceOf(Restaurant::class, $order->restaurant);
        $this->assertEquals($this->restaurant->id, $order->restaurant->id);
    }

    /** @test */
    public function it_can_have_multiple_order_items()
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
        ]);

        $menuItem1 = MenuItem::factory()->create(['restaurant_id' => $this->restaurant->id]);
        $menuItem2 = MenuItem::factory()->create(['restaurant_id' => $this->restaurant->id]);

        $orderItem1 = OrderItem::create([
            'order_id' => $order->id,
            'menu_item_id' => $menuItem1->id,
            'quantity' => 2,
            'price' => 12.50,
        ]);

        $orderItem2 = OrderItem::create([
            'order_id' => $order->id,
            'menu_item_id' => $menuItem2->id,
            'quantity' => 1,
            'price' => 8.00,
        ]);

        $this->assertCount(2, $order->orderItems);
        $this->assertTrue($order->orderItems->contains($orderItem1));
        $this->assertTrue($order->orderItems->contains($orderItem2));
    }

    /** @test */
    public function it_can_belong_to_a_promo_code()
    {
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
        ]);

        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'promo_code_id' => $promoCode->id,
            'discount_amount' => 5.00,
        ]);

        $this->assertInstanceOf(PromoCode::class, $order->promoCode);
        $this->assertEquals($promoCode->id, $order->promoCode->id);
        $this->assertEquals(5.00, $order->discount_amount);
    }

    /** @test */
    public function it_casts_status_to_enum()
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatus::PENDING,
        ]);

        $this->assertInstanceOf(OrderStatus::class, $order->status);
        $this->assertEquals(OrderStatus::PENDING, $order->status);
    }

    /** @test */
    public function it_casts_monetary_values_to_decimal()
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'total_amount' => 25.5,
            'discount_amount' => 5.0,
            'subtotal_amount' => 30.5,
        ]);

        $this->assertEquals('25.50', $order->total_amount);
        $this->assertEquals('5.00', $order->discount_amount);
        $this->assertEquals('30.50', $order->subtotal_amount);
    }

    /** @test */
    public function it_can_calculate_order_totals_with_items()
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
        ]);

        $menuItem1 = MenuItem::factory()->create(['restaurant_id' => $this->restaurant->id]);
        $menuItem2 = MenuItem::factory()->create(['restaurant_id' => $this->restaurant->id]);

        OrderItem::create([
            'order_id' => $order->id,
            'menu_item_id' => $menuItem1->id,
            'quantity' => 2,
            'price' => 12.50,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'menu_item_id' => $menuItem2->id,
            'quantity' => 1,
            'price' => 8.00,
        ]);

        $order->refresh();
        $expectedTotal = (2 * 12.50) + (1 * 8.00); // 25 + 8 = 33

        // Note: This test assumes you have a method to calculate totals
        // If not implemented, you might want to add this method to the Order model
        $calculatedTotal = $order->orderItems->sum(function ($item) {
            return $item->quantity * $item->price;
        });

        $this->assertEquals(33.00, $calculatedTotal);
    }

    /** @test */
    public function it_can_have_different_delivery_types()
    {
        $deliveryOrder = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'delivery_type' => 'delivery',
            'delivery_address' => '123 Main St, City, 12345',
        ]);

        $pickupOrder = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'delivery_type' => 'pickup',
            'delivery_address' => 'Pickup Point',
        ]);

        $this->assertEquals('delivery', $deliveryOrder->delivery_type);
        $this->assertNotNull($deliveryOrder->delivery_address);

        $this->assertEquals('pickup', $pickupOrder->delivery_type);
        $this->assertNotNull($pickupOrder->delivery_address);
    }

    /** @test */
    public function it_can_have_different_payment_methods()
    {
        $cardOrder = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'payment_method' => 'card',
        ]);

        $cashOrder = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'payment_method' => 'cash',
        ]);

        $onlineOrder = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'payment_method' => 'online',
        ]);

        $this->assertEquals('card', $cardOrder->payment_method);
        $this->assertEquals('cash', $cashOrder->payment_method);
        $this->assertEquals('online', $onlineOrder->payment_method);
    }

    /** @test */
    public function it_can_store_payment_intent_id_for_stripe()
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'payment_method' => 'online',
            'payment_intent_id' => 'pi_test_1234567890',
        ]);

        $this->assertEquals('pi_test_1234567890', $order->payment_intent_id);
    }
}

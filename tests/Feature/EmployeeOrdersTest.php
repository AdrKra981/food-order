<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Events\OrderUpdated;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class EmployeeOrdersTest extends TestCase
{
    use RefreshDatabase;

    protected function seedRestaurantWithEmployeeAndOrder(): array
    {
        /** @var User $owner */
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
        ]);
        $restaurant = Restaurant::create([
            'user_id' => $owner->id,
            'name' => 'R',
            'address' => 'A',
            'phone_number' => '1',
            'city' => 'C',
        ]);
        /** @var User $employee */
        $employee = User::factory()->create([
            'role' => \App\Enums\UserRole::EMPLOYEE,
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
        ]);
        $order = Order::create([
            'user_id' => $owner->id,
            'restaurant_id' => $restaurant->id,
            'order_number' => 'FGTEST0001',
            'total_amount' => 10.00,
            'status' => OrderStatus::PENDING,
            'customer_name' => 'C',
            'customer_email' => 'c@example.com',
            'customer_phone' => '111',
            'delivery_type' => 'delivery',
            'delivery_address' => 'addr',
            'payment_method' => 'cash',
        ]);
        return [$employee, $order];
    }

    public function test_employee_can_update_order_status_and_event_emitted(): void
    {
        Event::fake([OrderUpdated::class]);

        [$employee, $order] = $this->seedRestaurantWithEmployeeAndOrder();

        $resp = $this->actingAs($employee)->patch(route('employee.orders.update-status', $order), [
            'status' => 'accepted',
        ]);

        $resp->assertOk();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatus::ACCEPTED,
        ]);

        Event::assertDispatched(OrderUpdated::class);
    }
}

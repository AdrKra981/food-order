<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all restaurants
        $restaurants = Restaurant::where('is_accepted', true)->get();

        // Get existing customers or create new ones
        $existingCustomers = User::where('role', UserRole::CLIENT)->get();

        if ($existingCustomers->count() > 0) {
            $customers = $existingCustomers;
        } else {
            // Create some regular customers if none exist
            $customers = collect();
            for ($i = 1; $i <= 10; $i++) {
                $customer = User::create([
                    'name' => "Klient $i",
                    'email' => "klient$i@example.com",
                    'password' => bcrypt('password'),
                    'role' => UserRole::CLIENT,
                ]);
                $customers->push($customer);
            }
        }

        // Create orders for the last 60 days
        foreach ($restaurants as $restaurant) {
            $menuItems = $restaurant->menuItems;

            if ($menuItems->isEmpty()) {
                continue;
            }

            // Create 20-50 orders per restaurant over the last 60 days
            $orderCount = rand(20, 50);

            for ($i = 0; $i < $orderCount; $i++) {
                // Random date in the last 60 days
                $orderDate = now()->subDays(rand(0, 60));

                // Random customer
                $customer = $customers->random();

                // Random delivery type
                $deliveryType = rand(0, 1) ? 'delivery' : 'pickup';

                // Random status with realistic distribution
                $statusOptions = [
                    OrderStatus::COMPLETED, OrderStatus::COMPLETED, OrderStatus::COMPLETED, // 60%
                    OrderStatus::CANCELLED, // 20%
                    OrderStatus::PENDING, // 5%
                    OrderStatus::ACCEPTED, // 10%
                    OrderStatus::IN_PROGRESS, // 5%
                ];
                $status = $statusOptions[array_rand($statusOptions)];

                // Create order
                $order = Order::create([
                    'user_id' => $customer->id,
                    'restaurant_id' => $restaurant->id,
                    'order_number' => 'ORD-'.$orderDate->timestamp.'-'.$restaurant->id.'-'.$i,
                    'status' => $status,
                    'customer_name' => $customer->name,
                    'customer_email' => $customer->email,
                    'customer_phone' => '+48 '.rand(100000000, 999999999),
                    'delivery_type' => $deliveryType,
                    'payment_method' => rand(0, 1) ? 'online' : 'cash',
                    'total_amount' => 0, // Will calculate later
                    'delivery_address' => $deliveryType === 'delivery' ?
                        'ul. Testowa '.rand(1, 100).', '.$restaurant->city.', '.rand(10, 99).'-'.rand(100, 999) :
                        'Odbiór osobisty',
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                // Add 1-5 menu items to the order
                $itemCount = rand(1, 5);
                $totalAmount = 0;

                for ($j = 0; $j < $itemCount; $j++) {
                    $menuItem = $menuItems->random();
                    $quantity = rand(1, 3);
                    $price = $menuItem->price;

                    \App\Models\OrderItem::create([
                        'order_id' => $order->id,
                        'menu_item_id' => $menuItem->id,
                        'quantity' => $quantity,
                        'price' => $price,
                        'notes' => rand(0, 100) < 20 ? 'Bez cebuli' : null, // 20% chance of special instructions
                    ]);

                    $totalAmount += $price * $quantity;
                }

                // Update order total
                $order->update([
                    'total_amount' => $totalAmount,
                ]);
            }
        }
    }
}

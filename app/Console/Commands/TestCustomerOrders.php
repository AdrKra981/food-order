<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;
use Illuminate\Console\Command;

class TestCustomerOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-customer-orders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test customer orders functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Find the customer user
        $customer = User::where('role', UserRole::CLIENT)->first();

        if (! $customer) {
            $this->error('No customer user found');

            return;
        }

        $this->info("Customer: {$customer->name} ({$customer->email})");

        // Check orders for this customer
        $orders = Order::where('user_id', $customer->id)
            ->with(['restaurant', 'orderItems.menuItem'])
            ->orderBy('created_at', 'desc')
            ->get();

        $this->info('Total orders: '.$orders->count());

        if ($orders->count() > 0) {
            $this->info("\nRecent orders:");
            foreach ($orders->take(5) as $order) {
                $statusLabel = $order->status ? $order->status->label() : 'Unknown';
                $this->line("Order #{$order->order_number} - {$order->restaurant->name} - \${$order->total_amount} - {$statusLabel}");
                $this->line('  Items: '.$order->orderItems->count());
                foreach ($order->orderItems->take(3) as $item) {
                    $itemName = $item->menuItem ? $item->menuItem->name : 'Unknown Item';
                    $this->line("    - {$item->quantity}x {$itemName} (\${$item->price})");
                }
                if ($order->orderItems->count() > 3) {
                    $this->line('    ... and '.($order->orderItems->count() - 3).' more items');
                }
                $this->line('');
            }
        } else {
            $this->warn('No orders found for this customer');
        }

        $this->info('Dashboard will redirect customer to: /customer/orders');
    }
}

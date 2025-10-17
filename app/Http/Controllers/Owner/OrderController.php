<?php

namespace App\Http\Controllers\Owner;

use App\Enums\OrderStatus;
use App\Events\OrderUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $restaurant = $user->restaurant;

        if (! $restaurant) {
            return redirect()->route('owner.restaurant.edit')->with('error', 'Please set up your restaurant first.');
        }

        // Get filter parameters
        $status = $request->get('status');
        $search = $request->get('search');
        $perPage = $request->get('per_page', 15);

        // Build query
        $ordersQuery = $restaurant->orders()
            ->with(['user', 'orderItems.menuItem'])
            ->orderByDesc('created_at');

        // Apply status filter
        if ($status && $status !== 'all') {
            $ordersQuery->where('status', $status);
        }

        // Apply search filter
        if ($search) {
            $ordersQuery->where(function ($query) use ($search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $orders = $ordersQuery->paginate($perPage)->withQueryString();

        // Get status counts for filter tabs
        $statusCounts = [
            'all' => $restaurant->orders()->count(),
            'pending' => $restaurant->orders()->where('status', OrderStatus::PENDING)->count(),
            'accepted' => $restaurant->orders()->where('status', OrderStatus::ACCEPTED)->count(),
            'in_progress' => $restaurant->orders()->where('status', OrderStatus::IN_PROGRESS)->count(),
            'completed' => $restaurant->orders()->where('status', OrderStatus::COMPLETED)->count(),
            'cancelled' => $restaurant->orders()->where('status', OrderStatus::CANCELLED)->count(),
        ];

        return Inertia::render('Owner/Orders', [
            'restaurant' => $restaurant,
            'orders' => $orders,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'per_page' => $perPage,
            ],
            'statusCounts' => $statusCounts,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        if (in_array($order->status, [OrderStatus::COMPLETED, OrderStatus::CANCELLED], true)) {
            return response()->json(['message' => 'Cannot update a completed or cancelled order.'], 422);
        }
        $user = $request->user();
        $restaurant = $user->restaurant;

        // If no restaurant, or order does not belong to this restaurant, return 403 for API/JSON requests
        if (! $restaurant || $order->restaurant_id !== $restaurant->id) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            return redirect()->route('restaurant.edit')->with('error', 'Please set up your restaurant first.');
        }

        $request->validate([
            'status' => 'required|in:pending,accepted,in_progress,completed,cancelled',
        ]);

        $statusMap = [
            'pending' => OrderStatus::PENDING,
            'accepted' => OrderStatus::ACCEPTED,
            'in_progress' => OrderStatus::IN_PROGRESS,
            'completed' => OrderStatus::COMPLETED,
            'cancelled' => OrderStatus::CANCELLED,
        ];
        $order->update([
            'status' => $statusMap[$request->status],
        ]);

        event(new OrderUpdated($order->fresh()));

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->load('user'),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Employee;

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

        $status = $request->get('status', 'active');
        $perPage = (int) $request->get('per_page', 15);

        $query = Order::query()
            ->with(['orderItems.menuItem'])
            ->where('restaurant_id', $user->restaurant_id)
            ->orderByDesc('created_at');

        // Active means pending/accepted/in_progress
        if ($status === 'active') {
            $query->whereIn('status', [
                OrderStatus::PENDING,
                OrderStatus::ACCEPTED,
                OrderStatus::IN_PROGRESS,
            ]);
        } elseif ($status !== 'all') {
            // specific status value
            $query->where('status', $status);
        }

        $orders = $query->paginate($perPage)->withQueryString();

        $statusCounts = [
            'active' => Order::where('restaurant_id', $user->restaurant_id)
                ->whereIn('status', [OrderStatus::PENDING, OrderStatus::ACCEPTED, OrderStatus::IN_PROGRESS])
                ->count(),
            'pending' => Order::where('restaurant_id', $user->restaurant_id)->where('status', OrderStatus::PENDING)->count(),
            'accepted' => Order::where('restaurant_id', $user->restaurant_id)->where('status', OrderStatus::ACCEPTED)->count(),
            'in_progress' => Order::where('restaurant_id', $user->restaurant_id)->where('status', OrderStatus::IN_PROGRESS)->count(),
            'completed' => Order::where('restaurant_id', $user->restaurant_id)->where('status', OrderStatus::COMPLETED)->count(),
            'cancelled' => Order::where('restaurant_id', $user->restaurant_id)->where('status', OrderStatus::CANCELLED)->count(),
            'all' => Order::where('restaurant_id', $user->restaurant_id)->count(),
        ];

        return Inertia::render('Employee/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'status' => $status,
                'per_page' => $perPage,
            ],
            'statusCounts' => $statusCounts,
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        abort_if($order->restaurant_id !== $user->restaurant_id, 403);

        $order->load(['orderItems.menuItem']);

        return Inertia::render('Employee/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $user = $request->user();
        abort_if($order->restaurant_id !== $user->restaurant_id, 403);

        if (in_array($order->status, [OrderStatus::COMPLETED, OrderStatus::CANCELLED], true)) {
            return response()->json(['message' => 'Cannot update a completed or cancelled order.'], 422);
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
            'order' => $order->fresh()->load('orderItems.menuItem'),
        ]);
    }
}

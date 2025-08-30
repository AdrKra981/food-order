<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Order;
use App\Enums\OrderStatus;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $restaurant = $user->restaurant;

        if (!$restaurant) {
            return redirect()->route('owner.restaurant.edit')->with('error', 'Please set up your restaurant first.');
        }

        // Get date range from request or default to last 30 days
        $startDate = $request->get('start_date', now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->format('Y-m-d'));

        // Parse dates
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Get restaurant orders within date range
        $orders = $restaurant->orders()
            ->whereBetween('created_at', [$start, $end])
            ->with(['user'])
            ->get();

        // Calculate basic statistics
        $totalOrders = $orders->count();
        $totalRevenue = $orders->where('status', '!=', OrderStatus::CANCELLED)->sum('total_amount');
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
        
        // Order status breakdown
        $statusBreakdown = [
            'pending' => $orders->where('status', OrderStatus::PENDING)->count(),
            'accepted' => $orders->where('status', OrderStatus::ACCEPTED)->count(),
            'in_progress' => $orders->where('status', OrderStatus::IN_PROGRESS)->count(),
            'completed' => $orders->where('status', OrderStatus::COMPLETED)->count(),
            'cancelled' => $orders->where('status', OrderStatus::CANCELLED)->count(),
        ];

        // Revenue by day for chart
        $revenueByDay = [];
        $currentDate = $start->copy();
        while ($currentDate <= $end) {
            $dayRevenue = $orders
                ->where('created_at', '>=', $currentDate->startOfDay())
                ->where('created_at', '<', $currentDate->copy()->addDay()->startOfDay())
                ->where('status', '!=', OrderStatus::CANCELLED)
                ->sum('total_amount');
            
            $revenueByDay[] = [
                'date' => $currentDate->format('Y-m-d'),
                'revenue' => $dayRevenue,
                'orders' => $orders
                    ->where('created_at', '>=', $currentDate->startOfDay())
                    ->where('created_at', '<', $currentDate->copy()->addDay()->startOfDay())
                    ->count()
            ];
            
            $currentDate->addDay();
        }

        // Most popular items - simplified for now since we don't have order_items
        $popularItems = collect(); // Empty for now

        // Recent orders
        $recentOrders = $restaurant->orders()
            ->with(['user'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // Calculate growth compared to previous period
        $previousStart = $start->copy()->subDays($end->diffInDays($start) + 1);
        $previousEnd = $start->copy()->subDay();
        
        $previousOrders = $restaurant->orders()
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->where('status', '!=', OrderStatus::CANCELLED)
            ->get();
        
        $previousRevenue = $previousOrders->sum('total_amount');
        $revenueGrowth = $previousRevenue > 0 ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;
        $orderGrowth = $previousOrders->count() > 0 ? (($totalOrders - $previousOrders->count()) / $previousOrders->count()) * 100 : 0;

        return Inertia::render('Owner/Reports', [
            'restaurant' => $restaurant,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
                'avgOrderValue' => $avgOrderValue,
                'revenueGrowth' => $revenueGrowth,
                'orderGrowth' => $orderGrowth,
            ],
            'statusBreakdown' => $statusBreakdown,
            'revenueByDay' => $revenueByDay,
            'popularItems' => $popularItems,
            'recentOrders' => $recentOrders,
        ]);
    }
}

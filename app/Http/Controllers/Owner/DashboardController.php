<?php

namespace App\Http\Controllers\Owner;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $restaurant = $user->restaurant;

        // Default to last 30 days (same as ReportsController)
        $startDate = $request->get('start_date', now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->format('Y-m-d'));

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $stats = [
            'totalOrders' => 0,
            'totalRevenue' => 0.00,
            'totalCustomers' => 0,
            'pendingOrders' => 0,
        ];

        if ($restaurant) {
            $orders = $restaurant->orders()
                ->whereBetween('created_at', [$start, $end])
                ->get();

            $stats['totalOrders'] = $orders->count();
            $stats['totalRevenue'] = $orders->where('status', '!=', OrderStatus::CANCELLED)->sum('total_amount');
            $stats['totalCustomers'] = $orders->pluck('user_id')->filter()->unique()->count();
            $stats['pendingOrders'] = $orders->where('status', OrderStatus::PENDING)->count();
        }

        return Inertia::render('Owner/Dashboard', [
            'stats' => $stats,
            'restaurant' => $restaurant,
        ]);
    }
}

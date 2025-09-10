<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $restaurant = $user->restaurant;

        // Basic stats (you can expand this later with real data)
        $stats = [
            'totalOrders' => 0,
            'totalRevenue' => 0.00,
            'totalCustomers' => 0,
            'pendingOrders' => 0,
        ];

        // If restaurant exists, you can add real statistics here
        if ($restaurant) {
            // Example: $stats['totalOrders'] = $restaurant->orders()->count();
            // Example: $stats['totalRevenue'] = $restaurant->orders()->sum('total');
        }

        return Inertia::render('Owner/Dashboard', [
            'stats' => $stats,
            'restaurant' => $restaurant,
        ]);
    }
}

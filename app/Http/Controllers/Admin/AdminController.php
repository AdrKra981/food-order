<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Get statistics for dashboard
        $stats = [
            'total_users' => User::count(),
            'total_restaurants' => Restaurant::count(),
            'active_restaurants' => Restaurant::where('is_accepted', true)->count(),
            'pending_restaurants' => Restaurant::where('is_accepted', false)->count(),
            'total_menu_items' => MenuItem::count(),
            'total_orders' => Order::count() ?? 0,
            'restaurant_owners' => User::where('role', UserRole::OWNER)->count(),
            'customers' => User::where('role', UserRole::CLIENT)->count(),
        ];

        // Get recent restaurants
        $recent_restaurants = Restaurant::with('user')
            ->latest()
            ->take(5)
            ->get();

        // Get restaurants by cuisine type
        $restaurants_by_cuisine = Restaurant::selectRaw('cuisine_type, COUNT(*) as count')
            ->groupBy('cuisine_type')
            ->get();

        return inertia('Admin/Dashboard', [
            'stats' => $stats,
            'recent_restaurants' => $recent_restaurants,
            'restaurants_by_cuisine' => $restaurants_by_cuisine,
        ]);
    }

    public function restaurants(Request $request)
    {
        $query = Restaurant::with('user');

        // Filter by status if provided
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_accepted', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_accepted', false);
            }
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('cuisine_type', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        $restaurants = $query->paginate(15);

        return inertia('Admin/Restaurants', [
            'restaurants' => $restaurants,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function toggleRestaurantStatus(Restaurant $restaurant)
    {
        $restaurant->update([
            'is_accepted' => ! $restaurant->is_accepted,
        ]);

        $status = $restaurant->is_accepted ? 'activated' : 'deactivated';

        return redirect()->back()->with('success', "Restaurant has been {$status} successfully.");
    }

    public function deleteRestaurant(Restaurant $restaurant)
    {
        $restaurant->delete();

        return redirect()->back()->with('success', 'Restaurant has been deleted successfully.');
    }
}

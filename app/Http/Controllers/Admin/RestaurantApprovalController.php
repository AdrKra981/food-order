<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;

class RestaurantApprovalController extends Controller
{
    public function index()
    {
        $pending = Restaurant::where('is_accepted', false)->get();

        return inertia('Admin/PendingRestaurants', ['restaurants' => $pending]);
    }

    public function accept(Restaurant $restaurant)
    {
        $restaurant->update(['is_accepted' => true]);

        return redirect()->back()->with('success', 'Restaurant approved.');
    }

    public function reject(Restaurant $restaurant)
    {
        $restaurant->delete(); // or set some other flag

        return redirect()->back()->with('error', 'Restaurant rejected.');
    }
}

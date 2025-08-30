<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RestaurantModerationController extends Controller
{
    public function index()
    {
        $restaurants = Restaurant::where('is_accepted', false)->with('user')->latest()->get();

        return Inertia::render('Admin/PendingRestaurants', [
            'restaurants' => $restaurants
        ]);
    }

    public function approve(Restaurant $restaurant)
    {
        $restaurant->update(['is_accepted' => true]);
        return back()->with('success', 'Restaurant approved.');
    }

    public function reject(Restaurant $restaurant)
    {
        $restaurant->delete();
        return back()->with('success', 'Restaurant rejected and deleted.');
    }
}

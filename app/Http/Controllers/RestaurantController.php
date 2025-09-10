<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RestaurantController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'address' => 'required|string',
            'user_id' => 'required|exists:users,id',
        ]);
        // Prevent owner from creating more than one restaurant
        $existing = Restaurant::where('user_id', $data['user_id'])->first();
        if ($existing) {
            return response()->json(['message' => 'Owner already has a restaurant.'], 403);
        }
        $restaurant = Restaurant::create(array_merge($data, [
            'phone_number' => $request->input('phone_number', '000-000-0000'),
            'email' => $request->input('email', 'restaurant@example.com'),
            'city' => $request->input('city', 'City'),
            'lat' => $request->input('lat', 0),
            'lng' => $request->input('lng', 0),
            'opening_hours' => $request->input('opening_hours', '09:00'),
            'closing_hours' => $request->input('closing_hours', '22:00'),
            'delivery_fee' => $request->input('delivery_fee', 5),
            'minimum_order' => $request->input('minimum_order', 20),
            'delivery_range_km' => $request->input('delivery_range_km', 10),
            'is_accepted' => false,
        ]));

        return response()->json($restaurant, 201);
    }

    public function approve($id)
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->is_accepted = true;
        $restaurant->save();
        $restaurant->refresh();

        return response()->json($restaurant, 200);
    }

    public function update(Request $request, $id)
    {
        $restaurant = Restaurant::findOrFail($id);
        if (Auth::id() !== $restaurant->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $restaurant->update($request->only(['name', 'address', 'description', 'cuisine_type']));

        return response()->json($restaurant, 200);
    }

    public function destroy($id)
    {
        $restaurant = Restaurant::findOrFail($id);
        if (Auth::id() !== $restaurant->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $restaurant->delete();

        return response()->json(['message' => 'Deleted'], 200);
    }
}

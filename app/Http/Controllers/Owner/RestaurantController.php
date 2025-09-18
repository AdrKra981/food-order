<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RestaurantController extends Controller
{
    public function edit()
    {
        $restaurant = auth()->user()->restaurant;

        if (! $restaurant) {
            return redirect()->route('owner.dashboard')
                ->with('error', 'No restaurant found for your account.');
        }

        // Load media so the MediaSelector can show available images
        $restaurant->loadMissing(['media', 'image']);

        return Inertia::render('Owner/Restaurant/Edit', [
            'restaurant' => $restaurant,
            'media' => $restaurant->media,
        ]);
    }

    public function update(Request $request)
    {
        $restaurant = auth()->user()->restaurant;

        if (! $restaurant) {
            return redirect()->route('owner.dashboard')
                ->with('error', 'No restaurant found for your account.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'cuisine_type' => 'nullable|string|max:255',
            'delivery_fee' => 'nullable|numeric|min:0',
            'minimum_order' => 'nullable|numeric|min:0',
            'image_id' => 'nullable|exists:media,id',
        ]);

        $restaurant->update($request->only([
            'name',
            'description',
            'phone_number',
            'email',
            'address',
            'city',
            'website',
            'cuisine_type',
            'delivery_fee',
            'minimum_order',
            'image_id',
        ]));

        return redirect()->route('owner.restaurant.edit')
            ->with('success', 'Restaurant settings updated successfully!');
    }
}

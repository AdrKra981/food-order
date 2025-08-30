<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Restaurant;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $searchAddress = $request->get('address');
        $searchLat = $request->get('lat');
        $searchLng = $request->get('lng');

        $query = Restaurant::where('is_accepted', true)
            ->with(['user', 'media']);

        // If location is provided, filter by delivery range
        if ($searchLat && $searchLng) {
            $query->whereRaw('
                (6371 * acos(cos(radians(?)) * cos(radians(COALESCE(lat, 52.2297))) * cos(radians(COALESCE(lng, 21.0122)) - radians(?)) + sin(radians(?)) * sin(radians(COALESCE(lat, 52.2297))))) <= delivery_range_km
            ', [$searchLat, $searchLng, $searchLat]);
        }

        $restaurants = $query->get()
            ->map(function ($restaurant) {
                return [
                    'id' => $restaurant->id,
                    'name' => $restaurant->name,
                    'description' => $restaurant->description,
                    'cuisine_type' => $restaurant->cuisine_type,
                    'city' => $restaurant->city,
                    'address' => $restaurant->address,
                    'phone_number' => $restaurant->phone_number,
                    'delivery_fee' => $restaurant->delivery_fee,
                    'minimum_order' => $restaurant->minimum_order,
                    'delivery_range_km' => $restaurant->delivery_range_km,
                    'opening_hours' => $restaurant->opening_hours ? $restaurant->opening_hours->format('H:i') : null,
                    'closing_hours' => $restaurant->closing_hours ? $restaurant->closing_hours->format('H:i') : null,
                    'owner_name' => $restaurant->user->name,
                    'image' => $restaurant->media->first() ? '/storage/restaurants/' . $restaurant->id . '/' . $restaurant->media->first()->filename : null,
                ];
            });

        return Inertia::render('Welcome', [
            'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
            'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
            'laravelVersion' => \Illuminate\Foundation\Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'restaurants' => $restaurants,
            'searchAddress' => $searchAddress,
            'locationiqApiKey' => config('locationiq.api_key'),
        ]);
    }

    public function show(Restaurant $restaurant)
    {
        if (!$restaurant->is_accepted) {
            abort(404);
        }

        $restaurant->load(['menuCategories.menuItems.media', 'media', 'user']);

        return Inertia::render('Restaurant/Show', [
            'restaurant' => [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'description' => $restaurant->description,
                'cuisine_type' => $restaurant->cuisine_type,
                'city' => $restaurant->city,
                'address' => $restaurant->address,
                'phone_number' => $restaurant->phone_number,
                'delivery_fee' => $restaurant->delivery_fee,
                'minimum_order' => $restaurant->minimum_order,
                'opening_hours' => $restaurant->opening_hours ? $restaurant->opening_hours->format('H:i') : null,
                'closing_hours' => $restaurant->closing_hours ? $restaurant->closing_hours->format('H:i') : null,
                'owner_name' => $restaurant->user->name,
                'image' => $restaurant->media->first() ? '/storage/restaurants/' . $restaurant->id . '/' . $restaurant->media->first()->filename : null,
                'menuCategories' => $restaurant->menuCategories->map(function ($category) use ($restaurant) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'description' => $category->description,
                        'menuItems' => $category->menuItems->map(function ($item) use ($restaurant) {
                            return [
                                'id' => $item->id,
                                'name' => $item->name,
                                'description' => $item->description,
                                'price' => $item->price,
                                'image' => $item->media ? '/storage/restaurants/' . $restaurant->id . '/' . $item->media->filename : null,
                            ];
                        }),
                    ];
                }),
            ],
        ]);
    }
}

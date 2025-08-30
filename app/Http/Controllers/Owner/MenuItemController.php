<?php

namespace App\Http\Controllers\Owner;

use App\Models\MenuItem;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class MenuItemController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        if (!$user->restaurant) {
            abort(403, 'No restaurant found for this user.');
        }

        $menuItems = $user->restaurant->menuItems()
            ->with(['menuCategory', 'media'])
            ->prioritized()
            ->get();

        return Inertia::render('Owner/MenuItems/Index', [
            'menuItems' => $menuItems,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        
        if (!$user->restaurant) {
            abort(403, 'No restaurant found for this user.');
        }
        
        if (!$user->restaurant->is_accepted) {
            abort(403, 'Restaurant must be approved before creating menu items.');
        }

        $categories = MenuCategory::where('restaurant_id', $user->restaurant->id)->get();
        $media = $user->restaurant->media()->latest()->get();

        return Inertia::render('Owner/MenuItems/Create', [
            'categories' => $categories,
            'media' => $media,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->restaurant) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'No restaurant found for this user.'], 403);
            }
            abort(403, 'No restaurant found for this user.');
        }

        $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'menu_category_id' => 'required|exists:menu_categories,id',
            'media_id' => 'nullable|exists:media,id',
            'priority' => 'nullable|integer|in:0,1,2,3',
            'is_available' => 'nullable|boolean',
        ]);

        // Verify that the media belongs to the restaurant if provided
        if ($request->media_id) {
            $media = \App\Models\Media::find($request->media_id);
            if (!$media || $media->restaurant_id !== $user->restaurant->id) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Selected image does not belong to your restaurant.'], 403);
                }
                return back()->withErrors(['media_id' => 'Selected image does not belong to your restaurant.']);
            }
        }

        $item = MenuItem::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'menu_category_id' => $request->menu_category_id,
            'media_id' => $request->media_id,
            'restaurant_id' => $user->restaurant->id,
            'priority' => $request->priority ?? 0,
            'is_available' => $request->is_available ?? true,
        ]);
        if ($request->wantsJson()) {
            return response()->json($item, 201);
        }
        return redirect()->route('owner.menu-items.index')->with('success', 'Menu item created.');
    }

    public function edit(MenuItem $menuItem)
    {
        $user = Auth::user();
        
        if (!$user->restaurant) {
            abort(403, 'No restaurant found for this user.');
        }
        
        // Check if the menu item belongs to the user's restaurant
        if ($menuItem->restaurant_id !== $user->restaurant->id) {
            abort(403, 'You can only edit menu items from your own restaurant.');
        }

        $categories = MenuCategory::where('restaurant_id', $user->restaurant->id)->get();
        $media = $user->restaurant->media()->latest()->get();

        // Load the media relationship
        $menuItem->load('media');

        return Inertia::render('Owner/MenuItems/Edit', [
            'menuItem' => $menuItem,
            'categories' => $categories,
            'media' => $media,
        ]);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $user = Auth::user();
        
        if (!$user->restaurant) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'No restaurant found for this user.'], 403);
            }
            abort(403, 'No restaurant found for this user.');
        }
        // Check if the menu item belongs to the user's restaurant
        if ($menuItem->restaurant_id !== $user->restaurant->id) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'You can only update menu items from your own restaurant.'], 403);
            }
            abort(403, 'You can only update menu items from your own restaurant.');
        }

        $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'menu_category_id' => 'required|exists:menu_categories,id',
            'media_id' => 'nullable|exists:media,id',
            'priority' => 'nullable|integer|in:0,1,2,3',
            'is_available' => 'nullable|boolean',
        ]);

        // Verify that the media belongs to the restaurant if provided
        if ($request->media_id) {
            $media = \App\Models\Media::find($request->media_id);
            if (!$media || $media->restaurant_id !== $user->restaurant->id) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Selected image does not belong to your restaurant.'], 403);
                }
                return back()->withErrors(['media_id' => 'Selected image does not belong to your restaurant.']);
            }
        }

        $menuItem->update([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'menu_category_id' => $request->menu_category_id,
            'media_id' => $request->media_id,
            'priority' => $request->priority ?? 0,
            'is_available' => $request->is_available ?? true,
        ]);
        if ($request->wantsJson()) {
            return response()->json($menuItem, 200);
        }
        return redirect()->route('owner.menu-items.index')->with('success', 'Menu item updated.');
    }

    public function destroy(MenuItem $menuItem)
    {
        $user = Auth::user();
        
        if (!$user->restaurant) {
            if (request()->wantsJson()) {
                return response()->json(['message' => 'No restaurant found for this user.'], 403);
            }
            abort(403, 'No restaurant found for this user.');
        }
        // Check if the menu item belongs to the user's restaurant
        if ($menuItem->restaurant_id !== $user->restaurant->id) {
            if (request()->wantsJson()) {
                return response()->json(['message' => 'You can only delete menu items from your own restaurant.'], 403);
            }
            abort(403, 'You can only delete menu items from your own restaurant.');
        }

        $menuItem->delete();
        if (request()->wantsJson()) {
            return response()->json(['success' => true], 200);
        }
        return redirect()->route('owner.menu-items.index')->with('success', 'Menu item deleted.');
    }
}


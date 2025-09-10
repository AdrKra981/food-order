<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuCategoryController extends Controller
{
    public function index()
    {
        $categories = MenuCategory::whereHas('restaurant', function ($q) {
            $q->where('user_id', auth()->id());
        })->with('restaurant')
            ->withCount('menuItems')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Owner/MenuCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Owner/MenuCategories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'priority' => 'sometimes|integer|in:0,1,2,3',
            'is_available' => 'sometimes|boolean',
        ]);

        $restaurant = auth()->user()->restaurant;

        // Set defaults if not provided
        $validated['priority'] = $validated['priority'] ?? 0;
        $validated['is_available'] = $validated['is_available'] ?? true;

        $category = $restaurant->menuCategories()->create($validated);
        if ($request->wantsJson()) {
            return response()->json($category, 201);
        }

        return redirect()->route('owner.menu-categories.index');
    }

    public function edit(MenuCategory $menuCategory)
    {
        $this->authorize('update', $menuCategory);

        return Inertia::render('Owner/MenuCategories/Edit', [
            'category' => $menuCategory,
        ]);
    }

    public function update(Request $request, MenuCategory $menuCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'sort_order' => 'required|integer|min:0',
            'priority' => 'sometimes|integer|in:0,1,2,3',
            'is_available' => 'sometimes|boolean',
        ]);

        $menuCategory->update($validated);
        if ($request->wantsJson()) {
            return response()->json($menuCategory, 200);
        }

        return redirect()->route('owner.menu-categories.index');
    }

    public function destroy(MenuCategory $menuCategory)
    {
        $this->authorize('delete', $menuCategory);

        // Check if category has menu items
        if ($menuCategory->menuItems()->count() > 0) {
            if (request()->wantsJson()) {
                return response()->json([
                    'message' => 'Cannot delete category that contains menu items. Please remove all items first.',
                ], 422);
            }

            return back()->withErrors([
                'message' => 'Cannot delete category that contains menu items. Please remove all items first.',
            ]);
        }

        $menuCategory->delete();
        if (request()->wantsJson()) {
            return response()->json(['success' => true], 200);
        }

        return redirect()->route('owner.menu-categories.index')->with('success', 'Category deleted successfully.');
    }

    public function toggleAvailability(MenuCategory $menuCategory)
    {
        $this->authorize('update', $menuCategory);

        $menuCategory->update([
            'is_available' => ! $menuCategory->is_available,
        ]);

        return response()->json([
            'success' => true,
            'is_available' => $menuCategory->is_available,
        ]);
    }
}

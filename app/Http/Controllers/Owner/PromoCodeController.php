<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromoCodeController extends Controller
{
    public function index(Request $request)
    {
        $restaurant = $request->user()->restaurant;
        
        $promoCodes = PromoCode::where('restaurant_id', $restaurant->id)
            ->with('usages')
            ->latest()
            ->paginate(10);

        return Inertia::render('Owner/PromoCodes/Index', [
            'promoCodes' => $promoCodes,
        ]);
    }

    public function create(Request $request)
    {
        $restaurant = $request->user()->restaurant;
        $categories = MenuCategory::where('restaurant_id', $restaurant->id)->get();

        return Inertia::render('Owner/PromoCodes/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $restaurant = $request->user()->restaurant;

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed_amount',
            'discount_value' => 'required|numeric|min:0',
            'minimum_order_amount' => 'required|numeric|min:0',
            'maximum_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit_per_customer' => 'nullable|integer|min:1',
            'total_usage_limit' => 'nullable|integer|min:1',
            'applicable_categories' => 'nullable|array',
            'applicable_categories.*' => 'exists:menu_categories,id',
            'is_active' => 'boolean',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
        ]);

        // Validation for percentage discount
        if ($validated['discount_type'] === 'percentage' && $validated['discount_value'] > 100) {
            return back()->withErrors(['discount_value' => 'Percentage discount cannot exceed 100%.']);
        }

        $validated['restaurant_id'] = $restaurant->id;
        $validated['used_count'] = 0;

        PromoCode::create($validated);

        return redirect()->route('owner.promo-codes.index')
            ->with('success', 'Promo code created successfully!');
    }

    public function show(PromoCode $promoCode)
    {
        $this->authorize('view', $promoCode);

        $promoCode->load(['usages.user', 'usages.order']);

        return Inertia::render('Owner/PromoCodes/Show', [
            'promoCode' => $promoCode,
        ]);
    }

    public function edit(PromoCode $promoCode)
    {
        $this->authorize('update', $promoCode);

        $categories = MenuCategory::where('restaurant_id', $promoCode->restaurant_id)->get();

        return Inertia::render('Owner/PromoCodes/Edit', [
            'promoCode' => $promoCode,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, PromoCode $promoCode)
    {
        $this->authorize('update', $promoCode);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code,' . $promoCode->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed_amount',
            'discount_value' => 'required|numeric|min:0',
            'minimum_order_amount' => 'required|numeric|min:0',
            'maximum_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit_per_customer' => 'nullable|integer|min:1',
            'total_usage_limit' => 'nullable|integer|min:1',
            'applicable_categories' => 'nullable|array',
            'applicable_categories.*' => 'exists:menu_categories,id',
            'is_active' => 'boolean',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
        ]);

        // Validation for percentage discount
        if ($validated['discount_type'] === 'percentage' && $validated['discount_value'] > 100) {
            return back()->withErrors(['discount_value' => 'Percentage discount cannot exceed 100%.']);
        }

        $promoCode->update($validated);

        return redirect()->route('owner.promo-codes.index')
            ->with('success', 'Promo code updated successfully!');
    }

    public function destroy(PromoCode $promoCode)
    {
        $this->authorize('delete', $promoCode);

        $promoCode->delete();

        return redirect()->route('owner.promo-codes.index')
            ->with('success', 'Promo code deleted successfully!');
    }
}

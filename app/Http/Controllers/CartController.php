<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\MenuItem;
use App\Services\DeliveryValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cartItems = $this->getCartItems();
        
        // Group items by restaurant
        $cartByRestaurant = $cartItems->groupBy('restaurant_id')->map(function ($items) {
            $restaurant = $items->first()->restaurant;
            $total = $items->sum('total');
            
            return [
                'restaurant' => $restaurant,
                'items' => $items,
                'total' => $total,
                'item_count' => $items->sum('quantity')
            ];
        });

        $grandTotal = $cartItems->sum('total');
        $totalItems = $cartItems->sum('quantity');

        return response()->json([
            'cart_by_restaurant' => $cartByRestaurant->values(),
            'grand_total' => $grandTotal,
            'total_items' => $totalItems,
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity' => 'required|integer|min:1|max:10',
            'notes' => 'nullable|string|max:500',
        ]);

        $menuItem = MenuItem::with('restaurant')->findOrFail($request->menu_item_id);
        
        // Check if item already exists in cart
        $existingItem = CartItem::forUserOrSession(
            Auth::id(),
            session()->getId()
        )->where('menu_item_id', $request->menu_item_id)->first();

        if ($existingItem) {
            // Update quantity
            $existingItem->update([
                'quantity' => $existingItem->quantity + $request->quantity,
                'notes' => $request->notes ?? $existingItem->notes,
            ]);
        } else {
            // Create new cart item
            CartItem::create([
                'user_id' => Auth::id(),
                'session_id' => Auth::guest() ? session()->getId() : null,
                'menu_item_id' => $request->menu_item_id,
                'restaurant_id' => $menuItem->restaurant_id,
                'quantity' => $request->quantity,
                'price' => $menuItem->price,
                'notes' => $request->notes,
            ]);
        }

        return response()->json([
            'message' => 'Item added to cart successfully',
            'cart_count' => $this->getCartCount(),
        ]);
    }

    public function update(Request $request, CartItem $cartItem)
    {
        // Ensure user owns this cart item
        if (!$this->userOwnsCartItem($cartItem)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1|max:10',
            'notes' => 'nullable|string|max:500',
        ]);

        $cartItem->update([
            'quantity' => $request->quantity,
            'notes' => $request->notes ?? $cartItem->notes,
        ]);

        return response()->json([
            'message' => 'Cart item updated successfully',
            'cart_count' => $this->getCartCount(),
        ]);
    }

    public function remove(CartItem $cartItem)
    {
        // Ensure user owns this cart item
        if (!$this->userOwnsCartItem($cartItem)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Item removed from cart',
            'cart_count' => $this->getCartCount(),
        ]);
    }

    public function clear(Request $request)
    {
        $restaurantId = $request->get('restaurant_id');
        
        $query = CartItem::forUserOrSession(Auth::id(), session()->getId());
        
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }
        
        $query->delete();

        return response()->json([
            'message' => $restaurantId ? 'Restaurant cart cleared' : 'Cart cleared successfully',
            'cart_count' => $this->getCartCount(),
        ]);
    }

    public function count()
    {
        return response()->json([
            'count' => $this->getCartCount(),
        ]);
    }

    private function getCartItems()
    {
        return CartItem::forUserOrSession(Auth::id(), session()->getId())
            ->groupedByRestaurant()
            ->get();
    }

    private function getCartCount()
    {
        return CartItem::forUserOrSession(Auth::id(), session()->getId())
            ->sum('quantity');
    }

    private function userOwnsCartItem(CartItem $cartItem)
    {
        if (Auth::check()) {
            return $cartItem->user_id === Auth::id();
        }
        
        return $cartItem->session_id === session()->getId();
    }

    /**
     * Validate delivery address for all restaurants in cart
     */
    public function validateDelivery(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $cartItems = $this->getCartItems();
        
        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty'
            ], 400);
        }

        // Group items by restaurant
        $cartByRestaurant = $cartItems->groupBy('restaurant_id')->map(function ($items) {
            $restaurant = $items->first()->restaurant;
            
            return [
                'restaurant' => $restaurant,
                'items' => $items,
            ];
        });

        $deliveryService = new DeliveryValidationService();
        $validation = $deliveryService->validateCartDelivery(
            $cartByRestaurant->toArray(),
            $request->lat,
            $request->lng
        );

        return response()->json([
            'success' => true,
            'data' => $validation
        ]);
    }
}

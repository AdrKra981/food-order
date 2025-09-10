<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'promo_code' => 'nullable|string',
            'customer_name' => 'required|string',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
            'delivery_type' => 'required|string',
            'delivery_address' => 'required_if:delivery_type,delivery|string|nullable',
            'payment_method' => 'required|string',
        ]);

        $user = Auth::user();
        $restaurantId = $data['restaurant_id'];
        $items = $data['items'];
        $promoCode = null;
        $discount = 0;
        $promoCodeId = null;
        $promoCodeUsed = null;

        $subtotal = 0;
        foreach ($items as $item) {
            $menuItem = \App\Models\MenuItem::findOrFail($item['menu_item_id']);
            if (! $menuItem->is_available) {
                return response()->json(['message' => 'One or more menu items are unavailable.'], 422);
            }
            $subtotal += $menuItem->price * $item['quantity'];
        }

        if (! empty($data['promo_code'])) {
            $promo = \App\Models\PromoCode::where('code', $data['promo_code'])
                ->where('restaurant_id', $restaurantId)
                ->first();
            if (! $promo || ! $promo->isValid() || $subtotal < $promo->minimum_order_amount || $promo->isUsageLimitReached() || ! $promo->canCustomerUse($user->id)) {
                return response()->json(['message' => 'Invalid or expired promo code.'], 422);
            }
            $discount = $promo->calculateDiscount($subtotal);
            $promoCodeId = $promo->id;
            $promoCodeUsed = $promo->code;
        }

        $order = Order::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurantId,
            'order_number' => 'ORD'.now()->format('YmdHis').rand(100, 999),
            'total_amount' => $subtotal - $discount,
            'status' => \App\Enums\OrderStatus::PENDING,
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'customer_phone' => $data['customer_phone'],
            'delivery_type' => $data['delivery_type'],
            'delivery_address' => $data['delivery_address'] ?? null,
            'payment_method' => $data['payment_method'],
            'promo_code_id' => $promoCodeId,
            'promo_code_used' => $promoCodeUsed,
            'discount_amount' => $discount,
            'subtotal_amount' => $subtotal,
        ]);

        foreach ($items as $item) {
            $menuItem = \App\Models\MenuItem::findOrFail($item['menu_item_id']);
            $order->orderItems()->create([
                'menu_item_id' => $menuItem->id,
                'quantity' => $item['quantity'],
                'price' => $menuItem->price,
            ]);
        }

        $order = $order->fresh(['orderItems']);
        $orderArr = $order->toArray();
        $orderArr['discount_amount'] = (float) $orderArr['discount_amount'];
        $orderArr['total_amount'] = (float) $orderArr['total_amount'];
        $orderArr['subtotal_amount'] = (float) $orderArr['subtotal_amount'];

        return response()->json($orderArr, 201);
    }

    public function index()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['restaurant', 'orderItems.menuItem.media', 'orderItems.menuItem.menuCategory'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Customer/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order)
    {
        // Ensure the order belongs to the current user
        if ($order->user_id !== Auth::id()) {
            abort(404);
        }

        $order->load(['restaurant', 'orderItems.menuItem.media', 'orderItems.menuItem.menuCategory']);

        if (request()->wantsJson()) {
            return response()->json($order);
        }

        return Inertia::render('Customer/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function reorder(Order $order)
    {
        // Ensure the order belongs to the current user
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->load(['orderItems.menuItem']);

        DB::beginTransaction();

        try {
            // Clear existing cart items for this user
            CartItem::forUserOrSession(Auth::id(), session()->getId())->delete();

            // Add order items to cart
            foreach ($order->orderItems as $orderItem) {
                // Check if menu item is still available
                if ($orderItem->menuItem && $orderItem->menuItem->is_available) {
                    CartItem::create([
                        'user_id' => Auth::id(),
                        'session_id' => session()->getId(),
                        'restaurant_id' => $order->restaurant_id,
                        'menu_item_id' => $orderItem->menu_item_id,
                        'quantity' => $orderItem->quantity,
                        'price' => $orderItem->menuItem->price, // Use current price
                        'special_instructions' => $orderItem->special_instructions,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Items added to cart successfully!',
                'redirect' => route('restaurants.show', $order->restaurant_id),
            ]);

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json(['message' => 'Failed to reorder items'], 500);
        }
    }
}

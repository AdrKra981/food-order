<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Events\OrderCreated;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PromoCode;
use App\Services\PromoCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    protected $promoCodeService;

    public function __construct(PromoCodeService $promoCodeService)
    {
        $this->promoCodeService = $promoCodeService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'delivery_type' => 'required|in:delivery,pickup',
            'payment_method' => 'required|in:cash,card,online',
            'street' => 'required_if:delivery_type,delivery|string|max:255',
            'city' => 'required_if:delivery_type,delivery|string|max:255',
            'postal_code' => 'required_if:delivery_type,delivery|string|max:10',
            'notes' => 'nullable|string|max:1000',
            'promo_code_id' => 'nullable|exists:promo_codes,id',
            'promo_code' => 'nullable|string|max:50',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        // Get cart items
        $cartItems = CartItem::forUserOrSession(Auth::id(), session()->getId())
            ->with(['menuItem', 'restaurant'])
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Validate and apply promo code if provided
        $appliedPromoCode = null;
        $totalDiscountAmount = 0;

        if (! empty($validated['promo_code_id'])) {
            $promoCode = PromoCode::find($validated['promo_code_id']);

            if (! $promoCode || ! $promoCode->isValid() || ! $promoCode->canCustomerUse(Auth::id())) {
                return response()->json(['message' => 'Invalid or expired promo code'], 400);
            }

            $appliedPromoCode = $promoCode;
        }

        DB::beginTransaction();

        try {
            // Group cart items by restaurant
            $cartByRestaurant = $cartItems->groupBy('restaurant_id');

            $orders = [];

            foreach ($cartByRestaurant as $restaurantId => $items) {
                $restaurant = $items->first()->restaurant;
                $subtotal = $items->sum(function ($item) {
                    return $item->quantity * $item->price;
                });

                // Apply promo code discount if applicable
                $discountAmount = 0.0;
                $totalAmount = $subtotal;

                if ($appliedPromoCode && $appliedPromoCode->restaurant_id == $restaurantId) {
                    $calc = $this->promoCodeService->calculateCartDiscount($appliedPromoCode, $items);
                    if (is_array($calc)) {
                        $discountAmount = (float) ($calc['discount'] ?? 0);
                    } else {
                        $discountAmount = (float) $calc;
                    }
                    $totalAmount = (float) $subtotal - $discountAmount;
                    $totalDiscountAmount += $discountAmount;
                }

                // Create order for this restaurant
                $order = Order::create([
                    'user_id' => Auth::id(),
                    'restaurant_id' => $restaurantId,
                    'order_number' => $this->generateOrderNumber(),
                    'status' => OrderStatus::PENDING,
                    'total_amount' => $totalAmount,
                    'customer_name' => $request->first_name.' '.$request->last_name,
                    'customer_email' => $request->email,
                    'customer_phone' => $request->phone,
                    'delivery_type' => $request->delivery_type,
                    'delivery_address' => $request->delivery_type === 'delivery' ?
                        $request->street.', '.$request->city.', '.$request->postal_code : null,
                    'payment_method' => $request->payment_method,
                    'notes' => $request->notes,
                    'promo_code_id' => $appliedPromoCode ? $appliedPromoCode->id : null,
                    'promo_code' => $appliedPromoCode ? $appliedPromoCode->code : null,
                    'discount_amount' => $discountAmount,
                ]);

                // Create order items
                foreach ($items as $cartItem) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'menu_item_id' => $cartItem->menu_item_id,
                        'quantity' => $cartItem->quantity,
                        'price' => $cartItem->price,
                        'notes' => $cartItem->notes,
                    ]);
                }

                $orders[] = $order;
                // broadcast per-restaurant new order
                event(new OrderCreated($order));
            }

            // Record promo code usage if applied
            if ($appliedPromoCode) {
                $this->promoCodeService->applyPromoCode($appliedPromoCode, Auth::id(), $orders[0]);
            }

            // Clear cart after successful order creation
            CartItem::forUserOrSession(Auth::id(), session()->getId())->delete();

            DB::commit();

            // Store order numbers in session for success page
            $orderNumbers = collect($orders)->pluck('order_number')->implode(', ');
            session()->flash('order_numbers', $orderNumbers);

            return redirect()->route('orders.success');

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json(['message' => 'Failed to place order'], 500);
        }
    }

    private function generateOrderNumber()
    {
        return 'FG'.date('Ymd').str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    }

    public function index()
    {
        $orders = Order::with(['restaurant', 'orderItems.menuItem'])
            ->where('user_id', Auth::id())
            ->orWhere('customer_email', request()->get('email'))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function show(Order $order)
    {
        // Ensure user can view this order
        if ($order->user_id !== Auth::id() && $order->customer_email !== request()->get('email')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->load(['restaurant', 'orderItems.menuItem']);

        return response()->json($order);
    }
}

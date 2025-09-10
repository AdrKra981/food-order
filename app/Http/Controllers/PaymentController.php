<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PromoCode;
use App\Services\PromoCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    protected $promoCodeService;

    public function __construct(PromoCodeService $promoCodeService)
    {
        $this->promoCodeService = $promoCodeService;
        Stripe::setApiKey(config('stripe.secret_key'));
    }

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'delivery_type' => 'required|in:delivery,pickup',
            'payment_method' => 'required|in:online,blik',
            'street' => 'required_if:delivery_type,delivery|string|max:255',
            'city' => 'required_if:delivery_type,delivery|string|max:255',
            'postal_code' => 'required_if:delivery_type,delivery|string|max:10',
            'notes' => 'nullable|string|max:1000',
            'promo_code_id' => 'nullable|exists:promo_codes,id',
            'promo_code' => 'nullable|string|max:50',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        try {
            // Get cart items
            $cartItems = CartItem::forUserOrSession(Auth::id(), session()->getId())
                ->with(['menuItem', 'restaurant'])
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json(['error' => 'Cart is empty'], 400);
            }

            // Calculate total amount
            $subtotal = $cartItems->sum(function ($item) {
                return $item->quantity * $item->price;
            });

            $totalAmount = $subtotal;
            $discountAmount = 0;

            // Apply promo code discount if provided
            if ($request->promo_code_id) {
                $promoCode = PromoCode::find($request->promo_code_id);

                if ($promoCode && $promoCode->isValid() && $promoCode->canCustomerUse(Auth::id())) {
                    $discountAmount = $this->promoCodeService->calculateCartDiscount($promoCode, $cartItems);
                    $totalAmount = $subtotal - $discountAmount;
                }
            }

            // Convert to cents (Stripe requires amount in smallest currency unit)
            $amountInCents = (int) ($totalAmount * 100);

            // Configure payment methods based on selection
            $paymentMethodTypes = ['card']; // Default to card
            if ($request->payment_method === 'blik') {
                $paymentMethodTypes = ['blik'];
            }

            // Create PaymentIntent
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => config('stripe.currency'),
                'payment_method_types' => $paymentMethodTypes,
                'metadata' => [
                    'user_id' => Auth::id(),
                    'session_id' => session()->getId(),
                    'customer_name' => $request->first_name.' '.$request->last_name,
                    'customer_email' => $request->email,
                    'delivery_type' => $request->delivery_type,
                    'payment_method_type' => $request->payment_method,
                    'subtotal' => $subtotal,
                    'discount_amount' => $discountAmount,
                    'promo_code_id' => $request->promo_code_id,
                    'promo_code' => $request->promo_code,
                ],
            ]);

            // Store payment data in session for order creation after successful payment
            session([
                'payment_data' => $request->all(),
                'payment_intent_id' => $paymentIntent->id,
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'amount' => $totalAmount,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
            ]);

        } catch (ApiErrorException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Payment setup failed'], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            // Retrieve the PaymentIntent
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            if ($paymentIntent->status !== 'succeeded') {
                return response()->json(['error' => 'Payment not completed'], 400);
            }

            // Get stored payment data from session
            $paymentData = session('payment_data');
            $storedPaymentIntentId = session('payment_intent_id');

            if (! $paymentData || $storedPaymentIntentId !== $request->payment_intent_id) {
                return response()->json(['error' => 'Invalid payment session'], 400);
            }

            // Create orders (same logic as OrderController but with payment status)
            $cartItems = CartItem::forUserOrSession(Auth::id(), session()->getId())
                ->with(['menuItem', 'restaurant'])
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json(['error' => 'Cart is empty'], 400);
            }

            DB::beginTransaction();

            try {
                $cartByRestaurant = $cartItems->groupBy('restaurant_id');
                $orders = [];

                foreach ($cartByRestaurant as $restaurantId => $items) {
                    $totalAmount = $items->sum(function ($item) {
                        return $item->quantity * $item->price;
                    });

                    // Create order
                    $order = Order::create([
                        'user_id' => Auth::id(),
                        'restaurant_id' => $restaurantId,
                        'order_number' => $this->generateOrderNumber(),
                        'status' => OrderStatus::PENDING,
                        'total_amount' => $totalAmount,
                        'customer_name' => $paymentData['first_name'].' '.$paymentData['last_name'],
                        'customer_email' => $paymentData['email'],
                        'customer_phone' => $paymentData['phone'],
                        'delivery_type' => $paymentData['delivery_type'],
                        'delivery_address' => $paymentData['delivery_type'] === 'delivery' ?
                            $paymentData['street'].', '.$paymentData['city'].', '.$paymentData['postal_code'] : null,
                        'payment_method' => 'online',
                        'payment_status' => 'completed',
                        'payment_intent_id' => $request->payment_intent_id,
                        'notes' => $paymentData['notes'] ?? null,
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
                }

                // Clear cart and session data
                CartItem::forUserOrSession(Auth::id(), session()->getId())->delete();
                session()->forget(['payment_data', 'payment_intent_id']);

                DB::commit();

                $orderNumbers = collect($orders)->pluck('order_number')->implode(', ');
                session()->flash('order_numbers', $orderNumbers);

                return response()->json([
                    'success' => true,
                    'orders' => $orders,
                    'redirect_url' => route('orders.success'),
                ]);

            } catch (\Exception $e) {
                DB::rollback();

                return response()->json(['error' => 'Failed to create orders'], 500);
            }

        } catch (ApiErrorException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function generateOrderNumber()
    {
        return 'FG'.date('Ymd').str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    }
}

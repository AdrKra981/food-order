<?php
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\RestaurantApprovalController;
use App\Http\Controllers\Auth\ForcedPasswordChangeController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Owner\EmployeeController;
use App\Http\Controllers\Owner\MediaController;
use App\Http\Controllers\Owner\MenuCategoryController;
use App\Http\Controllers\Owner\MenuItemController;
use App\Http\Controllers\Owner\OrderController as OwnerOrderController;
use App\Http\Controllers\Owner\PromoCodeController;
use App\Http\Controllers\Owner\ReportsController;
use App\Http\Controllers\Owner\WorkScheduleController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Restaurant Management API for tests (for feature tests only)
Route::middleware('auth')->group(function () {
    Route::post('/restaurants', [\App\Http\Controllers\RestaurantController::class, 'store']);
    Route::patch('/restaurants/{id}/approve', [\App\Http\Controllers\RestaurantController::class, 'approve']);
    Route::put('/restaurants/{id}', [\App\Http\Controllers\RestaurantController::class, 'update']);
    Route::delete('/restaurants/{id}', [\App\Http\Controllers\RestaurantController::class, 'destroy']);
});

Route::get('/', [HomeController::class, 'index']);
Route::get('/restaurant/{restaurant}', [HomeController::class, 'show'])->name('restaurant.show');

// Locale switch endpoint (stores chosen locale in session)
Route::post('/locale', [App\Http\Controllers\LocaleController::class, 'store'])->name('locale.store');

// Debug route to test CSRF token
Route::post('/api/test-csrf', function () {
    return response()->json(['message' => 'CSRF token is working!', 'timestamp' => now()]);
});

// Cart routes (available for both guests and authenticated users)

Route::prefix('api/cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/add', [CartController::class, 'add'])->name('add');
    Route::put('/{cartItem}', [CartController::class, 'update'])->name('update');
    Route::delete('/{cartItem}', [CartController::class, 'remove'])->name('remove');
    Route::delete('/', [CartController::class, 'clear'])->name('clear');
    Route::get('/count', [CartController::class, 'count'])->name('count');
    Route::post('/validate-delivery', [CartController::class, 'validateDelivery'])->name('validate-delivery');
});

// Promo code application route (for feature/API tests)
use App\Http\Controllers\PromoCodeApplicationController;
Route::post('/api/orders/apply-promo', [PromoCodeApplicationController::class, 'apply'])->name('orders.apply-promo');

// Promo code validation API (requires auth)
Route::middleware('auth')->prefix('api/promo-codes')->name('api.promo-codes.')->group(function () {
    Route::post('/validate', [App\Http\Controllers\Api\PromoCodeController::class, 'validate'])->name('validate');
});

// Checkout route
Route::get('/checkout', function () {
    return Inertia::render('Checkout', [
        'stripePublicKey' => config('stripe.public_key'),
    ]);
})->name('checkout');

Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.store');

// Stripe Payment Routes
Route::post('/payment/create-intent', [PaymentController::class, 'createPaymentIntent'])->name('payment.create-intent');
Route::post('/payment/confirm', [PaymentController::class, 'confirmPayment'])->name('payment.confirm');

Route::get('/orders/success', function () {
    return Inertia::render('OrderSuccess', [
        'orderNumbers' => session('order_numbers', ''),
    ]);
})->name('orders.success');

Route::get('/dashboard', function () {
    $user = Auth::user();

    // Redirect based on user role
    switch ($user->role) {
        case App\Enums\UserRole::ADMIN:
            return redirect()->route('admin.dashboard');
        case App\Enums\UserRole::OWNER:
            return redirect()->route('owner.dashboard');
        case App\Enums\UserRole::EMPLOYEE:
            return redirect()->route('employee.orders.index');
        case App\Enums\UserRole::CLIENT:
        default:
            return redirect()->route('customer.orders.index');
    }
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Force password change on first login
    Route::get('/password/force-change', [ForcedPasswordChangeController::class, 'show'])->name('password.force-change.show');
    Route::post('/password/force-change', [ForcedPasswordChangeController::class, 'update'])->name('password.force-change.update');

    // Customer Orders
    Route::prefix('customer')->name('customer.')->group(function () {
        Route::get('/orders', [App\Http\Controllers\Customer\OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [App\Http\Controllers\Customer\OrderController::class, 'show'])->name('orders.show');
        Route::post('/orders', [App\Http\Controllers\Customer\OrderController::class, 'store'])->name('orders.store');
        Route::post('/orders/{order}/reorder', [App\Http\Controllers\Customer\OrderController::class, 'reorder'])->name('orders.reorder');
    });

    // Debug route - remove after testing
    Route::get('/debug-user', function () {
        $user = Auth::user();

        return response()->json([
            'user' => $user,
            'restaurant' => $user->restaurant,
            'role' => $user->role->value ?? 'no role',
        ]);
    });
});

// Employee routes
Route::middleware(['auth', 'verified', 'is_employee'])
    ->prefix('employee')
    ->name('employee.')
    ->group(function () {
        Route::get('/orders', [\App\Http\Controllers\Employee\OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [\App\Http\Controllers\Employee\OrderController::class, 'show'])->name('orders.show');
        Route::patch('/orders/{order}/status', [\App\Http\Controllers\Employee\OrderController::class, 'updateStatus'])->name('orders.update-status');
    });

Route::middleware(['auth', 'verified', 'is_admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');

    // Restaurant Management
    Route::get('/restaurants', [AdminController::class, 'restaurants'])->name('admin.restaurants');
    Route::post('/restaurants/{restaurant}/toggle-status', [AdminController::class, 'toggleRestaurantStatus'])->name('admin.restaurants.toggle-status');
    Route::delete('/restaurants/{restaurant}', [AdminController::class, 'deleteRestaurant'])->name('admin.restaurants.delete');

    // Pending Restaurant Approvals (existing functionality)
    Route::get('/restaurants/pending', [RestaurantApprovalController::class, 'index'])->name('admin.restaurants.pending');
    Route::post('/restaurants/{restaurant}/accept', [RestaurantApprovalController::class, 'accept'])->name('admin.restaurants.accept');
    Route::post('/restaurants/{restaurant}/reject', [RestaurantApprovalController::class, 'reject'])->name('admin.restaurants.reject');
});

Route::get('/owner/awaiting-approval', function () {
    return Inertia::render('Owner/AwaitingApproval');
})->name('owner.awaiting-approval');

Route::middleware(['auth', 'verified', 'owner.approved'])->prefix('owner')->name('owner.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Owner\DashboardController::class, 'index'])->name('dashboard');

    // Restaurant settings
    Route::get('/restaurant/edit', [App\Http\Controllers\Owner\RestaurantController::class, 'edit'])->name('restaurant.edit');
    Route::put('/restaurant', [App\Http\Controllers\Owner\RestaurantController::class, 'update'])->name('restaurant.update');

    // Reports
    Route::get('/reports', [ReportsController::class, 'index'])->name('reports');

    // Orders
    Route::get('/orders', [OwnerOrderController::class, 'index'])->name('orders');
    Route::patch('/orders/{order}/status', [OwnerOrderController::class, 'updateStatus'])->name('orders.update-status');

    Route::resource('media', MediaController::class);
    Route::delete('/media-bulk', [MediaController::class, 'bulkDestroy'])->name('media.bulk-destroy');
    Route::get('/media-api', [MediaController::class, 'api'])->name('media.api');
    Route::resource('menu-categories', MenuCategoryController::class)->except(['show']);
    Route::patch('menu-categories/{menuCategory}/toggle-availability', [MenuCategoryController::class, 'toggleAvailability'])->name('menu-categories.toggle-availability');
    Route::resource('menu-items', MenuItemController::class)->except(['show']);
    Route::resource('promo-codes', PromoCodeController::class);
    // Employees management
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::patch('/employees/{employee}/toggle', [EmployeeController::class, 'toggleActive'])->name('employees.toggle');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');

    // Work schedule
    Route::get('/employees/schedule', [WorkScheduleController::class, 'index'])->name('employees.schedule');
    Route::post('/shifts', [WorkScheduleController::class, 'store'])->name('shifts.store');
    Route::patch('/shifts/{shift}', [WorkScheduleController::class, 'update'])->name('shifts.update');
    Route::delete('/shifts/{shift}', [WorkScheduleController::class, 'destroy'])->name('shifts.destroy');
});
require __DIR__.'/auth.php';

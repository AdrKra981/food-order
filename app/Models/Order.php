<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\OrderStatus; // Assuming you have an OrderStatus enum defined

class Order extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'restaurant_id',
        'order_number',
        'total_amount',
        'status',
        'customer_name',
        'customer_email',
        'customer_phone',
        'delivery_type',
        'delivery_address',
        'payment_method',
        'payment_status',
        'payment_intent_id',
        'notes',
        'promo_code_id',
        'promo_code_used',
        'discount_amount',
        'subtotal_amount',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'subtotal_amount' => 'decimal:2',
        'status' => OrderStatus::class, // Assuming OrderStatus is an enum
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class)->withPivot('quantity');
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function promoCodeUsage()
    {
        return $this->hasOne(PromoCodeUsage::class);
    }
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
    
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
    
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
    
    public function scopeByRestaurant($query, $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }
    
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}

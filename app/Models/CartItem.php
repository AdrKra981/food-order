<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'session_id',
        'menu_item_id',
        'restaurant_id',
        'quantity',
        'price',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    // Calculate total price for this cart item
    public function getTotalAttribute(): float
    {
        return round($this->quantity * $this->price, 2);
    }

    // Scope for getting cart items by user or session
    public function scopeForUserOrSession($query, $userId = null, $sessionId = null)
    {
        return $query->where(function ($q) use ($userId, $sessionId) {
            if ($userId) {
                $q->where('user_id', $userId);
            } else {
                $q->where('session_id', $sessionId);
            }
        });
    }

    // Scope for getting items grouped by restaurant
    public function scopeGroupedByRestaurant($query)
    {
        return $query->with(['restaurant', 'menuItem.media'])
            ->orderBy('restaurant_id')
            ->orderBy('created_at', 'desc');
    }
}

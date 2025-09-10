<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'minimum_order_amount',
        'maximum_discount_amount',
        'usage_limit_per_customer',
        'total_usage_limit',
        'used_count',
        'applicable_categories',
        'is_active',
        'valid_from',
        'valid_until',
    ];

    protected $casts = [
        'applicable_categories' => 'array',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
        'discount_value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount_amount' => 'decimal:2',
    ];

    // Relationships
    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function usages()
    {
        return $this->hasMany(PromoCodeUsage::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        $now = now();

        return $query->where('valid_from', '<=', $now)
            ->where('valid_until', '>=', $now);
    }

    public function scopeAvailable($query)
    {
        return $query->active()->valid();
    }

    // Helper methods
    public function isValid()
    {
        if (! $this->is_active) {
            return false;
        }

        $now = now();

        return $this->valid_from <= $now && $this->valid_until >= $now;
    }

    public function hasUsageLimit()
    {
        return $this->total_usage_limit !== null;
    }

    public function isUsageLimitReached()
    {
        if (! $this->hasUsageLimit()) {
            return false;
        }

        return $this->used_count >= $this->total_usage_limit;
    }

    public function getCustomerUsageCount($userId)
    {
        return $this->usages()->where('user_id', $userId)->count();
    }

    public function canCustomerUse($userId)
    {
        if ($this->usage_limit_per_customer === null) {
            return true;
        }

        return $this->getCustomerUsageCount($userId) < $this->usage_limit_per_customer;
    }

    public function calculateDiscount($orderTotal, $applicableAmount = null)
    {
        // Use applicable amount if provided (for category-specific discounts)
        $baseAmount = $applicableAmount ?? $orderTotal;

        if ($this->discount_type === 'percentage') {
            $discount = $baseAmount * ($this->discount_value / 100);
        } else {
            $discount = $this->discount_value;
        }

        // Apply maximum discount limit if set
        if ($this->maximum_discount_amount && $discount > $this->maximum_discount_amount) {
            $discount = $this->maximum_discount_amount;
        }

        // Ensure discount doesn't exceed order total
        return min($discount, $orderTotal);
    }

    public function getDiscountTypeLabel()
    {
        return $this->discount_type === 'percentage'
            ? $this->discount_value.'%'
            : '$'.number_format($this->discount_value, 2);
    }

    public function incrementUsage()
    {
        $this->increment('used_count');
    }
}

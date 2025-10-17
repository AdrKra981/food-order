<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'phone_number',
        'email',
        'website',
        'description',
        'cuisine_type',
        'opening_hours',
        'closing_hours',
        'user_id',
        'city',
        'lat',
        'lng',
        'address',
        'is_accepted',
        'delivery_fee',
        'minimum_order',
        'delivery_range_km',
        'image_id',
    ];

    protected $casts = [
        'opening_hours' => 'datetime',
        'closing_hours' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function menuCategories()
    {
        return $this->hasMany(MenuCategory::class);
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }

    public function media()
    {
        return $this->hasMany(Media::class);
    }

    /**
     * Employees belonging to this restaurant.
     */
    public function employees()
    {
        return $this->hasMany(User::class, 'restaurant_id');
    }

    public function image()
    {
        return $this->belongsTo(Media::class, 'image_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function scopereAccepted($query)
    {
        return $query->where('is_accepted', true);
    }

    public function shifts()
    {
        return $this->hasMany(\App\Models\Shift::class);
    }
}

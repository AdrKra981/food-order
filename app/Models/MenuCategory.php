<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MenuCategory extends Model
{
    use HasFactory;
    // Priority constants
    const PRIORITY_NORMAL = 0;
    const PRIORITY_FEATURED = 1;
    const PRIORITY_PROMOTED = 2;
    const PRIORITY_SPECIAL = 3;

    protected $fillable = [
        'name',
        'description',
        'restaurant_id',
        'sort_order',
        'priority',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'priority' => 'integer',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }

    // Priority helper methods
    public function getPriorityLabelAttribute()
    {
        return match ($this->priority) {
            self::PRIORITY_FEATURED => 'Featured',
            self::PRIORITY_PROMOTED => 'Promoted',
            self::PRIORITY_SPECIAL => 'Special Category',
            default => 'Normal',
        };
    }

    public function getPriorityColorAttribute()
    {
        return match ($this->priority) {
            self::PRIORITY_FEATURED => 'bg-blue-100 text-blue-800',
            self::PRIORITY_PROMOTED => 'bg-green-100 text-green-800',
            self::PRIORITY_SPECIAL => 'bg-purple-100 text-purple-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    // Scopes
    public function scopePrioritized($query)
    {
        return $query->orderBy('priority', 'desc')->orderBy('sort_order');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }
}

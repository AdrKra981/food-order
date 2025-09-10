<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image_url',
        'menu_category_id',
        'restaurant_id',
        'media_id',
        'priority',
        'is_available',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'priority' => 'integer',
    ];

    public function menuCategory()
    {
        return $this->belongsTo(MenuCategory::class);
    }

    public function media()
    {
        return $this->belongsTo(Media::class);
    }

    public function getMediaUrlAttribute()
    {
        if ($this->media) {
            return asset('storage/media/'.$this->media->filename);
        }

        return $this->image_url; // Fallback to direct image_url if no media
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class)->withPivot('quantity');
    }

    // Priority constants
    const PRIORITY_NORMAL = 0;

    const PRIORITY_FEATURED = 1;

    const PRIORITY_PROMOTED = 2;

    const PRIORITY_CHEF_SPECIAL = 3;

    public function getPriorityLabelAttribute(): string
    {
        return match ($this->priority) {
            self::PRIORITY_FEATURED => 'Featured',
            self::PRIORITY_PROMOTED => 'Promoted',
            self::PRIORITY_CHEF_SPECIAL => "Chef's Special",
            default => 'Normal',
        };
    }

    public function getPriorityColorAttribute(): string
    {
        return match ($this->priority) {
            self::PRIORITY_FEATURED => 'bg-blue-100 text-blue-800',
            self::PRIORITY_PROMOTED => 'bg-green-100 text-green-800',
            self::PRIORITY_CHEF_SPECIAL => 'bg-purple-100 text-purple-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function scopePrioritized($query)
    {
        return $query->orderBy('priority', 'desc')->orderBy('name');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }
}

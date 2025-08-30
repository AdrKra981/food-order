<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Media extends Model
{
    use HasFactory;
    protected $fillable = [
        'restaurant_id', 'filename', 'original_name', 'mime_type', 'size',
    ];

    public function restaurant()
    {
    return $this->belongsTo(Restaurant::class)->withDefault();
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }
}


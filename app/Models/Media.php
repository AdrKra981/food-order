<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id', 'filename', 'original_name', 'mime_type', 'size', 'path', 'type', 'public_url',
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

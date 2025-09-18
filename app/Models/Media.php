<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id', 'filename', 'original_name', 'mime_type', 'size', 'path', 'type', 'public_url',
    ];

    /**
     * Append a convenience `url` attribute to JSON/array forms.
     * - returns `public_url` when available (saved at upload time)
     * - otherwise tries to generate a Cloudinary URL from the stored filename
     * - falls back to the local `public` disk url or the raw `path`
     */
    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        // If we already stored a canonical public URL, return it
        if ($this->public_url && is_string($this->public_url) && str_starts_with($this->public_url, 'http')) {
            return $this->public_url;
        }

        // If Cloudinary disk is configured, try to generate a URL using the SDK
        try {
            if (config('filesystems.disks.cloudinary.driver') === 'cloudinary' && class_exists('\Cloudinary\Cloudinary')) {
                // Prefer cloud config value, fall back to env URL
                $cloudUrl = config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL');
                if ($cloudUrl) {
                    $cloudinary = new \Cloudinary\Cloudinary($cloudUrl);
                    // `filename` holds the public id returned by the adapter
                    if ($this->filename) {
                        return $cloudinary->image($this->filename)->toUrl();
                    }
                    // if `path` contains identifier, try that too
                    if ($this->path) {
                        return $cloudinary->image($this->path)->toUrl();
                    }
                }
            }
        } catch (\Throwable $e) {
            // ignore and fall through to local/public fallback
        }

        // Local/public disk fallback: return a storage URL if file exists
        try {
            if (Storage::disk('public')->exists($this->path)) {
                return Storage::disk('public')->url($this->path);
            }
        } catch (\Throwable $e) {
            // ignore
        }

        // Last resort: return the raw path value (may be adapter id)
        return $this->path;
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class)->withDefault();
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }
}

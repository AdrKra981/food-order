<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MediaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $restaurant = \App\Models\Restaurant::where('user_id', $user->id)->first();
        if (! $restaurant) {
            if (request()->wantsJson()) {
                return response()->json(['message' => 'No restaurant found for this user.'], 403);
            }
            abort(403, 'No restaurant found for this user.');
        }
        $media = $restaurant->media()->withCount('menuItems')->latest()->get();
        if (request()->wantsJson()) {
            return response()->json($media, 200);
        }

        return Inertia::render('Owner/MediaLibrary/Index', [
            'media' => $media,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();

        if (! $user->restaurant) {
            abort(403, 'No restaurant found for this user.');
        }

        return Inertia::render('Owner/MediaLibrary/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $restaurant = \App\Models\Restaurant::where('user_id', $user->id)->first();
        if (! $restaurant) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'No restaurant found for this user.'], 403);
            }
            abort(403, 'No restaurant found for this user.');
        }
        // Support both API (single file) and web (multiple files)
        if ($request->wantsJson()) {
            $request->validate([
                'file' => 'required|image|max:10240',
            ]);
            $file = $request->file('file');
            $ext = $file->getClientOriginalExtension();
            $folder = 'restaurants/'.Str::slug($restaurant->name ?: $restaurant->id);

            // Prefer cloudinary disk when configured, fallback to public
            if (config('filesystems.disks.cloudinary.driver') === 'cloudinary') {
                // Use putFile to let the adapter generate a public_id; set folder option
                $uploaded = Storage::disk('cloudinary')->putFile($folder, $file);
                    // try to obtain a secure URL from the adapter first; if adapter does not
                    // support url(), fall back to SDK or store the adapter identifier
                $path = $uploaded;
                    // No adapter URL helper available for cloudinary in tests; rely on SDK fallback below
                try {
                    if (class_exists('\Cloudinary\Cloudinary')) {
                        $cloudinary = new \Cloudinary\Cloudinary(config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL'));
                        $path = $cloudinary->image($uploaded)->toUrl();
                    }
                } catch (\Throwable $e) {
                    // ignore and keep $path as adapter identifier
                }

                // store public_url when we were able to generate a secure URL
                $publicUrl = null;
                if (is_string($path) && str_starts_with($path, 'http')) {
                    $publicUrl = $path;
                }

                $media = $restaurant->media()->create([
                    'filename' => $uploaded,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'path' => $path,
                    'public_url' => $publicUrl,
                    'type' => 'image',
                ]);
            } else {
                $filename = uniqid().'.'.$ext;
                $path = $folder.'/'.$filename;
                Storage::disk('public')->put($path, file_get_contents($file));
                $media = $restaurant->media()->create([
                    'filename' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'path' => $path,
                    'type' => 'image',
                ]);
            }

            return response()->json($media, 201);
        } else {
            $request->validate([
                'files.*' => 'required|image|max:10240',
            ]);
            $files = $request->file('files');
            if (! $files || empty($files)) {
                return back()->withErrors(['files' => 'Please select at least one image to upload.']);
            }
            $uploadedFiles = [];
            foreach ($files as $file) {
                $ext = $file->getClientOriginalExtension();
                $folder = 'restaurants/'.Str::slug($restaurant->name ?: $restaurant->id);
                if (config('filesystems.disks.cloudinary.driver') === 'cloudinary') {
                    $uploaded = Storage::disk('cloudinary')->putFile($folder, $file);
                        $path = $uploaded;
                        // No adapter URL helper available for cloudinary in tests; rely on SDK fallback below
                    try {
                        if (class_exists('\Cloudinary\Cloudinary')) {
                            $cloudinary = new \Cloudinary\Cloudinary(config('cloudinary.cloud_url'));
                            $path = $cloudinary->image($uploaded)->toUrl();
                        }
                    } catch (\Throwable $e) {
                        // ignore and keep $path as adapter identifier
                    }

                    $publicUrl = null;
                    if (is_string($path) && str_starts_with($path, 'http')) {
                        $publicUrl = $path;
                    }

                    $media = $restaurant->media()->create([
                        'filename' => $uploaded,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'path' => $path,
                        'public_url' => $publicUrl,
                        'type' => 'image',
                    ]);
                } else {
                    $filename = uniqid().'.'.$ext;
                    $path = $folder.'/'.$filename;
                    Storage::disk('public')->put($path, file_get_contents($file));
                    $media = $restaurant->media()->create([
                        'filename' => $filename,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'path' => $path,
                        'type' => 'image',
                    ]);
                }
                $uploadedFiles[] = $media;
            }

            return redirect()->route('owner.media.index')->with('success', count($uploadedFiles).' image(s) uploaded successfully!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $media = $id instanceof Media ? $id : Media::find($id);

        if (! $media) {
            if (request()->wantsJson()) {
                return response()->json(['message' => 'Media not found'], 404);
            }
            abort(404, 'Media not found');
        }

        if (! $media->restaurant_id) {
            try {
                logger()->warning('Media delete attempted for media without restaurant_id', [
                    'auth_user_id' => $user?->id,
                    'media_id' => $media->id,
                    'media_filename' => $media->filename,
                    'request_path' => request()->path(),
                ]);
            } catch (\Throwable $e) {
                // ignore logging failures
            }

            if (request()->wantsJson()) {
                return response()->json(['message' => 'Media record is missing restaurant association'], 404);
            }

            abort(404, 'Media record is missing restaurant association');
        }

        $restaurant = \App\Models\Restaurant::find($media->restaurant_id);
        if (! $restaurant || (int) $restaurant->user_id !== (int) $user->id) {
            // Log details to help diagnose ownership/authorization mismatches
            try {
                logger()->warning('Media delete authorization failed', [
                    'auth_user_id' => $user?->id,
                    'media_id' => $media->id,
                    'media_restaurant_id' => $media->restaurant_id,
                    'restaurant_found' => $restaurant ? true : false,
                    'restaurant_user_id' => $restaurant?->user_id,
                    'request_path' => request()->path(),
                    'request_method' => request()->method(),
                ]);
            } catch (\Throwable $e) {
                // ignore logging failures
            }

            if (request()->wantsJson()) {
                return response()->json(['message' => 'You can only delete media from your own restaurant.'], 403);
            }

            abort(403, 'You can only delete media from your own restaurant.');
        }
        // Delete the media file from storage
        // Delete the media file from the configured storage
        $folder = 'restaurants/'.Str::slug($restaurant->name ?: $restaurant->id);
        if (config('filesystems.disks.cloudinary.driver') === 'cloudinary') {
            // filename should hold the Cloudinary public id (adapter identifier)
            $publicId = $media->filename ?: $media->path;
            try {
                $deleted = false;
                try {
                    $deleted = Storage::disk('cloudinary')->delete($publicId);
                } catch (\Throwable $e) {
                    logger()->warning('Cloudinary filesystem delete failed, will try SDK: '.$e->getMessage());
                }

                // If the adapter delete didn't work, try Cloudinary SDK as a fallback
                if (! $deleted && class_exists('\Cloudinary\Cloudinary')) {
                    try {
                        $cloudinary = new \Cloudinary\Cloudinary(config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL'));
                        // Use the admin API to destroy the resource
                        $cloudinary->uploadApi()->destroy($publicId);
                    } catch (\Throwable $e) {
                        logger()->warning('Cloudinary SDK destroy failed: '.$e->getMessage());
                    }
                }
            } catch (\Throwable $e) {
                // swallow errors during delete to avoid blocking user; log if needed
                logger()->warning('Failed to delete media from cloudinary: '.$e->getMessage());
            }
        } else {
            $filePath = $folder.'/'.$media->filename;
            Storage::disk('public')->delete($filePath);
        }
        // Delete the database record
        $media->delete();
        if (request()->wantsJson()) {
            return response()->json(['success' => true], 200);
        }

        return redirect()->back()->with('success', 'Media deleted successfully.');
    }

    /**
     * Bulk delete multiple media files
     */
    public function bulkDestroy(Request $request)
    {
        $user = Auth::user();

        if (! $user->restaurant) {
            abort(403, 'No restaurant found for this user.');
        }

        $request->validate([
            'media_ids' => 'required|array',
            'media_ids.*' => 'exists:media,id',
        ]);

        $mediaItems = Media::whereIn('id', $request->media_ids)
            ->where('restaurant_id', $user->restaurant->id)
            ->get();

        $deletedCount = 0;
        foreach ($mediaItems as $media) {
            // Delete the media file from storage depending on configured disk
            $restaurant = \App\Models\Restaurant::find($media->restaurant_id);
            $folder = 'restaurants/'.Str::slug($restaurant->name ?: $restaurant->id);
            if (config('filesystems.disks.cloudinary.driver') === 'cloudinary') {
                $publicId = $media->filename ?: $media->path;
                try {
                    $deleted = false;
                    try {
                        $deleted = Storage::disk('cloudinary')->delete($publicId);
                    } catch (\Throwable $e) {
                        logger()->warning('Cloudinary filesystem delete failed during bulk delete, will try SDK: '.$e->getMessage());
                    }

                    if (! $deleted && class_exists('\Cloudinary\Cloudinary')) {
                        try {
                            $cloudinary = new \Cloudinary\Cloudinary(config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL'));
                            $cloudinary->uploadApi()->destroy($publicId);
                        } catch (\Throwable $e) {
                            logger()->warning('Cloudinary SDK destroy failed during bulk delete: '.$e->getMessage());
                        }
                    }
                } catch (\Throwable $e) {
                    logger()->warning('Failed to delete media from cloudinary during bulk delete: '.$e->getMessage());
                }
            } else {
                $filePath = $folder.'/'.$media->filename;
                Storage::disk('public')->delete($filePath);
            }

            // Delete the database record
            $media->delete();
            $deletedCount++;
        }

        return redirect()->back()->with('success', $deletedCount.' media file(s) deleted successfully.');
    }

    /**
     * Get media for API usage (like selecting images for menu items)
     */
    public function api()
    {
        $user = Auth::user();

        if (! $user->restaurant) {
            return response()->json(['error' => 'No restaurant found'], 403);
        }

        $media = $user->restaurant->media()->latest()->get();

        return response()->json($media);
    }
}

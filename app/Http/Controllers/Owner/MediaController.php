<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
            $filename = uniqid().'.'.$file->getClientOriginalExtension();
            $path = 'restaurants/'.$restaurant->id.'/'.$filename;
            Storage::disk('public')->put($path, file_get_contents($file));
            $media = $restaurant->media()->create([
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'path' => $path,
                'type' => 'image',
            ]);

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
                $filename = uniqid().'.'.$file->getClientOriginalExtension();
                $path = 'restaurants/'.$restaurant->id.'/'.$filename;
                Storage::disk('public')->put($path, file_get_contents($file));
                $media = $restaurant->media()->create([
                    'filename' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'path' => $path,
                    'type' => 'image',
                ]);
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
    public function destroy(Media $media)
    {
        $user = Auth::user();
        $restaurant = \App\Models\Restaurant::find($media->restaurant_id);
        if (! $restaurant || $restaurant->user_id !== $user->id) {
            if (request()->wantsJson()) {
                return response()->json(['message' => 'You can only delete media from your own restaurant.'], 403);
            }
            abort(403, 'You can only delete media from your own restaurant.');
        }
        // Delete the media file from storage
        $filePath = 'restaurants/'.$media->restaurant_id.'/'.$media->filename;
        Storage::disk('public')->delete($filePath);
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
            // Delete the media file from storage
            $filePath = 'restaurants/'.$media->restaurant_id.'/'.$media->filename;
            Storage::disk('public')->delete($filePath);

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

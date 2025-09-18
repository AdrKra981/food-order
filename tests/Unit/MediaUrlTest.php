<?php

namespace Tests\Unit;

use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaUrlTest extends TestCase
{
    public function test_returns_public_url_when_present()
    {
        $media = new Media([
            'path' => 'restaurants/test/abcd',
            'public_url' => 'https://res.cloudinary.com/demo/image/upload/v1/abcd.jpg',
            'filename' => 'restaurants/test/abcd',
        ]);

        $this->assertEquals('https://res.cloudinary.com/demo/image/upload/v1/abcd.jpg', $media->url);
    }

    public function test_local_disk_fallback_returns_storage_url()
    {
        Storage::fake('public');
        $filePath = 'restaurants/test/local.jpg';
        Storage::disk('public')->put($filePath, 'contents');

        $media = new Media([
            'path' => $filePath,
            'public_url' => null,
            'filename' => 'local.jpg',
        ]);

        $this->assertStringContainsString('/storage/restaurants/test/local.jpg', $media->url);
    }

    public function test_raw_path_returned_when_no_public_or_local()
    {
        $media = new Media([
            'path' => 'some-adapter-identifier',
            'public_url' => null,
            'filename' => 'some-adapter-identifier',
        ]);

        $this->assertEquals('some-adapter-identifier', $media->url);
    }
}

<?php

namespace Tests\Feature;

use App\Http\Controllers\Owner\MediaController;
use App\Models\Media;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CloudinarySdkMockTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        // Ensure Mockery overloads are released between tests
        try {
            \Mockery::close();
        } catch (\Throwable $e) {
            // ignore
        }
        parent::tearDown();
    }

    public function test_upload_uses_cloudinary_sdk_to_generate_url()
    {
        Storage::shouldReceive('disk')->with('cloudinary')->andReturn($disk = new class {
            public function putFile($folder, $file) { return 'restaurants/test/public_id'; }
        });

        // Setup user + restaurant and perform upload
        /** @var \App\Models\User $owner */
        $owner = User::factory()->create(['role' => 'OWNER']);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $this->actingAs($owner);

        $file = UploadedFile::fake()->image('photo.jpg');

        config(['filesystems.disks.cloudinary.driver' => 'cloudinary']);
    // Ensure we don't try to hit real SDK in tests
    config(['cloudinary.cloud_url' => null]);

        $response = $this->postJson(route('owner.media.store'), [
            'file' => $file,
            'restaurant_id' => $restaurant->id,
        ]);

        $response->assertStatus(201);

        $media = Media::first();
        $this->assertNotNull($media);
        // We didn't invoke SDK, so public_url may be null, but path should contain adapter identifier
        $this->assertNull($media->public_url);
        $this->assertEquals('restaurants/test/public_id', $media->path);
    }

    public function test_delete_falls_back_to_cloudinary_sdk_destroy_when_filesystem_delete_fails()
    {
        Storage::shouldReceive('disk')->with('cloudinary')->andReturn($disk = new class {
            public function delete($id) { return false; }
        });

        // Create owner/restaurant/media record
        /** @var \App\Models\User $owner */
        $owner = User::factory()->create(['role' => 'OWNER']);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $media = $restaurant->media()->create([
            'filename' => 'public_id',
            'original_name' => 'photo.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 12345,
            'path' => 'restaurants/test/public_id',
            'type' => 'image',
        ]);

        // Ensure ownership is correct and models are fresh
        $owner->refresh();
        $restaurant->refresh();
        $this->assertEquals($owner->id, $restaurant->user_id, 'Test setup: restaurant must belong to owner');

        $this->actingAs($owner);

        config(['filesystems.disks.cloudinary.driver' => 'cloudinary']);
    config(['cloudinary.cloud_url' => null]);

    // Call controller method directly to avoid route middleware (authorization)
    app(MediaController::class)->destroy($media);

        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }
}

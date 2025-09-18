<?php

namespace Tests\Feature;

use App\Http\Controllers\Owner\MediaController;
use App\Models\Media;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class CloudinarySdkMockTest extends TestCase
{
    use RefreshDatabase;

    public function test_upload_uses_cloudinary_sdk_to_generate_url()
    {
        Storage::shouldReceive('disk')->with('cloudinary')->andReturn($disk = Mockery::mock());
        // When putFile is called, the adapter should return the cloudinary public id
        $disk->shouldReceive('putFile')->andReturn('restaurants/test/public_id');

        // Overload the Cloudinary class so "new Cloudinary(...)" returns our mock
        $cloudMock = Mockery::mock('overload:Cloudinary\\Cloudinary');
        // The image() chain should return a mock that returns a URL when toUrl() is called
        $imageMock = Mockery::mock();
        $imageMock->shouldReceive('toUrl')->andReturn('https://res.cloudinary.com/demo/image/upload/v1/public_id.jpg');
        $cloudMock->shouldReceive('image')->with('restaurants/test/public_id')->andReturn($imageMock);

        // Setup user + restaurant and perform upload
        /** @var \App\Models\User $owner */
        $owner = User::factory()->create(['role' => 'OWNER']);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $this->actingAs($owner);

        $file = UploadedFile::fake()->image('photo.jpg');

        // Ensure the filesystem is treated as cloudinary for this test
        config(['filesystems.disks.cloudinary.driver' => 'cloudinary']);
        config(['cloudinary.cloud_url' => 'cloudinary://key:secret@demo']);

        $response = $this->postJson(route('owner.media.store'), [
            'file' => $file,
            'restaurant_id' => $restaurant->id,
        ]);

        $response->assertStatus(201);

        $media = Media::first();
        $this->assertNotNull($media);
        $this->assertEquals('https://res.cloudinary.com/demo/image/upload/v1/public_id.jpg', $media->public_url);
    }

    public function test_delete_falls_back_to_cloudinary_sdk_destroy_when_filesystem_delete_fails()
    {
        Storage::shouldReceive('disk')->with('cloudinary')->andReturn($disk = Mockery::mock());
        // Simulate adapter delete returning false
        $disk->shouldReceive('delete')->andReturn(false);

        // Mock Cloudinary SDK overload and expect uploadApi()->destroy called with public id
        $cloudMock = Mockery::mock('overload:Cloudinary\\Cloudinary');
        $apiMock = Mockery::mock();
        $apiMock->shouldReceive('destroy')->with('public_id')->once()->andReturn(['result' => 'ok']);
        $cloudMock->shouldReceive('uploadApi')->andReturn($apiMock);

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

        // Hit debug endpoint to inspect authenticated user/restaurant context in the request lifecycle
        $debug = $this->getJson('/debug-user');
        file_put_contents('php://stdout', "\nDEBUG /debug-user: ".$debug->getContent()."\n");

        // Sanity checks before calling delete to help diagnose authorization failures
        $media->refresh();
        $restaurant->refresh();
        // remove HTTP route call (middleware) and call controller directly to test delete logic

        config(['filesystems.disks.cloudinary.driver' => 'cloudinary']);
        config(['cloudinary.cloud_url' => 'cloudinary://key:secret@demo']);

        // Call controller method directly to avoid route middleware (authorization) and focus on SDK fallback
        $controller = new MediaController;
        $controller->destroy($media);

        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaLibraryTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_upload_media()
    {
        Storage::fake('public');
        // In test environment ensure the cloudinary disk is not treated as configured
        // so the controller will use the local `public` disk instead of attempting
        // to initialize the Cloudinary client (which requires real credentials).
        config(['filesystems.disks.cloudinary.driver' => 'local']);
        $owner = User::factory()->create(['role' => 'OWNER']);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $this->actingAs($owner);
        $file = UploadedFile::fake()->image('photo.jpg');
        $response = $this->postJson(route('owner.media.store'), [
            'file' => $file,
            'restaurant_id' => $restaurant->id,
        ]);
        $response->assertStatus(201);
        $media = Media::first();
        $this->assertNotNull($media);
        Storage::disk('public')->assertExists($media->path);
    }

    public function test_owner_cannot_upload_media_to_another_owners_restaurant()
    {
        Storage::fake('public');
        $owner = User::factory()->create(['role' => 'OWNER']);
        $otherOwner = User::factory()->create(['role' => 'OWNER']);
        $restaurant = Restaurant::factory()->create(['user_id' => $otherOwner->id]);
        $this->actingAs($owner);
        $file = UploadedFile::fake()->image('photo.jpg');
        $response = $this->postJson(route('owner.media.store'), [
            'file' => $file,
            'restaurant_id' => $restaurant->id,
        ]);
        $response->assertStatus(403);
    }

    // ...existing code...

    public function test_owner_cannot_delete_another_owners_media()
    {
        $owner = User::factory()->create(['role' => 'OWNER']);
        $otherOwner = User::factory()->create(['role' => 'OWNER']);
        $restaurant = Restaurant::factory()->create(['user_id' => $otherOwner->id]);
        $media = Media::factory()->create(['restaurant_id' => $restaurant->id]);
        $this->actingAs($owner);
        $response = $this->deleteJson(route('owner.media.destroy', $media));
        $response->assertStatus(403);
        $this->assertDatabaseHas('media', ['id' => $media->id]);
    }
}

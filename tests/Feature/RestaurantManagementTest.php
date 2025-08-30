<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Restaurant;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RestaurantManagementTest extends TestCase
{
    public function test_owner_cannot_create_multiple_restaurants()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $response = $this->actingAs($owner)->post('/restaurants', [
            'name' => 'Second Place',
            'address' => '789 Main St',
            'user_id' => $owner->id,
        ]);
        $response->assertStatus(403);
    }

    public function test_owner_cannot_delete_another_owners_restaurant()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $other = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $response = $this->actingAs($other)->delete("/restaurants/{$restaurant->id}");
        $response->assertStatus(403);
        $this->assertDatabaseHas('restaurants', ['id' => $restaurant->id]);
    }

    public function test_unapproved_owner_cannot_access_owner_features()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id, 'is_accepted' => false]);
        $response = $this->actingAs($owner)->get('/owner/dashboard');
        $response->assertStatus(403);
    }

    use RefreshDatabase;

    public function test_owner_can_create_restaurant()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $response = $this->actingAs($owner)->post('/restaurants', [
            'name' => 'My Place',
            'address' => '456 Main St',
            'user_id' => $owner->id,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('restaurants', ['name' => 'My Place', 'user_id' => $owner->id]);
    }

    public function test_admin_can_approve_restaurant()
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $restaurant = Restaurant::factory()->create(['is_accepted' => false]);
        $response = $this->actingAs($admin)->patch("/restaurants/{$restaurant->id}/approve");
        $response->assertStatus(200);
        $restaurant = Restaurant::find($restaurant->id); // re-fetch from DB
    $this->assertEquals(1, $restaurant->is_accepted);
    }

    public function test_owner_can_update_their_restaurant()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $response = $this->actingAs($owner)->put("/restaurants/{$restaurant->id}", [
            'name' => 'Updated Name',
        ]);
        $response->assertStatus(200);
        $restaurant->refresh();
        $this->assertEquals('Updated Name', $restaurant->name);
    }

    public function test_non_owner_cannot_update_restaurant()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $other = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $response = $this->actingAs($other)->put("/restaurants/{$restaurant->id}", [
            'name' => 'Hacked',
        ]);
        $response->assertStatus(403);
    }

    public function test_owner_can_delete_their_restaurant()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $response = $this->actingAs($owner)->delete("/restaurants/{$restaurant->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('restaurants', ['id' => $restaurant->id]);
    }
}

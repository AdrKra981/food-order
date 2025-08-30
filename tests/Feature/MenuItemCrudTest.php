<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuItemCrudTest extends TestCase
{
    public function test_owner_cannot_create_menu_item_for_unapproved_restaurant()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => false,
        ]);
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $this->actingAs($owner);
        $payload = [
            'name' => 'Pizza',
            'price' => 25.00,
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
            'is_available' => true,
        ];
        $response = $this->postJson(route('owner.menu-items.store'), $payload);
        $response->assertStatus(403);
    }

    public function test_owner_cannot_create_menu_item_with_invalid_data()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $this->actingAs($owner);
        $payload = [
            // Missing name and price
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
        ];
        $response = $this->postJson(route('owner.menu-items.store'), $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'price']);
    }

    public function test_owner_cannot_update_menu_item_they_do_not_own()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $otherOwner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $otherOwner->id,
            'is_accepted' => true,
        ]);
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $item = MenuItem::factory()->create([
            'restaurant_id' => $restaurant->id,
            'menu_category_id' => $category->id,
        ]);
        $this->actingAs($owner);
        $response = $this->putJson(route('owner.menu-items.update', $item), [
            'name' => 'Hacked',
            'price' => 99.99,
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
            'is_available' => true,
        ]);
        $response->assertStatus(403);
    }

    public function test_owner_cannot_delete_menu_item_they_do_not_own()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $otherOwner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $otherOwner->id,
            'is_accepted' => true,
        ]);
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $item = MenuItem::factory()->create([
            'restaurant_id' => $restaurant->id,
            'menu_category_id' => $category->id,
        ]);
        $this->actingAs($owner);
        $response = $this->deleteJson(route('owner.menu-items.destroy', $item));
        $response->assertStatus(403);
    }

    public function test_owner_cannot_create_menu_item_for_another_owners_restaurant()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $otherOwner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $otherOwner->id,
            'is_accepted' => true,
        ]);
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $this->actingAs($owner);
        $payload = [
            'name' => 'Pizza',
            'price' => 25.00,
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
            'is_available' => true,
        ];
        $response = $this->postJson(route('owner.menu-items.store'), $payload);
        $response->assertStatus(403);
    }

    use RefreshDatabase;

    public function test_owner_can_create_menu_item()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $this->actingAs($owner);
        $payload = [
            'name' => 'Pizza',
            'price' => 25.00,
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
            'is_available' => true,
        ];
        $response = $this->postJson(route('owner.menu-items.store'), $payload);
        $response->assertStatus(201);
        $this->assertDatabaseHas('menu_items', [
            'name' => 'Pizza',
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
        ]);
    }

    public function test_owner_can_update_menu_item()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $item = MenuItem::factory()->create([
            'restaurant_id' => $restaurant->id,
            'menu_category_id' => $category->id,
            'name' => 'Old Pizza',
        ]);
        $this->actingAs($owner);
        $response = $this->putJson(route('owner.menu-items.update', $item), [
            'name' => 'New Pizza',
            'price' => 30.00,
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
            'is_available' => true,
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('menu_items', [
            'id' => $item->id,
            'name' => 'New Pizza',
            'price' => 30.00,
        ]);
    }

    public function test_owner_can_delete_menu_item()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $item = MenuItem::factory()->create([
            'restaurant_id' => $restaurant->id,
            'menu_category_id' => $category->id,
        ]);
        $this->actingAs($owner);
        $response = $this->deleteJson(route('owner.menu-items.destroy', $item));
        $response->assertStatus(200);
        $this->assertDatabaseMissing('menu_items', [
            'id' => $item->id,
        ]);
    }
}

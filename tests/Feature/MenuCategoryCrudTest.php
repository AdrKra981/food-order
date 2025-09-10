<?php

namespace Tests\Feature;

use App\Models\MenuCategory;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuCategoryCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_cannot_delete_category_with_menu_items()
    {
        $owner = \App\Models\User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = \App\Models\Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);
        $category = \App\Models\MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $item = \App\Models\MenuItem::factory()->create([
            'restaurant_id' => $restaurant->id,
            'menu_category_id' => $category->id,
        ]);
        $this->actingAs($owner);
        $response = $this->deleteJson(route('owner.menu-categories.destroy', $category));
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Cannot delete category that contains menu items. Please remove all items first.']);
        $this->assertDatabaseHas('menu_categories', [
            'id' => $category->id,
        ]);
    }

    public function test_owner_can_create_menu_category()
    {
        $owner = User::factory()->create([
            'role' => \App\Enums\UserRole::OWNER,
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);
        $this->actingAs($owner);
        $payload = [
            'name' => 'Starters',
            'restaurant_id' => $restaurant->id,
        ];
        $response = $this->postJson(route('owner.menu-categories.store'), $payload);
        $response->assertStatus(201);
        $this->assertDatabaseHas('menu_categories', [
            'name' => 'Starters',
            'restaurant_id' => $restaurant->id,
        ]);
    }

    public function test_owner_can_update_menu_category()
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
            'name' => 'Old Name',
        ]);
        $this->actingAs($owner);
        $response = $this->putJson(route('owner.menu-categories.update', $category), [
            'name' => 'New Name',
            'sort_order' => 1,
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('menu_categories', [
            'id' => $category->id,
            'name' => 'New Name',
        ]);
    }

    public function test_owner_can_delete_menu_category()
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
        $response = $this->deleteJson(route('owner.menu-categories.destroy', $category));
        $response->assertStatus(200);
        $this->assertDatabaseMissing('menu_categories', [
            'id' => $category->id,
        ]);
    }
}

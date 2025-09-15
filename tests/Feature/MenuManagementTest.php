<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_menu_category()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id, 'is_accepted' => true]);
        $response = $this->actingAs($owner)->json('POST', '/owner/menu-categories', [
            'name' => 'Starters',
            'description' => 'Appetizers',
            'restaurant_id' => $restaurant->id,
            'sort_order' => 1,
            'priority' => 0,
            'is_available' => true,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('menu_categories', ['name' => 'Starters', 'restaurant_id' => $restaurant->id]);
    }

    public function test_owner_can_update_menu_category()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id, 'is_accepted' => true]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $response = $this->actingAs($owner)->json('PUT', "/owner/menu-categories/{$category->id}", [
            'name' => 'Updated Category',
            'description' => $category->description,
            'restaurant_id' => $restaurant->id,
            'sort_order' => $category->sort_order,
            'priority' => (int) $category->priority,
            'is_available' => $category->is_available,
        ]);
        $response->assertStatus(200);
        $category->refresh();
        $this->assertEquals('Updated Category', $category->name);
    }

    public function test_owner_can_delete_menu_category()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $response = $this->actingAs($owner)->json('DELETE', "/owner/menu-categories/{$category->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('menu_categories', ['id' => $category->id]);
    }

    public function test_owner_can_toggle_menu_category_availability()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id, 'is_available' => true]);
        $response = $this->actingAs($owner)->json('PATCH', "/owner/menu-categories/{$category->id}/toggle-availability");
        $response->assertStatus(200);
        $category->refresh();
        $this->assertFalse($category->is_available);
    }

    public function test_owner_can_create_menu_item()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $response = $this->actingAs($owner)->json('POST', '/owner/menu-items', [
            'name' => 'Pizza',
            'description' => 'Cheese pizza',
            'price' => 25.00,
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
            'is_available' => true,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('menu_items', ['name' => 'Pizza', 'menu_category_id' => $category->id]);
    }

    public function test_owner_can_update_menu_item()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'menu_category_id' => $category->id]);
        $response = $this->actingAs($owner)->json('PUT', "/owner/menu-items/{$item->id}", [
            'name' => 'Updated Item',
            'description' => $item->description,
            'price' => $item->price,
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
            'is_available' => $item->is_available,
        ]);
        $response->assertStatus(200);
        $item->refresh();
        $this->assertEquals('Updated Item', $item->name);
    }

    public function test_owner_can_delete_menu_item()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant = Restaurant::factory()->create(['user_id' => $owner->id]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'menu_category_id' => $category->id]);
        $response = $this->actingAs($owner)->json('DELETE', "/owner/menu-items/{$item->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('menu_items', ['id' => $item->id]);
    }
}

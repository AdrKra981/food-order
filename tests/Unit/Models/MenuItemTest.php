<?php

namespace Tests\Unit\Models;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuItemTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_create_a_menu_item()
    {
        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::create([
            'name' => 'Pizza',
            'description' => 'Cheese pizza',
            'price' => 25.00,
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
            'is_available' => true,
        ]);
        $this->assertInstanceOf(MenuItem::class, $item);
        $this->assertEquals('Pizza', $item->name);
        $this->assertTrue($item->is_available);
    }

    public function test_it_belongs_to_a_category_and_restaurant()
    {
        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'restaurant_id' => $restaurant->id,
        ]);
        $this->assertInstanceOf(MenuCategory::class, $item->menuCategory);
        $this->assertInstanceOf(Restaurant::class, $item->restaurant);
    }
}

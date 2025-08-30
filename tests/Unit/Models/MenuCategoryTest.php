<?php

namespace Tests\Unit\Models;

use App\Models\MenuCategory;
use App\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuCategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_create_a_menu_category()
    {
        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::create([
            'name' => 'Starters',
            'description' => 'Appetizers',
            'restaurant_id' => $restaurant->id,
            'sort_order' => 1,
            'priority' => MenuCategory::PRIORITY_FEATURED,
            'is_available' => true,
        ]);
        $this->assertInstanceOf(MenuCategory::class, $category);
        $this->assertEquals('Starters', $category->name);
        $this->assertTrue($category->is_available);
    }

    public function test_it_belongs_to_a_restaurant()
    {
        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $this->assertInstanceOf(Restaurant::class, $category->restaurant);
    }

    public function test_priority_label_and_color()
    {
        $category = MenuCategory::factory()->create(['priority' => MenuCategory::PRIORITY_PROMOTED]);
        $this->assertEquals('Promoted', $category->priority_label);
        $this->assertStringContainsString('green', $category->priority_color);
    }
}

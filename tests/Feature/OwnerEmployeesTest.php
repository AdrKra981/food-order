<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerEmployeesTest extends TestCase
{
    use RefreshDatabase;

    protected function createOwnerWithRestaurant(): array
    {
        /** @var User $owner */
        $owner = User::factory()->create([
            'role' => UserRole::OWNER,
        ]);

        $restaurant = Restaurant::create([
            'user_id' => $owner->id,
            'name' => 'Test Resto',
            'address' => 'Main 1',
            'phone_number' => '123',
            'city' => 'City',
            'is_accepted' => true,
        ]);

        return [$owner, $restaurant];
    }

    public function test_owner_can_create_employee(): void
    {
        [$owner, $restaurant] = $this->createOwnerWithRestaurant();

        $resp = $this->actingAs($owner)->post(route('owner.employees.store'), [
            'name' => 'Emp',
            'email' => 'emp@ex.com',
        ]);

        $resp->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'emp@ex.com',
            'role' => UserRole::EMPLOYEE,
            'restaurant_id' => $restaurant->id,
        ]);
    }

    public function test_owner_can_toggle_employee(): void
    {
        [$owner, $restaurant] = $this->createOwnerWithRestaurant();
        $employee = User::factory()->create([
            'role' => UserRole::EMPLOYEE,
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
        ]);

        $resp = $this->actingAs($owner)->patch(route('owner.employees.toggle', $employee));
        $resp->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $employee->id,
            'is_active' => false,
        ]);
    }

    public function test_owner_can_delete_employee(): void
    {
        [$owner, $restaurant] = $this->createOwnerWithRestaurant();
        $employee = User::factory()->create([
            'role' => UserRole::EMPLOYEE,
            'restaurant_id' => $restaurant->id,
        ]);

        $resp = $this->actingAs($owner)->delete(route('owner.employees.destroy', $employee));
        $resp->assertRedirect();
        $this->assertDatabaseMissing('users', [
            'id' => $employee->id,
        ]);
    }
}

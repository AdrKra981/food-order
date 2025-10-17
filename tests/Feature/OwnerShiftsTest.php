<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Restaurant;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OwnerShiftsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Ensure sqlite database is migrated
        $this->artisan('migrate');
    }

    public function test_owner_can_create_shift_and_validate_overlap()
    {
        /** @var User $owner */
        $owner = User::factory()->create([
            'role' => UserRole::OWNER,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $owner->id,
            'is_accepted' => true,
        ]);

        $employee = User::factory()->create([
            'role' => UserRole::EMPLOYEE,
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
        ]);

    $this->actingAs($owner);

        // Create a shift
        $resp = $this->post(route('owner.shifts.store'), [
            'user_id' => $employee->id,
            'date' => '2025-10-20',
            'start_time' => '09:00',
            'end_time' => '17:00',
            'note' => 'Day shift',
        ]);
        $resp->assertRedirect();
        $this->assertDatabaseHas('shifts', [
            'restaurant_id' => $restaurant->id,
            'user_id' => $employee->id,
            'note' => 'Day shift',
        ]);

        // Overlapping shift should fail
        $resp2 = $this->post(route('owner.shifts.store'), [
            'user_id' => $employee->id,
            'date' => '2025-10-20',
            'start_time' => '16:00',
            'end_time' => '18:00',
        ]);
        $resp2->assertSessionHasErrors(['start_time']);

        // Touching edge (back-to-back) should pass (17:00 to 21:00 next)
        $resp3 = $this->post(route('owner.shifts.store'), [
            'user_id' => $employee->id,
            'date' => '2025-10-20',
            'start_time' => '17:00',
            'end_time' => '21:00',
        ]);
        $resp3->assertRedirect();
    }

    public function test_owner_cannot_delete_other_restaurant_shift()
    {
        $owner1 = User::factory()->create(['role' => UserRole::OWNER]);
        $restaurant1 = Restaurant::factory()->create(['user_id' => $owner1->id, 'is_accepted' => true]);
        $employee1 = User::factory()->create(['role' => UserRole::EMPLOYEE, 'restaurant_id' => $restaurant1->id]);

        $shift = Shift::factory()->create([
            'restaurant_id' => $restaurant1->id,
            'user_id' => $employee1->id,
        ]);

    /** @var User $owner2 */
    $owner2 = User::factory()->create(['role' => UserRole::OWNER, 'email_verified_at' => now()]);
        $restaurant2 = Restaurant::factory()->create(['user_id' => $owner2->id, 'is_accepted' => true]);

        $this->actingAs($owner2);
        $resp = $this->delete(route('owner.shifts.destroy', $shift->id));
        $resp->assertStatus(403);
        $this->assertDatabaseHas('shifts', ['id' => $shift->id]);
    }
}

<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ForcePasswordChangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_redirects_to_force_change_when_flag_set(): void
    {
        /** @var \App\Models\User $user */
        $user = User::factory()->create([
            'role' => UserRole::EMPLOYEE,
            'must_change_password' => true,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect(route('password.force-change.show'));
    }

    public function test_can_update_password_and_clear_flag(): void
    {
        /** @var \App\Models\User $user */
        $user = User::factory()->create([
            'role' => UserRole::EMPLOYEE,
            'must_change_password' => true,
        ]);

        $resp = $this->actingAs($user)->post(route('password.force-change.update'), [
            'password' => 'newsecurepass',
            'password_confirmation' => 'newsecurepass',
        ]);

        $resp->assertRedirect(route('dashboard'));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'must_change_password' => false,
        ]);
    }
}

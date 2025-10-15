<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InactiveEmployeeLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_inactive_employee_is_blocked_from_login(): void
    {
        /** @var User $user */
        $user = User::factory()->create([
            'email' => 'emp@example.com',
            'password' => bcrypt('secret12'),
            'role' => UserRole::EMPLOYEE,
            'is_active' => false,
        ]);

        $resp = $this->post('/login', [
            'email' => 'emp@example.com',
            'password' => 'secret12',
        ]);

        $resp->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}

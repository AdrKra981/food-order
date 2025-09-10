<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_admin_route()
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $response = $this->actingAs($admin)->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    public function test_customer_cannot_access_admin_route()
    {
        $customer = User::factory()->create(['role' => UserRole::CLIENT]);
        $response = $this->actingAs($customer)->get('/admin/dashboard');
        $response->assertStatus(403);
    }
}

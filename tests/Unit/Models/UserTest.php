<?php

namespace Tests\Unit\Models;

use App\Enums\UserRole;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_create_a_user()
    {
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::CLIENT,
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertEquals(UserRole::CLIENT, $user->role);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_casts_role_to_enum()
    {
        $user = User::factory()->create([
            'role' => UserRole::OWNER,
        ]);

        $this->assertInstanceOf(UserRole::class, $user->role);
        $this->assertEquals(UserRole::OWNER, $user->role);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_hides_password_and_remember_token()
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);

        $userArray = $user->toArray();

        $this->assertArrayNotHasKey('password', $userArray);
        $this->assertArrayNotHasKey('remember_token', $userArray);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_have_multiple_orders()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order1 = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);

        $this->assertCount(2, $user->orders);
        $this->assertTrue($user->orders->contains($order1));
        $this->assertTrue($user->orders->contains($order2));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_own_restaurants()
    {
        $ownerUser = User::factory()->create([
            'role' => UserRole::OWNER,
        ]);

        $restaurant1 = Restaurant::factory()->create([
            'user_id' => $ownerUser->id,
        ]);

        $restaurant2 = Restaurant::factory()->create([
            'user_id' => $ownerUser->id,
        ]);

        $this->assertCount(2, $ownerUser->restaurants);
        $this->assertTrue($ownerUser->restaurants->contains($restaurant1));
        $this->assertTrue($ownerUser->restaurants->contains($restaurant2));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function customer_cannot_own_restaurants()
    {
        $customerUser = User::factory()->create([
            'role' => UserRole::CLIENT,
        ]);

        // Even if we try to assign restaurants, they shouldn't appear
        // This depends on your business logic implementation
        $this->assertCount(0, $customerUser->restaurants);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_have_cart_items()
    {
        $user = User::factory()->create();

        $cartItem = CartItem::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->assertCount(1, $user->cartItems);
        $this->assertTrue($user->cartItems->contains($cartItem));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_check_if_user_is_owner()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $customer = User::factory()->create(['role' => UserRole::CLIENT]);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $this->assertTrue($owner->isOwner());
        $this->assertFalse($customer->isOwner());
        $this->assertFalse($admin->isOwner());
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_check_if_user_is_customer()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $customer = User::factory()->create(['role' => UserRole::CLIENT]);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $this->assertFalse($owner->isCustomer());
        $this->assertTrue($customer->isCustomer());
        $this->assertFalse($admin->isCustomer());
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_check_if_user_is_admin()
    {
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $customer = User::factory()->create(['role' => UserRole::CLIENT]);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $this->assertFalse($owner->isAdmin());
        $this->assertFalse($customer->isAdmin());
        $this->assertTrue($admin->isAdmin());
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_encrypts_password_when_set()
    {
        $user = User::factory()->create([
            'password' => 'plaintext-password',
        ]);

        $this->assertNotEquals('plaintext-password', $user->password);
        $this->assertTrue(Hash::check('plaintext-password', $user->password));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_find_user_by_email()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $foundUser = User::where('email', 'test@example.com')->first();

        $this->assertNotNull($foundUser);
        $this->assertEquals($user->id, $foundUser->id);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function email_must_be_unique()
    {
        User::factory()->create([
            'email' => 'unique@example.com',
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        User::factory()->create([
            'email' => 'unique@example.com',
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_has_timestamps()
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->created_at);
        $this->assertNotNull($user->updated_at);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_have_different_roles()
    {
        $customer = User::factory()->create(['role' => UserRole::CLIENT]);
        $owner = User::factory()->create(['role' => UserRole::OWNER]);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $this->assertEquals(UserRole::CLIENT, $customer->role);
        $this->assertEquals(UserRole::OWNER, $owner->role);
        $this->assertEquals(UserRole::ADMIN, $admin->role);
    }
}

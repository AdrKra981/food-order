<?php

namespace Tests\Unit;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddressTest extends TestCase
{
    use RefreshDatabase;

    public function test_address_can_be_created()
    {
        $address = Address::factory()->create([
            'street' => '123 Main St',
            'city' => 'Testville',
            'postal_code' => '12345',
            'country' => 'Testland',
        ]);

        $this->assertDatabaseHas('addresses', [
            'user_id' => $address->user_id,
            'street' => '123 Main St',
            'city' => 'Testville',
            'postal_code' => '12345',
            'country' => 'Testland',
        ]);
    }

    public function test_address_belongs_to_user()
    {
        $address = Address::factory()->create([
            'street' => '456 Side St',
            'city' => 'Sample City',
            'postal_code' => '67890',
            'country' => 'Sampleland',
        ]);

        $this->assertInstanceOf(\App\Models\User::class, $address->user);
        $this->assertEquals($address->user_id, $address->user->id);
    }

    public function test_address_requires_mandatory_fields()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);
        Address::create([]);
    }

    public function test_address_can_be_created_with_order()
    {
        $address = Address::factory()->create();
        $this->assertDatabaseHas('addresses', [
            'id' => $address->id,
            'order_id' => $address->order_id,
        ]);
    }

    public function test_address_belongs_to_order()
    {
        $address = Address::factory()->create();
        $this->assertInstanceOf(\App\Models\Order::class, $address->order);
        $this->assertEquals($address->order_id, $address->order->id);
    }

    public function test_address_cannot_be_created_without_user()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);
        Address::factory()->create(['user_id' => null]);
    }

    public function test_address_cannot_be_created_without_order()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);
        Address::factory()->create(['order_id' => null]);
    }

    public function test_address_can_be_updated()
    {
        $address = Address::factory()->create([
            'street' => 'Old St',
            'city' => 'Old City',
        ]);
        $address->update([
            'street' => 'New St',
            'city' => 'New City',
        ]);
        $this->assertDatabaseHas('addresses', [
            'id' => $address->id,
            'street' => 'New St',
            'city' => 'New City',
        ]);
    }

    public function test_address_can_be_deleted()
    {
        $address = Address::factory()->create();
        $addressId = $address->id;
        $address->delete();
        $this->assertDatabaseMissing('addresses', [
            'id' => $addressId,
        ]);
    }

    public function test_address_deleted_when_user_deleted()
    {
        $address = Address::factory()->create();
        $user = $address->user;
        $user->delete();
        $this->assertDatabaseMissing('addresses', [
            'id' => $address->id,
        ]);
    }

    public function test_address_deleted_when_order_deleted()
    {
        $address = Address::factory()->create();
        $order = $address->order;
        $order->delete();
        $this->assertDatabaseMissing('addresses', [
            'id' => $address->id,
        ]);
    }

    public function test_cannot_create_duplicate_address_for_same_order_user()
    {
        $address = Address::factory()->create();
        $this->expectException(\Illuminate\Database\QueryException::class);
        // Try to create another address with same user_id and order_id
        Address::factory()->create([
            'user_id' => $address->user_id,
            'order_id' => $address->order_id,
        ]);
    }

    public function test_can_retrieve_all_addresses_for_user()
    {
        $user = \App\Models\User::factory()->create();
        Address::factory()->count(3)->create(['user_id' => $user->id]);
        $this->assertEquals(3, $user->addresses()->count());
    }
}

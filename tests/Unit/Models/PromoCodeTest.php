<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromoCodeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test restaurant
        $this->restaurant = Restaurant::factory()->create();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_create_a_promo_code()
    {
        $promoCode = PromoCode::create([
            'restaurant_id' => $this->restaurant->id,
            'code' => 'TEST10',
            'name' => 'Test Discount',
            'description' => 'Test discount description',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'minimum_order_amount' => 20.00,
            'maximum_discount_amount' => 5.00,
            'is_active' => true,
            'valid_from' => now(),
            'valid_until' => now()->addDays(30),
        ]);

        $this->assertInstanceOf(PromoCode::class, $promoCode);
        $this->assertEquals('TEST10', $promoCode->code);
        $this->assertEquals('percentage', $promoCode->discount_type);
        $this->assertEquals(10.00, $promoCode->discount_value);
        $this->assertTrue($promoCode->exists);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_check_if_promo_code_is_valid_by_date()
    {
        // Valid promo code
        $validPromoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'is_active' => true,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDay(),
        ]);

        // Expired promo code
        $expiredPromoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'is_active' => true,
            'valid_from' => now()->subDays(10),
            'valid_until' => now()->subDay(),
        ]);

        // Future promo code
        $futurePromoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'is_active' => true,
            'valid_from' => now()->addDay(),
            'valid_until' => now()->addDays(10),
        ]);

        $this->assertTrue($validPromoCode->isValid());
        $this->assertFalse($expiredPromoCode->isValid());
        $this->assertFalse($futurePromoCode->isValid());
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_check_if_promo_code_is_active()
    {
        $activePromoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'is_active' => true,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDay(),
        ]);

        $inactivePromoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'is_active' => false,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDay(),
        ]);

        $this->assertTrue($activePromoCode->isValid());
        $this->assertFalse($inactivePromoCode->isValid());
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_calculate_percentage_discount()
    {
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'discount_type' => 'percentage',
            'discount_value' => 20.00, // 20%
            'maximum_discount_amount' => null,
        ]);

        $orderTotal = 100.00;
        $discount = $promoCode->calculateDiscount($orderTotal);

        $this->assertEquals(20.00, $discount);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_calculate_fixed_amount_discount()
    {
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'discount_type' => 'fixed_amount',
            'discount_value' => 15.00,
            'maximum_discount_amount' => null,
        ]);

        $orderTotal = 100.00;
        $discount = $promoCode->calculateDiscount($orderTotal);

        $this->assertEquals(15.00, $discount);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_respects_maximum_discount_amount_for_percentage()
    {
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'discount_type' => 'percentage',
            'discount_value' => 50.00, // 50%
            'maximum_discount_amount' => 10.00, // Max $10
        ]);

        $orderTotal = 100.00; // 50% would be $50, but max is $10
        $discount = $promoCode->calculateDiscount($orderTotal);

        $this->assertEquals(10.00, $discount);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_never_exceeds_order_total()
    {
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'discount_type' => 'fixed_amount',
            'discount_value' => 150.00, // More than order total
            'maximum_discount_amount' => null,
        ]);

        $orderTotal = 100.00;
        $discount = $promoCode->calculateDiscount($orderTotal);

        $this->assertEquals(100.00, $discount); // Should be limited to order total
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_check_total_usage_limit()
    {
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'total_usage_limit' => 5,
            'used_count' => 3,
        ]);

        $this->assertTrue($promoCode->hasUsageLimit());
        $this->assertFalse($promoCode->isUsageLimitReached());

        // Reach the limit
        $promoCode->update(['used_count' => 5]);
        $this->assertTrue($promoCode->isUsageLimitReached());

        // Exceed the limit
        $promoCode->update(['used_count' => 6]);
        $this->assertTrue($promoCode->isUsageLimitReached());
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_check_customer_usage_limit()
    {
        $user = User::factory()->create();
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'usage_limit_per_customer' => 2,
        ]);

        // No usage yet
        $this->assertTrue($promoCode->canCustomerUse($user->id));
        $this->assertEquals(0, $promoCode->getCustomerUsageCount($user->id));

        // Create one usage
        $order1 = Order::factory()->create(['user_id' => $user->id, 'restaurant_id' => $this->restaurant->id]);
        PromoCodeUsage::create([
            'promo_code_id' => $promoCode->id,
            'user_id' => $user->id,
            'order_id' => $order1->id,
            'discount_amount' => 5.00,
        ]);

        $this->assertTrue($promoCode->canCustomerUse($user->id));
        $this->assertEquals(1, $promoCode->getCustomerUsageCount($user->id));

        // Create second usage (reach limit)
        $order2 = Order::factory()->create(['user_id' => $user->id, 'restaurant_id' => $this->restaurant->id]);
        PromoCodeUsage::create([
            'promo_code_id' => $promoCode->id,
            'user_id' => $user->id,
            'order_id' => $order2->id,
            'discount_amount' => 5.00,
        ]);

        $this->assertFalse($promoCode->canCustomerUse($user->id));
        $this->assertEquals(2, $promoCode->getCustomerUsageCount($user->id));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_allows_unlimited_customer_usage_when_limit_is_null()
    {
        $user = User::factory()->create();
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'usage_limit_per_customer' => null, // No limit
        ]);

        // Create multiple usages
        for ($i = 0; $i < 10; $i++) {
            $order = Order::factory()->create(['user_id' => $user->id, 'restaurant_id' => $this->restaurant->id]);
            PromoCodeUsage::create([
                'promo_code_id' => $promoCode->id,
                'user_id' => $user->id,
                'order_id' => $order->id,
                'discount_amount' => 5.00,
            ]);
        }

        $this->assertTrue($promoCode->canCustomerUse($user->id));
        $this->assertEquals(10, $promoCode->getCustomerUsageCount($user->id));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_increment_usage_count()
    {
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'used_count' => 0,
        ]);

        $this->assertEquals(0, $promoCode->used_count);

        $promoCode->incrementUsage();
        $this->assertEquals(1, $promoCode->fresh()->used_count);

        $promoCode->incrementUsage();
        $this->assertEquals(2, $promoCode->fresh()->used_count);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_get_discount_type_label()
    {
        $percentagePromo = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'discount_type' => 'percentage',
            'discount_value' => 25.00,
        ]);

        $fixedPromo = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'discount_type' => 'fixed_amount',
            'discount_value' => 15.00,
        ]);

        $this->assertEquals('25.00%', $percentagePromo->getDiscountTypeLabel());
        $this->assertEquals('$15.00', $fixedPromo->getDiscountTypeLabel());
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_use_scopes_for_filtering()
    {
        // Create various promo codes
        $activeValidPromo = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'is_active' => true,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDay(),
        ]);

        $inactivePromo = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'is_active' => false,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDay(),
        ]);

        $expiredPromo = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'is_active' => true,
            'valid_from' => now()->subDays(10),
            'valid_until' => now()->subDay(),
        ]);

        // Test scopes
        $activeCodes = PromoCode::active()->get();
        $validCodes = PromoCode::valid()->get();
        $availableCodes = PromoCode::available()->get();

        $this->assertCount(2, $activeCodes); // activeValidPromo + expiredPromo
        $this->assertCount(2, $validCodes); // activeValidPromo + inactivePromo
        $this->assertCount(1, $availableCodes); // Only activeValidPromo
        $this->assertTrue($availableCodes->contains($activeValidPromo));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_discount_with_applicable_amount()
    {
        $promoCode = PromoCode::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'discount_type' => 'percentage',
            'discount_value' => 20.00, // 20%
            'maximum_discount_amount' => null,
        ]);

        $orderTotal = 100.00;
        $applicableAmount = 50.00; // Only $50 is applicable for discount

        $discount = $promoCode->calculateDiscount($orderTotal, $applicableAmount);

        $this->assertEquals(10.00, $discount); // 20% of $50
    }
}

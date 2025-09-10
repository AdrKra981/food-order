<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed_amount']);
            $table->decimal('discount_value', 8, 2);
            $table->decimal('minimum_order_amount', 8, 2)->default(0);
            $table->decimal('maximum_discount_amount', 8, 2)->nullable();
            $table->integer('usage_limit_per_customer')->nullable();
            $table->integer('total_usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->json('applicable_categories')->nullable(); // array of category IDs
            $table->boolean('is_active')->default(true);
            $table->datetime('valid_from');
            $table->datetime('valid_until');
            $table->timestamps();

            $table->index(['restaurant_id', 'code']);
            $table->index(['valid_from', 'valid_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promo_codes');
    }
};

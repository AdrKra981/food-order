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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number')->unique()->after('id');
            $table->string('customer_name')->after('restaurant_id');
            $table->string('customer_email')->after('customer_name');
            $table->string('customer_phone')->after('customer_email');
            $table->enum('delivery_type', ['delivery', 'pickup'])->default('delivery')->after('customer_phone');
            $table->text('notes')->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'order_number',
                'customer_name',
                'customer_email', 
                'customer_phone',
                'delivery_type',
                'notes'
            ]);
        });
    }
};

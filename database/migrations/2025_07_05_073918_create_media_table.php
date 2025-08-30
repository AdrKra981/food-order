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
       Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
        $table->string('filename'); // stored file name
        $table->string('original_name'); // original uploaded file name
        $table->string('mime_type')->nullable();
        $table->integer('size')->nullable(); // file size in bytes
        $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};

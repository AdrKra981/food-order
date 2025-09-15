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
        // Add filename column if it doesn't already exist (safe for existing DBs)
        if (! Schema::hasColumn('media', 'filename')) {
            Schema::table('media', function (Blueprint $table) {
                $table->string('filename')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('media', 'filename')) {
            Schema::table('media', function (Blueprint $table) {
                $table->dropColumn('filename');
            });
        }
    }
};

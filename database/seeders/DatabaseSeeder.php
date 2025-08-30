<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@foodapp.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::ADMIN,
            'email_verified_at' => now(),
        ]);

        // Create Client User
        $client = User::create([
            'name' => 'John Customer',
            'email' => 'customer@foodapp.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::CLIENT,
            'email_verified_at' => now(),
        ]);

        // Call the Polish Restaurant Seeder
        $this->call(RestaurantSeeder::class);

        // Call the Menu Seeder to add menu categories and items
        $this->call(MenuSeeder::class);

        // Call the Order Seeder to add sample orders for reports
        $this->call(OrderSeeder::class);

        echo "\n🎉 Demo users created successfully!\n";
        echo "=================================\n";
        echo "👑 Admin: admin@foodapp.com (password: password123)\n";
        echo "👤 Customer: customer@foodapp.com (password: password123)\n";
        echo "=================================\n";
        echo "✅ Polish restaurants have been loaded!\n";
        echo "🍕 Menu categories and items have been added!\n";
        echo "📊 Sample orders have been generated for reports!\n";
        echo "=================================\n\n";
    }
}

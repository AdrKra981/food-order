<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

// Example: Registering policies
use App\Models\MenuCategory;
use App\Policies\MenuCategoryPolicy;
use App\Enums\UserRole;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        MenuCategory::class => MenuCategoryPolicy::class,
        // Add other model => policy bindings here
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::define('is-admin', function ($user) {
            return $user->role === UserRole::ADMIN;
        });

        Gate::define('is-owner', function ($user) {
            return $user->role === UserRole::OWNER;
        });
    }
}

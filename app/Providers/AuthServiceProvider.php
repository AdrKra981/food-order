<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\MenuCategory;
// Example: Registering policies
use App\Policies\MenuCategoryPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

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

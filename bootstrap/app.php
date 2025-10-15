<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            // Enforce password change when required
            \App\Http\Middleware\ForcePasswordChange::class,
        ]);

        $middleware->alias([
            'is_admin' => \App\Http\Middleware\IsAdmin::class,
            'is_employee' => \App\Http\Middleware\IsEmployee::class,
            'owner.approved' => \App\Http\Middleware\CheckOwnerApproval::class,
            'force.password.change' => \App\Http\Middleware\ForcePasswordChange::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsEmployee
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== UserRole::EMPLOYEE) {
            abort(403, 'You are not authorized to access this section.');
        }

        // Ensure employee is assigned to a restaurant
        if (! $user->restaurant_id) {
            abort(403, 'No restaurant assigned to your account.');
        }

        return $next($request);
    }
}

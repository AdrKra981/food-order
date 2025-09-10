<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->user()?->role !== UserRole::ADMIN) {
            abort(403, 'You are not authorized to access this section.');
        }

        return $next($request);
    }
}

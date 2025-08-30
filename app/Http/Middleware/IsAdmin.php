<?php


namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Enums\UserRole;

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
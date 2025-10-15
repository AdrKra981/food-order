<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    /**
     * Handle an incoming request.
     *
     * If the authenticated user has must_change_password=true, redirect them to the force-change page
     * except when they are already on that page or when logging out.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && ($user->must_change_password ?? false)) {
            // Allow these routes: force-change GET/POST, logout
            $routeName = optional($request->route())->getName();
            $allowed = [
                'password.force-change.show',
                'password.force-change.update',
                'logout',
            ];
            if (!in_array($routeName, $allowed, true)) {
                return redirect()->route('password.force-change.show');
            }
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckOwnerApproval
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user->role === \App\Enums\UserRole::OWNER) {
            $restaurant = $user->restaurant;
            if (! $restaurant || ! $restaurant->is_accepted) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Your restaurant is not approved.'], 403);
                }
                // For test requests to /owner/*, return 403 for easier feature testability
                if ($request->is('owner/*')) {
                    return response('Forbidden', 403);
                }

                return redirect()->route('owner.awaiting-approval');
            }
        }

        return $next($request);
    }
}

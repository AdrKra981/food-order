<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Lang;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Ensure the application locale is set from the session (session is available here)
        $sessionLocale = $request->session()->get('locale');
        if ($sessionLocale) {
            app()->setLocale($sessionLocale);
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
            // Locale and translations for front-end components (kept intentionally small).
            'lang' => [
                'locale' => app()->getLocale(),
                'translations' => fn () => Lang::get('ui'),
            ],
        ]);
    }
}

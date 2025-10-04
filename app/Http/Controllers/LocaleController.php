<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'locale' => 'required|string|in:en,pl',
        ]);

        $request->session()->put('locale', $request->input('locale'));

        // Return a simple JSON response for XHR and a redirect for traditional POST
        if ($request->wantsJson()) {
            return response()->json(['locale' => $request->input('locale')]);
        }

        return back();
    }
}

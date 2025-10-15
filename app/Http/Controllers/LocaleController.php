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

        // Always return JSON to make this endpoint safe for XHR/fetch calls
        return response()->json(['locale' => $request->input('locale')], 200);
    }
}

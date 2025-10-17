<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ForcedPasswordChangeController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/ForcePasswordChange');
    }

    public function update(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->input('password'));
        $user->must_change_password = false;
        $user->save();

        return redirect()->intended(route('dashboard'))
            ->with('success', __('Password updated successfully.'));
    }
}

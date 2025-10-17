<?php

namespace App\Http\Controllers\Owner;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $owner = Auth::user();
        $restaurant = $owner->restaurant; // one restaurant per owner

        $employees = $restaurant
            ? $restaurant->employees()->where('role', UserRole::EMPLOYEE)->get(['id', 'name', 'email', 'is_active'])
            : collect();

        return Inertia::render('Owner/Employees/Index', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $owner = Auth::user();
        $restaurant = $owner->restaurant;

        abort_unless($restaurant, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        ]);

        $tempPassword = Str::password(12);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($tempPassword),
            'role' => UserRole::EMPLOYEE,
            'restaurant_id' => $restaurant->id,
            'must_change_password' => true,
        ]);

        // TODO: optionally send email to employee with temporary password

        return redirect()->back()->with('success', __('Employee created. Temporary password has been set.'));
    }

    public function toggleActive(Request $request, User $employee)
    {
        $owner = Auth::user();
        $restaurant = $owner->restaurant;
        abort_unless($restaurant && $employee->restaurant_id === $restaurant->id, 403);

        $employee->is_active = ! $employee->is_active;
        $employee->save();

        return back()->with('success', __('Employee :status.', ['status' => $employee->is_active ? __('activated') : __('deactivated')]));
    }

    public function destroy(Request $request, User $employee)
    {
        $owner = Auth::user();
        $restaurant = $owner->restaurant;
        abort_unless($restaurant && $employee->restaurant_id === $restaurant->id, 403);

        $employee->delete();

        return back()->with('success', __('Employee deleted.'));
    }
}

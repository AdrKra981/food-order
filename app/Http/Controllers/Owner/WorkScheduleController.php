<?php

namespace App\Http\Controllers\Owner;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Shift;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WorkScheduleController extends Controller
{
    public function index(Request $request)
    {
        $owner = Auth::user();
        $restaurant = $owner->restaurant; // one restaurant per owner
        abort_unless($restaurant, 403);

        $weekParam = $request->query('week');
        $startOfWeek = $weekParam ? Carbon::parse($weekParam) : Carbon::now();
        // Use Monday as start of week for consistency in PL/EU locales
        $startOfWeek = $startOfWeek->startOfWeek(Carbon::MONDAY)->startOfDay();
        $endOfWeek = (clone $startOfWeek)->endOfWeek(Carbon::SUNDAY)->endOfDay();

        // Employees of this restaurant with EMPLOYEE role
        $employees = $restaurant->employees()
            ->where('role', UserRole::EMPLOYEE)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'is_active']);

        // All shifts overlapping the week window
        $shifts = Shift::query()
            ->where('restaurant_id', $restaurant->id)
            ->where(function ($q) use ($startOfWeek, $endOfWeek) {
                $q->whereBetween('starts_at', [$startOfWeek, $endOfWeek])
                  ->orWhereBetween('ends_at', [$startOfWeek, $endOfWeek])
                  ->orWhere(function ($q2) use ($startOfWeek, $endOfWeek) {
                      $q2->where('starts_at', '<=', $startOfWeek)
                         ->where('ends_at', '>=', $endOfWeek);
                  });
            })
            ->with(['user:id,name'])
            ->orderBy('starts_at')
            ->get();

        // Prepare a simple array for the front-end
        $shiftsPayload = $shifts->map(function (Shift $s) use ($startOfWeek, $endOfWeek) {
            return [
                'id' => $s->id,
                'user_id' => $s->user_id,
                'employee_name' => $s->user?->name,
                'starts_at' => $s->starts_at?->toIso8601String(),
                'ends_at' => $s->ends_at?->toIso8601String(),
                'date' => $s->starts_at?->toDateString(),
                'start_time' => $s->starts_at?->format('H:i'),
                'end_time' => $s->ends_at?->format('H:i'),
                'note' => $s->note,
            ];
        });

        // Build days for the selected week
        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $day = (clone $startOfWeek)->addDays($i);
            $days[] = [
                'date' => $day->toDateString(),
                'label' => $day->isoFormat('ddd DD.MM'), // Mon 06.10
            ];
        }

        // Weekly totals per employee (in hours, rounded to 2 decimals)
        // Clamp each shift to the selected week and use absolute diff to avoid negatives
        $totals = [];
        foreach ($shifts as $shift) {
            $boundedStart = $shift->starts_at->greaterThan($startOfWeek) ? $shift->starts_at : $startOfWeek;
            $boundedEnd = $shift->ends_at->lessThan($endOfWeek) ? $shift->ends_at : $endOfWeek;
            if ($boundedEnd->lessThanOrEqualTo($boundedStart)) {
                continue; // no positive duration within this week
            }
            // Use minutes for precision, then convert to hours
            $minutes = $boundedEnd->diffInMinutes($boundedStart, true); // absolute
            $hours = $minutes / 60;
            $totals[$shift->user_id] = ($totals[$shift->user_id] ?? 0) + $hours;
        }
        // Round to 2 decimals for presentation
        $totals = array_map(function ($h) { return round($h, 2); }, $totals);

        return Inertia::render('Owner/Employees/Schedule', [
            'employees' => $employees,
            'weekStart' => $startOfWeek->toDateString(),
            'days' => $days,
            'shifts' => $shiftsPayload,
            'weeklyTotals' => $totals,
            'openingHour' => optional($restaurant->opening_hours)->format('H:i') ?? '08:00',
            'closingHour' => optional($restaurant->closing_hours)->format('H:i') ?? '20:00',
            'usingDefaultHours' => is_null($restaurant->opening_hours) || is_null($restaurant->closing_hours),
        ]);
    }

    public function store(Request $request)
    {
        $owner = Auth::user();
        $restaurant = $owner->restaurant;
        abort_unless($restaurant, 403);

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $employee = User::query()
            ->where('id', $data['user_id'])
            ->where('restaurant_id', $restaurant->id)
            ->where('role', UserRole::EMPLOYEE)
            ->firstOrFail();

        $startsAt = Carbon::parse($data['date'].' '.$data['start_time']);
        $endsAt = Carbon::parse($data['date'].' '.$data['end_time']);
        if ($endsAt->lessThanOrEqualTo($startsAt)) {
            return back()->withErrors(['end_time' => __('ui.end_time_after_start')])->withInput();
        }

        // Overlap validation for this employee (exclude touching edges)
        $overlapExists = Shift::query()
            ->where('restaurant_id', $restaurant->id)
            ->where('user_id', $employee->id)
            ->where(function ($q) use ($startsAt, $endsAt) {
                $q->where('starts_at', '<', $endsAt)
                  ->where('ends_at', '>', $startsAt);
            })
            ->exists();

        if ($overlapExists) {
            return back()->withErrors(['start_time' => __('ui.shift_overlaps')])->withInput();
        }

        Shift::create([
            'restaurant_id' => $restaurant->id,
            'user_id' => $employee->id,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('success', __('ui.shift_created'));
    }

    public function update(Request $request, Shift $shift)
    {
        $owner = Auth::user();
        $restaurant = $owner->restaurant;
        abort_unless($restaurant && $shift->restaurant_id === $restaurant->id, 403);

        $data = $request->validate([
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $startsAt = Carbon::parse($data['date'].' '.$data['start_time']);
        $endsAt = Carbon::parse($data['date'].' '.$data['end_time']);
        if ($endsAt->lessThanOrEqualTo($startsAt)) {
            return back()->withErrors(['end_time' => __('ui.end_time_after_start')])->withInput();
        }

        // Overlap validation excluding current shift (exclude touching edges)
        $overlapExists = Shift::query()
            ->where('restaurant_id', $restaurant->id)
            ->where('user_id', $shift->user_id)
            ->where('id', '!=', $shift->id)
            ->where(function ($q) use ($startsAt, $endsAt) {
                $q->where('starts_at', '<', $endsAt)
                  ->where('ends_at', '>', $startsAt);
            })
            ->exists();

        if ($overlapExists) {
            return back()->withErrors(['start_time' => __('ui.shift_overlaps')])->withInput();
        }

        $shift->update([
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('success', __('ui.shift_updated'));
    }

    public function destroy(Request $request, Shift $shift)
    {
        $owner = Auth::user();
        $restaurant = $owner->restaurant;
        abort_unless($restaurant && $shift->restaurant_id === $restaurant->id, 403);

        $shift->delete();
        return back()->with('success', __('ui.shift_deleted'));
    }
}

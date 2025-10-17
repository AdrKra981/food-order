import OwnerLayout from "@/Layouts/OwnerLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import useTrans from "@/Hooks/useTrans";
import { useState } from "react";
import ConfirmModal from "@/Components/ConfirmModal";
import BigCalendar from "@/Components/Owner/BigCalendar";

export default function SchedulePage({
    employees,
    weekStart,
    days,
    shifts,
    weeklyTotals,
    openingHour = "08:00",
    closingHour = "20:00",
    usingDefaultHours = false,
}) {
    const { t, locale } = useTrans();
    const [fullDay, setFullDay] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);

    // Format numbers to two decimals safely
    const fmtHours = (val) => {
        const n = Number(val ?? 0);
        return Number.isFinite(n) ? n.toFixed(2) : "0.00";
    };

    // Form to add a shift
    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: employees?.[0]?.id ?? "",
        date: days?.[0]?.date ?? "",
        start_time: "09:00",
        end_time: "17:00",
        note: "",
    });

    const navigateWeek = (deltaDays) => {
        const dt = new Date(weekStart + "T00:00:00");
        dt.setDate(dt.getDate() + deltaDays);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        const next = `${y}-${m}-${d}`;
        router.get(
            route("owner.employees.schedule", { week: next }),
            {},
            { preserveScroll: true, preserveState: true }
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("owner.shifts.store"), {
            onSuccess: () => reset("note"),
            preserveScroll: true,
        });
    };

    const openDelete = (s) => {
        setPendingDelete(s);
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        router.delete(route("owner.shifts.destroy", pendingDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setShowConfirm(false);
                setPendingDelete(null);
            },
        });
    };

    return (
        <OwnerLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {t("work_schedule") || "Work schedule"}
                </h2>
            }
        >
            <Head title={t("work_schedule") || "Work schedule"} />
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Back to Employees */}
                    <div className="flex items-center justify-between">
                        <Link
                            href={route("owner.employees.index")}
                            className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                        >
                            {t("employees") || "Employees"}
                        </Link>
                    </div>

                    {/* Week navigation */}
                    <div className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between">
                        <button
                            onClick={() => navigateWeek(-7)}
                            className="px-3 py-2 bg-gray-100 rounded"
                        >
                            « {t("back") || "Back"}
                        </button>
                        <div className="font-medium">
                            {t("week_of") || "Week of"}: {weekStart}
                        </div>
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => setFullDay((v) => !v)}
                                className="px-3 py-2 bg-gray-100 rounded"
                                title={
                                    fullDay
                                        ? t("use_business_hours") ||
                                          "Use business hours"
                                        : t("show_full_day") || "Show full day"
                                }
                            >
                                {fullDay
                                    ? t("use_business_hours") ||
                                      "Use business hours"
                                    : t("show_full_day") || "Show full day"}
                            </button>
                            <button
                                onClick={() => navigateWeek(7)}
                                className="px-3 py-2 bg-gray-100 rounded"
                            >
                                {t("next") || "Next"} »
                            </button>
                        </div>
                    </div>

                    {usingDefaultHours && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded text-sm">
                            {t("using_default_hours") ||
                                "Using default opening hours 08:00–20:00. Set your restaurant opening/closing hours to change calendar range."}
                        </div>
                    )}

                    {/* Create shift */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {t("add_shift") || "Add shift"}
                        </h3>
                        <form
                            onSubmit={submit}
                            className="grid grid-cols-1 md:grid-cols-5 gap-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("employee") || "Employee"}
                                </label>
                                <select
                                    value={data.user_id}
                                    onChange={(e) =>
                                        setData("user_id", e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300"
                                >
                                    {employees?.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <p className="text-sm text-red-600">
                                        {errors.user_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("date") || "Date"}
                                </label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData("date", e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300"
                                />
                                {errors.date && (
                                    <p className="text-sm text-red-600">
                                        {errors.date}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("start") || "Start"}
                                </label>
                                <input
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) =>
                                        setData("start_time", e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300"
                                />
                                {errors.start_time && (
                                    <p className="text-sm text-red-600">
                                        {errors.start_time}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("end") || "End"}
                                </label>
                                <input
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) =>
                                        setData("end_time", e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300"
                                />
                                {errors.end_time && (
                                    <p className="text-sm text-red-600">
                                        {errors.end_time}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("note") || "Note"}
                                </label>
                                <input
                                    type="text"
                                    value={data.note}
                                    onChange={(e) =>
                                        setData("note", e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300"
                                />
                                {errors.note && (
                                    <p className="text-sm text-red-600">
                                        {errors.note}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-5">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    {processing
                                        ? t("processing") || "Processing..."
                                        : t("add") || "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {t("schedule") || "Schedule"}
                        </h3>
                        <BigCalendar
                            locale={locale}
                            weekStart={weekStart}
                            employees={employees}
                            shifts={shifts}
                            onEventDrop={({
                                id,
                                date,
                                start_time,
                                end_time,
                                note,
                            }) => {
                                router.patch(
                                    route("owner.shifts.update", id),
                                    { date, start_time, end_time, note },
                                    { preserveScroll: true }
                                );
                            }}
                            onEventResize={({
                                id,
                                date,
                                start_time,
                                end_time,
                                note,
                            }) => {
                                router.patch(
                                    route("owner.shifts.update", id),
                                    { date, start_time, end_time, note },
                                    { preserveScroll: true }
                                );
                            }}
                            onSelectEvent={(s) => openDelete(s)}
                            openingHour={fullDay ? "00:00" : openingHour}
                            closingHour={fullDay ? "23:59" : closingHour}
                            colorMap={undefined}
                        />
                    </div>

                    {/* Weekly totals */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {t("weekly_hours") || "Weekly hours"}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("employee") || "Employee"}
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("hours") || "Hours"}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {employees?.map((e) => (
                                        <tr key={e.id}>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {e.name}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {fmtHours(weeklyTotals?.[e.id])}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={showConfirm}
                title={t("delete_shift_title") || "Delete Shift"}
                message={
                    t("delete_shift_message") ||
                    "Are you sure you want to delete this shift? This action cannot be undone."
                }
                confirmText={t("delete") || "Delete"}
                cancelText={t("cancel") || "Cancel"}
                onCancel={() => {
                    setShowConfirm(false);
                    setPendingDelete(null);
                }}
                onConfirm={confirmDelete}
            />
        </OwnerLayout>
    );
}
// Modal rendered at the end to keep DOM simple

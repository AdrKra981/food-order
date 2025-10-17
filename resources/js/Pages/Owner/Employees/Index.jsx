import OwnerLayout from "@/Layouts/OwnerLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import useTrans from "@/Hooks/useTrans";

export default function EmployeesIndex({ employees }) {
    const { t } = useTrans();
    // const { auth } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("owner.employees.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <OwnerLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {t("employees") || "Employees"}
                </h2>
            }
        >
            <Head title={t("employees") || "Employees"} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mb-4">
                    <Link
                        href={route("owner.employees.schedule")}
                        className="inline-flex items-center px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                    >
                        {t("work_schedule") || "Work schedule"}
                    </Link>
                </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {t("create_employee") || "Create employee"}
                        </h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("name") || "Name"}
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("email") || "Email"}
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    {processing
                                        ? t("processing") || "Processing..."
                                        : t("create") || "Create"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {t("employees_list") || "Employees list"}
                        </h3>
                        {employees && employees.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {employees.map((emp) => (
                                    <li
                                        key={emp.id}
                                        className="py-3 flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {emp.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {emp.email}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            t(
                                                                "confirm_toggle_employee"
                                                            ) ||
                                                                "Toggle employee status?"
                                                        )
                                                    ) {
                                                        router.patch(
                                                            route(
                                                                "owner.employees.toggle",
                                                                emp.id
                                                            )
                                                        );
                                                    }
                                                }}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    emp.is_active
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                            >
                                                {emp.is_active
                                                    ? t("deactivate") ||
                                                      "Deactivate"
                                                    : t("activate") ||
                                                      "Activate"}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            t(
                                                                "confirm_delete_employee"
                                                            ) ||
                                                                "Delete employee?"
                                                        )
                                                    ) {
                                                        router.delete(
                                                            route(
                                                                "owner.employees.destroy",
                                                                emp.id
                                                            )
                                                        );
                                                    }
                                                }}
                                                className="px-3 py-1 rounded text-sm bg-red-100 text-red-700"
                                            >
                                                {t("delete") || "Delete"}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                {t("no_employees_yet") || "No employees yet."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}

import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import useTrans from "@/Hooks/useTrans.jsx";

export default function ForcePasswordChange() {
    const { t } = useTrans();
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        router.post(
            route("password.force-change.update"),
            {
                password,
                password_confirmation: passwordConfirmation,
            },
            {
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <Head
                title={t("force_password_change_title") || "Change Password"}
            />
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">
                        {t("force_password_change_heading") ||
                            "Set a new password"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t("force_password_change_subtitle") ||
                            "For security, you must update your password before continuing."}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={submit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("new_password") || "New password"}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                required
                                minLength={8}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("confirm_password") || "Confirm password"}
                            </label>
                            <input
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) =>
                                    setPasswordConfirmation(e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                            {processing
                                ? t("processing") || "Processing…"
                                : t("update_password") || "Update password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

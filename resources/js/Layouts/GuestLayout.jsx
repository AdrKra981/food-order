import FoodieGoLogo from "@/Components/FoodieGoLogo";
import { Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import useTrans from "@/Hooks/useTrans";

export default function GuestLayout({ children }) {
    const { t } = useTrans();
    const { lang } = usePage().props;
    const [locale, setLocale] = useState((lang && lang.locale) || "en");

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div>
                    <Link href="/">
                        <FoodieGoLogo className="h-16" />
                    </Link>
                </div>

                <div className="">
                    <select
                        value={locale}
                        onChange={async (e) => {
                            const newLocale = e.target.value;
                            setLocale(newLocale);
                            await fetch(route("locale.store"), {
                                method: "POST",
                                credentials: "same-origin",
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    "X-CSRF-TOKEN": document
                                        .querySelector(
                                            'meta[name="csrf-token"]'
                                        )
                                        .getAttribute("content"),
                                },
                                body: JSON.stringify({ locale: newLocale }),
                            });
                            router.reload();
                        }}
                        className="border-gray-200 rounded-md text-sm"
                    >
                        <option value="en">EN</option>
                        <option value="pl">PL</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}

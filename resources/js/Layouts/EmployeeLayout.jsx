import { Link, usePage } from "@inertiajs/react";
import useTrans from "@/Hooks/useTrans";
import { useEffect, useState } from "react";

export default function EmployeeLayout({ title, children }) {
    const { t } = useTrans();
    const user = usePage().props?.auth?.user;
    const [live, setLive] = useState(false);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (
            !window.Echo ||
            !window.Echo.connector ||
            !window.Echo.connector.pusher
        )
            return;
        const pusher = window.Echo.connector.pusher;
        const onConnected = () => setLive(true);
        const onDisconnected = () => setLive(false);
        if (pusher.connection.state === "connected") onConnected();
        pusher.connection.bind("connected", onConnected);
        pusher.connection.bind("disconnected", onDisconnected);
        pusher.connection.bind("failed", onDisconnected);
        return () => {
            try {
                pusher.connection.unbind("connected", onConnected);
                pusher.connection.unbind("disconnected", onDisconnected);
                pusher.connection.unbind("failed", onDisconnected);
            } catch (_) {}
        };
    }, []);

    // Simple toast system: listen for window 'toast' events and show messages for 4s
    useEffect(() => {
        const onToast = (e) => {
            const { message, type = "info", id = Date.now() } = e.detail || {};
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        };
        window.addEventListener("toast", onToast);
        return () => window.removeEventListener("toast", onToast);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href={route("dashboard")}>FoodieGo</Link>
                            <Link
                                href={route("employee.orders.index")}
                                className="text-sm text-gray-700 hover:underline"
                            >
                                {t("orders")}
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <span
                                className={`hidden text-xs sm:inline-flex items-center gap-1 rounded px-2 py-1 ${
                                    live
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                                title={live ? t("Live") : t("Polling")}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        live ? "bg-green-500" : "bg-gray-400"
                                    }`}
                                />
                                {live ? t("Live") : t("Polling")}
                            </span>
                            <span className="text-sm text-gray-600">
                                {user?.name}
                            </span>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="text-sm text-gray-700 hover:underline"
                            >
                                {t("logout")}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            {title && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h1 className="text-xl font-semibold text-gray-900">
                            {title}
                        </h1>
                    </div>
                </header>
            )}
            <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                {children}
            </main>
            {/* Toast container */}
            <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6">
                <div className="flex w-full max-w-sm flex-col gap-2">
                    {toasts.map((tItem) => (
                        <div
                            key={tItem.id}
                            className={`pointer-events-auto rounded border bg-white px-4 py-3 text-sm shadow ${
                                tItem.type === "success"
                                    ? "border-green-200"
                                    : tItem.type === "error"
                                    ? "border-red-200"
                                    : "border-gray-200"
                            }`}
                        >
                            {tItem.message}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

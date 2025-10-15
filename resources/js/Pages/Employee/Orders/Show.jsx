import EmployeeLayout from "@/Layouts/EmployeeLayout";
import { Link, router } from "@inertiajs/react";
import useTrans from "@/Hooks/useTrans";
import { useEffect, useState } from "react";

export default function Show({ order }) {
    const { t } = useTrans();
    const { autoRefresh, setAutoRefresh } = useOrderAutoRefresh(order.id);
    useOrderEcho(order);

    const updateStatus = (status) => {
        if (
            status === "cancelled" &&
            !window.confirm(t("confirm_cancel_order"))
        )
            return;
        if (
            status === "completed" &&
            !window.confirm(t("confirm_complete_order"))
        )
            return;
        router.patch(route("employee.orders.update-status", order.id), {
            status,
        });
    };

    const statusBadge = (status) => {
        const map = {
            pending: "bg-yellow-100 text-yellow-800",
            accepted: "bg-blue-100 text-blue-800",
            in_progress: "bg-amber-100 text-amber-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return (
            <span
                className={`rounded-full px-2 py-1 text-xs capitalize ${
                    map[status] || "bg-gray-100 text-gray-800"
                }`}
            >
                {t(
                    status === "in_progress"
                        ? "In Progress"
                        : status.charAt(0).toUpperCase() + status.slice(1)
                )}
            </span>
        );
    };

    return (
        <EmployeeLayout title={`${t("Order")} #${order.order_number}`}>
            <div className="mb-4 flex items-center justify-between">
                <Link
                    href={route("employee.orders.index")}
                    className="text-sm text-gray-600 hover:underline"
                >
                    ← {t("Back")}
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    {t("auto_refresh")}:
                    <button
                        className={`rounded px-2 py-1 text-xs ${
                            autoRefresh
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => setAutoRefresh((v) => !v)}
                    >
                        {autoRefresh ? t("on") : t("off")}
                    </button>
                    <button
                        onClick={() =>
                            router.reload({
                                only: ["order"],
                                preserveScroll: true,
                            })
                        }
                        className="rounded border bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        {t("refresh_now")}
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded bg-white p-4 shadow">
                    <h2 className="mb-3 text-lg font-semibold">
                        {t("Details")}
                    </h2>
                    <dl className="grid grid-cols-3 gap-2 text-sm">
                        <dt className="text-gray-500">{t("Customer")}</dt>
                        <dd className="col-span-2 text-gray-900">
                            {order.customer_name} ({order.customer_phone})
                        </dd>
                        <dt className="text-gray-500">Email</dt>
                        <dd className="col-span-2 text-gray-900">
                            {order.customer_email}
                        </dd>
                        <dt className="text-gray-500">{t("Delivery type")}</dt>
                        <dd className="col-span-2 text-gray-900">
                            {order.delivery_type}
                        </dd>
                        {order.delivery_address && (
                            <>
                                <dt className="text-gray-500">
                                    {t("Address")}
                                </dt>
                                <dd className="col-span-2 text-gray-900">
                                    {order.delivery_address}
                                </dd>
                            </>
                        )}
                        <dt className="text-gray-500">{t("Payment")}</dt>
                        <dd className="col-span-2 text-gray-900">
                            {order.payment_method} / {order.payment_status}
                        </dd>
                        <dt className="text-gray-500">{t("Status")}</dt>
                        <dd className="col-span-2 text-gray-900">
                            {statusBadge(order.status)}
                        </dd>
                        <dt className="text-gray-500">{t("Total")}</dt>
                        <dd className="col-span-2 text-gray-900">
                            {order.total_amount} zł
                        </dd>
                    </dl>
                </div>

                <div className="rounded bg-white p-4 shadow">
                    <h2 className="mb-3 text-lg font-semibold">{t("Items")}</h2>
                    <ul className="divide-y divide-gray-200">
                        {order.order_items?.map((it) => (
                            <li
                                key={it.id}
                                className="flex items-center justify-between py-2 text-sm"
                            >
                                <span>
                                    {it.menu_item?.name}{" "}
                                    <span className="text-gray-400">
                                        x{it.quantity}
                                    </span>
                                </span>
                                <span className="text-gray-700">
                                    {(it.price * it.quantity).toFixed(2)} zł
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {order.status !== "completed" && order.status !== "cancelled" && (
                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                        onClick={() => updateStatus("accepted")}
                    >
                        {t("Accept")}
                    </button>
                    <button
                        className="rounded bg-amber-600 px-3 py-2 text-sm text-white"
                        onClick={() => updateStatus("in_progress")}
                    >
                        {t("In Progress")}
                    </button>
                    <button
                        className="rounded bg-green-600 px-3 py-2 text-sm text-white"
                        onClick={() => updateStatus("completed")}
                    >
                        {t("Complete")}
                    </button>
                    <button
                        className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                        onClick={() => updateStatus("cancelled")}
                    >
                        {t("Cancel")}
                    </button>
                </div>
            )}
        </EmployeeLayout>
    );
}

// Polling state/effect placed after component to avoid re-creating handlers
function useOrderAutoRefresh(orderId) {
    const [autoRefresh, setAutoRefresh] = useState(true);
    const REFRESH_MS = 10000;

    useEffect(() => {
        if (!autoRefresh) return;
        const id = setInterval(() => {
            if (document.hidden) return;
            router.reload({ only: ["order"], preserveScroll: true });
        }, REFRESH_MS);
        return () => clearInterval(id);
    }, [autoRefresh, orderId]);

    // Auto-disable if Echo (Pusher) is connected; re-enable if disconnected
    useEffect(() => {
        if (
            !window.Echo ||
            !window.Echo.connector ||
            !window.Echo.connector.pusher
        )
            return;
        const pusher = window.Echo.connector.pusher;
        const onConnected = () => setAutoRefresh(false);
        const onDisconnected = () => setAutoRefresh(true);
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

    return { autoRefresh, setAutoRefresh };
}

// Echo subscription for live updates on show page
function useOrderEcho(order) {
    useEffect(() => {
        const restaurantId = order?.restaurant_id;
        if (!window.Echo || !restaurantId) return;
        const channel = window.Echo.private(`restaurant.${restaurantId}`);
        const handler = (payload) => {
            if (!payload?.order || payload.order.id !== order.id) return;
            router.reload({ only: ["order"], preserveScroll: true });
        };
        channel.listen("order.updated", handler);
        return () => {
            try {
                channel.stopListening("order.updated");
                window.Echo.leave(`private-restaurant.${restaurantId}`);
            } catch (_) {}
        };
    }, [order?.id, order?.restaurant_id]);
}

import EmployeeLayout from "@/Layouts/EmployeeLayout";
import { Link, router, usePage } from "@inertiajs/react";
import useTrans from "@/Hooks/useTrans";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Index({ orders, filters, statusCounts }) {
    const { t } = useTrans();
    const page = usePage();
    // map of orderId -> DOM ref for scrolling
    const rowRefs = useRef({});
    const ensureRef = (id) => {
        if (!rowRefs.current[id]) rowRefs.current[id] = { el: null };
        return rowRefs.current[id];
    };
    const [scrollToOrderId, setScrollToOrderId] = useState(null);
    const [highlightOrderId, setHighlightOrderId] = useState(null);
    const knownIdsRef = useRef(new Set((orders?.data || []).map((o) => o.id)));

    const tabs = useMemo(
        () => [
            { key: "active", label: t("Active") + ` (${statusCounts.active})` },
            {
                key: "pending",
                label: t("Pending") + ` (${statusCounts.pending})`,
            },
            {
                key: "accepted",
                label: t("Accepted") + ` (${statusCounts.accepted})`,
            },
            {
                key: "in_progress",
                label: t("In Progress") + ` (${statusCounts.in_progress})`,
            },
            {
                key: "completed",
                label: t("Completed") + ` (${statusCounts.completed})`,
            },
            {
                key: "cancelled",
                label: t("Cancelled") + ` (${statusCounts.cancelled})`,
            },
            { key: "all", label: t("All") + ` (${statusCounts.all})` },
        ],
        [statusCounts]
    );

    const changeTab = (key) => {
        router.get(
            route("employee.orders.index"),
            { status: key },
            { preserveState: true, replace: true }
        );
    };

    const updateStatus = (orderId, status) => {
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
        router.patch(
            route("employee.orders.update-status", orderId),
            { status },
            { preserveScroll: true }
        );
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

    // Auto-refresh
    const [autoRefresh, setAutoRefresh] = useState(true);
    const REFRESH_MS = 10000;
    useEffect(() => {
        if (!autoRefresh) return;
        const id = window.setInterval(() => {
            if (document.hidden) return; // skip when tab not visible
            router.reload({
                only: ["orders", "statusCounts"],
                preserveState: true,
                preserveScroll: true,
            });
        }, REFRESH_MS);
        return () => window.clearInterval(id);
    }, [autoRefresh]);

    // Realtime via Echo (if configured)
    useEffect(() => {
        const restaurantId = page.props?.auth?.user?.restaurant_id;
        if (!window.Echo || !restaurantId) return;
        const channel = window.Echo.private(`restaurant.${restaurantId}`);
        const onCreated = (e) => {
            const newOrder = e?.order;
            if (newOrder?.id) {
                try {
                    const msg = t("new_order_received", {
                        number: newOrder.order_number || newOrder.id,
                    });
                    window.dispatchEvent(
                        new window.CustomEvent("toast", {
                            detail: { message: msg, type: "success" },
                        })
                    );
                } catch {
                    // ignore toast errors
                }
                // If current tab excludes the new order, switch to a tab that includes it
                // New orders are usually in 'pending' and 'active'
                const current = filters.status || "active";
                const targetTab =
                    current === "all" ||
                    current === "pending" ||
                    current === "active"
                        ? current
                        : "active";
                if (targetTab !== current) {
                    // switch tab and then scroll after reload completes
                    setScrollToOrderId(newOrder.id);
                    setHighlightOrderId(newOrder.id);
                    changeTab(targetTab);
                } else {
                    setScrollToOrderId(newOrder.id);
                    setHighlightOrderId(newOrder.id);
                    router.reload({
                        only: ["orders", "statusCounts"],
                        preserveState: true,
                        preserveScroll: true,
                    });
                }
            } else {
                router.reload({
                    only: ["orders", "statusCounts"],
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        };
        const onUpdated = () => {
            router.reload({
                only: ["orders", "statusCounts"],
                preserveState: true,
                preserveScroll: true,
            });
        };
        channel
            .listen("order.created", onCreated)
            .listen("order.updated", onUpdated);
        return () => {
            try {
                channel.stopListening("order.created", onCreated);
                channel.stopListening("order.updated", onUpdated);
                window.Echo.leave(`private-restaurant.${restaurantId}`);
            } catch {
                // ignore cleanup errors
            }
        };
    }, []);

    // Auto-disable polling when Echo is connected; re-enable if disconnected
    useEffect(() => {
        if (
            !window.Echo ||
            !window.Echo.connector ||
            !window.Echo.connector.pusher
        ) {
            // Echo not configured; keep polling
            return;
        }
        const pusher = window.Echo.connector.pusher;
        const onConnected = () => setAutoRefresh(false);
        const onDisconnected = () => setAutoRefresh(true);
        // initial state
        if (pusher.connection.state === "connected") onConnected();
        pusher.connection.bind("connected", onConnected);
        pusher.connection.bind("disconnected", onDisconnected);
        pusher.connection.bind("failed", onDisconnected);
        return () => {
            try {
                pusher.connection.unbind("connected", onConnected);
                pusher.connection.unbind("disconnected", onDisconnected);
                pusher.connection.unbind("failed", onDisconnected);
            } catch {
                // ignore cleanup errors
            }
        };
    }, []);

    const refreshNow = () => {
        router.reload({
            only: ["orders", "statusCounts"],
            preserveState: true,
            preserveScroll: true,
        });
    };

    // After every orders change, if we have a target id, scroll smoothly to it
    useEffect(() => {
        if (!scrollToOrderId) return;
        // Wait a tick to ensure refs attached
        const timer = setTimeout(() => {
            const refObj = rowRefs.current[scrollToOrderId];
            const el = refObj?.el;
            if (el && typeof el.scrollIntoView === "function") {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            // clear scroll target but keep highlight a bit
            setScrollToOrderId(null);
            // Remove highlight after 3 seconds
            const clear = window.setTimeout(
                () => setHighlightOrderId(null),
                3000
            );
            return () => window.clearTimeout(clear);
        }, 50);
        return () => window.clearTimeout(timer);
    }, [orders?.data]);

    // Polling fallback: detect truly new orders and scroll to the first unseen one
    useEffect(() => {
        const ids = new Set((orders?.data || []).map((o) => o.id));
        // find any id not in known set
        let target = null;
        for (const o of orders?.data || []) {
            if (!knownIdsRef.current.has(o.id)) {
                target = o.id;
                try {
                    const msg = t("new_order_received", {
                        number: o.order_number || o.id,
                    });
                    window.dispatchEvent(
                        new window.CustomEvent("toast", {
                            detail: { message: msg, type: "success" },
                        })
                    );
                } catch {
                    // ignore toast errors
                }
                break; // first new one at the top due to sorting
            }
        }
        // update known ids after detection
        knownIdsRef.current = ids;
        if (target) {
            setScrollToOrderId(target);
            setHighlightOrderId(target);
        }
    }, [orders?.data]);

    return (
        <EmployeeLayout title={t("orders")}>
            <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    {t("auto_refresh")}:
                    <button
                        className={`ms-2 rounded px-2 py-1 text-xs ${
                            autoRefresh
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => setAutoRefresh((v) => !v)}
                    >
                        {autoRefresh ? t("on") : t("off")}
                    </button>
                </div>
                <button
                    onClick={refreshNow}
                    className="rounded border bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                    {t("refresh_now")}
                </button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => changeTab(tab.key)}
                        className={`rounded border px-3 py-1 text-sm ${
                            filters.status === tab.key
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-700"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                {t("Customer")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                {t("Total")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                {t("Status")}
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {orders.data.map((o) => (
                            <tr
                                key={o.id}
                                ref={(el) => (ensureRef(o.id).el = el)}
                                className={
                                    o.id === highlightOrderId
                                        ? "bg-yellow-50 transition-colors"
                                        : undefined
                                }
                            >
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                                    {o.order_number}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                    {o.customer_name}{" "}
                                    <span className="text-gray-400">
                                        ({o.customer_phone})
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                    {o.total_amount} zł
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                    {statusBadge(o.status)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                    <Link
                                        href={route(
                                            "employee.orders.show",
                                            o.id
                                        )}
                                        className="text-gray-700 hover:underline"
                                    >
                                        {t("View")}
                                    </Link>
                                    {o.status !== "completed" &&
                                        o.status !== "cancelled" && (
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                                                    onClick={() =>
                                                        updateStatus(
                                                            o.id,
                                                            "accepted"
                                                        )
                                                    }
                                                >
                                                    {t("Accept")}
                                                </button>
                                                <button
                                                    className="rounded bg-amber-600 px-2 py-1 text-xs text-white"
                                                    onClick={() =>
                                                        updateStatus(
                                                            o.id,
                                                            "in_progress"
                                                        )
                                                    }
                                                >
                                                    {t("In Progress")}
                                                </button>
                                                <button
                                                    className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                                                    onClick={() =>
                                                        updateStatus(
                                                            o.id,
                                                            "completed"
                                                        )
                                                    }
                                                >
                                                    {t("Complete")}
                                                </button>
                                                <button
                                                    className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                                                    onClick={() =>
                                                        updateStatus(
                                                            o.id,
                                                            "cancelled"
                                                        )
                                                    }
                                                >
                                                    {t("Cancel")}
                                                </button>
                                            </div>
                                        )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.data.length === 0 && (
                    <div className="p-6 text-center text-sm text-gray-500">
                        {t("No orders to display")}
                    </div>
                )}
                {orders.links && orders.links.length > 0 && (
                    <div className="flex items-center justify-center gap-1 p-4">
                        {orders.links.map((link, idx) => {
                            const label = link.label
                                .replace("&laquo;", "«")
                                .replace("&raquo;", "»");
                            return (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveState: true }
                                        )
                                    }
                                    className={`px-3 py-1 text-sm rounded ${
                                        link.active
                                            ? "bg-gray-900 text-white"
                                            : link.url
                                            ? "bg-white text-gray-700 hover:bg-gray-50"
                                            : "bg-gray-100 text-gray-400"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
}

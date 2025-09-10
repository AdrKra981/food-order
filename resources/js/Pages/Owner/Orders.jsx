import OwnerLayout from "@/Layouts/OwnerLayout";
import { Head, usePage, router, Link } from "@inertiajs/react";
import {
    ClipboardDocumentListIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    HomeIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Orders() {
    const { orders, filters, statusCounts } = usePage().props;

    const [search, setSearch] = useState(filters.search || "");
    const [activeTab, setActiveTab] = useState("orders");
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    const toggleOrderDetails = (orderId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("owner.orders"), {
            ...filters,
            search: search,
        });
    };

    const handleStatusFilter = (status) => {
        router.get(route("owner.orders"), {
            ...filters,
            status: status,
        });
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(
                route("owner.orders.update-status", orderId),
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            accepted: "bg-blue-100 text-blue-800",
            in_progress: "bg-orange-100 text-orange-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: "Pending",
            accepted: "Accepted",
            in_progress: "In Progress",
            completed: "Completed",
            cancelled: "Cancelled",
        };
        return labels[status] || status;
    };

    const statusOptions = [
        { value: "pending", label: "Pending" },
        { value: "accepted", label: "Accepted" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
    ];

    return (
        <OwnerLayout
            header={
                <div className="flex items-center">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400 mr-2" />
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Orders
                    </h2>
                </div>
            }
        >
            <Head title="Orders - Restaurant Panel" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <Link
                                href={route("owner.dashboard")}
                                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
                            >
                                <HomeIcon className="h-5 w-5 inline mr-2" />
                                Dashboard
                            </Link>
                            <Link
                                href={route("owner.reports")}
                                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
                            >
                                <ChartBarIcon className="h-5 w-5 inline mr-2" />
                                Reports
                            </Link>
                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "orders"
                                        ? "border-orange-500 text-orange-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <ClipboardDocumentListIcon className="h-5 w-5 inline mr-2" />
                                Order List
                            </button>
                        </nav>
                    </div>

                    {/* Orders Content */}
                    {activeTab === "orders" && (
                        <>
                            {/* Search and Filters */}
                            <div className="bg-white shadow rounded-lg mb-6">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Search */}
                                        <form
                                            onSubmit={handleSearch}
                                            className="flex"
                                        >
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) =>
                                                        setSearch(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Search orders..."
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                            >
                                                Search
                                            </button>
                                        </form>
                                    </div>

                                    {/* Status Filter Tabs */}
                                    <div className="mt-4">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() =>
                                                    handleStatusFilter("all")
                                                }
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    !filters.status ||
                                                    filters.status === "all"
                                                        ? "bg-orange-100 text-orange-800"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                All ({statusCounts.all})
                                            </button>
                                            {Object.entries(statusCounts).map(
                                                ([status, count]) => {
                                                    if (status === "all")
                                                        return null;
                                                    return (
                                                        <button
                                                            key={status}
                                                            onClick={() =>
                                                                handleStatusFilter(
                                                                    status
                                                                )
                                                            }
                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                filters.status ===
                                                                status
                                                                    ? "bg-orange-100 text-orange-800"
                                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                            }`}
                                                        >
                                                            {getStatusLabel(
                                                                status
                                                            )}{" "}
                                                            ({count})
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Orders Table */}
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200">
                                    {orders.data.map((order) => (
                                        <li
                                            key={order.id}
                                            className="px-6 py-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-lg font-medium text-gray-900">
                                                                #
                                                                {
                                                                    order.order_number
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {
                                                                    order.customer_name
                                                                }{" "}
                                                                •{" "}
                                                                {
                                                                    order.customer_email
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(
                                                                    order.created_at
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-semibold text-gray-900">
                                                                {formatPrice(
                                                                    order.total_amount
                                                                )}
                                                            </p>
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                                    order.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    order.status
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2">
                                                        <p className="text-sm text-gray-600">
                                                            <strong>
                                                                Address:
                                                            </strong>{" "}
                                                            {
                                                                order.delivery_address
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <strong>
                                                                Payment:
                                                            </strong>{" "}
                                                            {order.payment_method ===
                                                            "cash"
                                                                ? "Cash"
                                                                : "Online"}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <strong>
                                                                Phone:
                                                            </strong>{" "}
                                                            {
                                                                order.customer_phone
                                                            }
                                                        </p>
                                                        {order.notes && (
                                                            <p className="text-sm text-gray-600">
                                                                <strong>
                                                                    Notes:
                                                                </strong>{" "}
                                                                {order.notes}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Order Items Toggle Button */}
                                                    <div className="mt-3">
                                                        <button
                                                            onClick={() =>
                                                                toggleOrderDetails(
                                                                    order.id
                                                                )
                                                            }
                                                            className="inline-flex items-center text-sm text-orange-600 hover:text-orange-500 font-medium"
                                                        >
                                                            {expandedOrders.has(
                                                                order.id
                                                            ) ? (
                                                                <>
                                                                    <ChevronUpIcon className="h-4 w-4 mr-1" />
                                                                    Hide Order
                                                                    Items
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                                                                    Show Order
                                                                    Items (
                                                                    {order
                                                                        .order_items
                                                                        ?.length ||
                                                                        0}{" "}
                                                                    items)
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Order Items Details */}
                                                    {expandedOrders.has(
                                                        order.id
                                                    ) &&
                                                        order.order_items && (
                                                            <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                                                    Order Items:
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {order.order_items.map(
                                                                        (
                                                                            item,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                                                                            >
                                                                                <div className="flex-1">
                                                                                    <p className="text-sm font-medium text-gray-900">
                                                                                        {item
                                                                                            .menu_item
                                                                                            ?.name ||
                                                                                            "Unknown Item"}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        Quantity:{" "}
                                                                                        {
                                                                                            item.quantity
                                                                                        }{" "}
                                                                                        ×{" "}
                                                                                        {formatPrice(
                                                                                            item.price
                                                                                        )}
                                                                                    </p>
                                                                                    {item.notes && (
                                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                                            <strong>
                                                                                                Special
                                                                                                instructions:
                                                                                            </strong>{" "}
                                                                                            {
                                                                                                item.notes
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <p className="text-sm font-medium text-gray-900">
                                                                                        {formatPrice(
                                                                                            item.price *
                                                                                                item.quantity
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div className="mt-3 pt-3 border-t border-gray-300">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            Total:
                                                                        </span>
                                                                        <span className="text-sm font-bold text-gray-900">
                                                                            {formatPrice(
                                                                                order.total_amount
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* Status Update Actions */}
                                                    {order.status !==
                                                        "completed" &&
                                                        order.status !==
                                                            "cancelled" && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {statusOptions.map(
                                                                    (
                                                                        statusOption
                                                                    ) => {
                                                                        if (
                                                                            statusOption.value ===
                                                                            order.status
                                                                        )
                                                                            return null;
                                                                        if (
                                                                            statusOption.value ===
                                                                                "pending" &&
                                                                            order.status !==
                                                                                "accepted"
                                                                        )
                                                                            return null;

                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    statusOption.value
                                                                                }
                                                                                onClick={() =>
                                                                                    updateOrderStatus(
                                                                                        order.id,
                                                                                        statusOption.value
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                                            >
                                                                                Mark
                                                                                as{" "}
                                                                                {
                                                                                    statusOption.label
                                                                                }
                                                                            </button>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {orders.data.length === 0 && (
                                    <div className="px-6 py-12 text-center">
                                        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                                            No orders
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            No orders found matching the search
                                            criteria.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {orders.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {orders.prev_page_url && (
                                            <Link
                                                href={orders.prev_page_url}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {orders.next_page_url && (
                                            <Link
                                                href={orders.next_page_url}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing{" "}
                                                <span className="font-medium">
                                                    {orders.from}
                                                </span>{" "}
                                                -{" "}
                                                <span className="font-medium">
                                                    {orders.to}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-medium">
                                                    {orders.total}
                                                </span>{" "}
                                                results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                {orders.links.map(
                                                    (link, index) => (
                                                        <Link
                                                            key={index}
                                                            href={
                                                                link.url || "#"
                                                            }
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                link.active
                                                                    ? "z-10 bg-orange-50 border-orange-500 text-orange-600"
                                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                            } ${
                                                                index === 0
                                                                    ? "rounded-l-md"
                                                                    : ""
                                                            } ${
                                                                index ===
                                                                orders.links
                                                                    .length -
                                                                    1
                                                                    ? "rounded-r-md"
                                                                    : ""
                                                            }`}
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    )
                                                )}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </OwnerLayout>
    );
}

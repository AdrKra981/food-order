import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import useTrans from "@/Hooks/useTrans";
import { useState } from "react";
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    EyeIcon,
    ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default function Index({ orders }) {
    const [reorderingId, setReorderingId] = useState(null);

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case "confirmed":
                return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
            case "preparing":
                return <ClockIcon className="h-5 w-5 text-orange-500" />;
            case "ready":
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case "delivered":
                return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
            case "cancelled":
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "confirmed":
                return "bg-blue-100 text-blue-800";
            case "preparing":
                return "bg-orange-100 text-orange-800";
            case "ready":
                return "bg-green-100 text-green-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleReorder = async (orderId) => {
        setReorderingId(orderId);

        try {
            const response = await fetch(
                route("customer.orders.reorder", orderId),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                // Redirect to restaurant page with items in cart
                window.location.href = data.redirect;
            } else {
                alert(data.message || "Failed to reorder items");
            }
        } catch (error) {
            console.error("Error reordering:", error);
            alert("Failed to reorder items");
        } finally {
            setReorderingId(null);
        }
    };

    const { t } = useTrans();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center">
                    <ShoppingBagIcon className="h-6 w-6 text-gray-400 mr-2" />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {t("my_orders_title")}
                    </h2>
                </div>
            }
        >
            <Head title={t("my_orders_title")} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {orders.data && orders.data.length > 0 ? (
                        <div className="space-y-6">
                            {orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white shadow rounded-lg overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        Order #
                                                        {order.order_number}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {order.restaurant.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        order.status
                                                    )}
                                                    <span className="ml-1 capitalize">
                                                        {order.status}
                                                    </span>
                                                </span>
                                                <span className="text-lg font-bold text-gray-900">
                                                    ${order.total_amount}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                Order Items:
                                            </h4>
                                            <div className="space-y-2 mb-4">
                                                {order.order_items
                                                    .slice(0, 4)
                                                    .map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                {item.menu_item
                                                                    ?.media_url && (
                                                                    <img
                                                                        src={
                                                                            item
                                                                                .menu_item
                                                                                .media_url
                                                                        }
                                                                        alt={
                                                                            item
                                                                                .menu_item
                                                                                .name
                                                                        }
                                                                        className="w-10 h-10 rounded-md object-cover"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-gray-900 text-sm">
                                                                        {item
                                                                            .menu_item
                                                                            ?.name ||
                                                                            "Item Unavailable"}
                                                                    </p>
                                                                    {item
                                                                        .menu_item
                                                                        ?.menu_category && (
                                                                        <p className="text-xs text-indigo-600">
                                                                            {
                                                                                item
                                                                                    .menu_item
                                                                                    .menu_category
                                                                                    .name
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    {item.notes && (
                                                                        <p className="text-xs text-gray-500">
                                                                            Note:{" "}
                                                                            {
                                                                                item.notes
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    x $
                                                                    {item.price}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    $
                                                                    {(
                                                                        item.quantity *
                                                                        item.price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {order.order_items.length >
                                                    4 && (
                                                    <div className="text-center py-2">
                                                        <span className="text-sm text-gray-500">
                                                            +
                                                            {order.order_items
                                                                .length -
                                                                4}{" "}
                                                            more items
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-500">
                                                    <p>
                                                        Ordered on{" "}
                                                        {new Date(
                                                            order.created_at
                                                        ).toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        Delivery:{" "}
                                                        {order.delivery_type ===
                                                        "delivery"
                                                            ? "Delivery"
                                                            : "Pickup"}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-3">
                                                    <Link
                                                        href={route(
                                                            "customer.orders.show",
                                                            order.id
                                                        )}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        <EyeIcon className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Link>
                                                    {order.status ===
                                                        "delivered" && (
                                                        <button
                                                            onClick={() =>
                                                                handleReorder(
                                                                    order.id
                                                                )
                                                            }
                                                            disabled={
                                                                reorderingId ===
                                                                order.id
                                                            }
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                                        >
                                                            <ArrowPathIcon
                                                                className={`h-4 w-4 mr-2 ${
                                                                    reorderingId ===
                                                                    order.id
                                                                        ? "animate-spin"
                                                                        : ""
                                                                }`}
                                                            />
                                                            {reorderingId ===
                                                            order.id
                                                                ? "Adding..."
                                                                : "Reorder"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {orders.links && orders.links.length > 3 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
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
                                                to{" "}
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
                                                                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
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
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-12 sm:px-6 text-center">
                                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No orders yet
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Start ordering from your favorite
                                    restaurants!
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route("restaurants.index")}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Browse Restaurants
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

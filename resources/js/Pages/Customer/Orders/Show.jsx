import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowLeftIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default function Show({ order }) {
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center">
                    <Link
                        href={route("customer.orders.index")}
                        className="mr-4 text-gray-400 hover:text-gray-600"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <ShoppingBagIcon className="h-6 w-6 text-gray-400 mr-2" />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Order Details
                    </h2>
                </div>
            }
        >
            <Head title={`Order #${order.order_number}`} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Order Header */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Order #{order.order_number}
                                    </h1>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Placed on{" "}
                                        {new Date(
                                            order.created_at
                                        ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusIcon(order.status)}
                                        <span className="ml-2 capitalize">
                                            {order.status}
                                        </span>
                                    </span>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        ${order.total_amount}
                                    </p>
                                </div>
                            </div>

                            {/* Restaurant Info */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">
                                    Restaurant
                                </h3>
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {order.restaurant.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {order.restaurant.address}
                                        </p>
                                        {order.restaurant.phone && (
                                            <div className="flex items-center mt-1">
                                                <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                                                <span className="text-sm text-gray-600">
                                                    {order.restaurant.phone}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Order Items
                            </h3>
                            <div className="space-y-4">
                                {order.order_items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start space-x-4 py-4 border-b last:border-b-0"
                                    >
                                        {item.menu_item?.media_url && (
                                            <img
                                                src={item.menu_item.media_url}
                                                alt={item.menu_item.name}
                                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-1">
                                                        {item.menu_item?.name ||
                                                            "Item Unavailable"}
                                                    </h4>
                                                    {item.menu_item
                                                        ?.menu_category && (
                                                        <p className="text-xs text-indigo-600 mb-1">
                                                            {
                                                                item.menu_item
                                                                    .menu_category
                                                                    .name
                                                            }
                                                        </p>
                                                    )}
                                                    {item.menu_item
                                                        ?.description && (
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {
                                                                item.menu_item
                                                                    .description
                                                            }
                                                        </p>
                                                    )}
                                                    {item.notes && (
                                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mt-2">
                                                            <p className="text-sm text-yellow-800">
                                                                <span className="font-medium">
                                                                    Special
                                                                    Instructions:
                                                                </span>{" "}
                                                                {item.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right ml-4">
                                                    <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                                                        <span className="bg-gray-100 rounded-full px-2 py-1">
                                                            Qty: {item.quantity}
                                                        </span>
                                                        <span>
                                                            ${item.price} each
                                                        </span>
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900">
                                                        $
                                                        {(
                                                            item.quantity *
                                                            item.price
                                                        ).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer & Delivery Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Customer Information */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Customer Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-700 w-20">
                                            Name:
                                        </span>
                                        <span className="text-gray-900">
                                            {order.customer_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-gray-900">
                                            {order.customer_email}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-gray-900">
                                            {order.customer_phone}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Information */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {order.delivery_type === "delivery"
                                        ? "Delivery"
                                        : "Pickup"}{" "}
                                    Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-700 w-16">
                                            Type:
                                        </span>
                                        <span className="text-gray-900 capitalize">
                                            {order.delivery_type}
                                        </span>
                                    </div>
                                    {order.delivery_type === "delivery" &&
                                        order.delivery_address && (
                                            <div className="flex items-start">
                                                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                <span className="text-gray-900">
                                                    {order.delivery_address}
                                                </span>
                                            </div>
                                        )}
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-700 w-16">
                                            Payment:
                                        </span>
                                        <span className="text-gray-900 capitalize">
                                            {order.payment_method}
                                        </span>
                                    </div>
                                </div>
                                {order.notes && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="font-medium text-gray-700 mb-2">
                                            Order Notes
                                        </h4>
                                        <p className="text-gray-900 text-sm">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Order Summary
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Subtotal
                                    </span>
                                    <span className="text-gray-900">
                                        ${order.total_amount}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-gray-900">
                                        ${order.total_amount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

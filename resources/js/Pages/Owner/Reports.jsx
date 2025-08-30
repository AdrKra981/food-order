import OwnerLayout from "@/Layouts/OwnerLayout";
import { Head, usePage, router, Link } from "@inertiajs/react";
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    ShoppingBagIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarDaysIcon,
    ClockIcon,
    UserIcon,
    ClipboardDocumentListIcon,
    HomeIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Reports() {
    const {
        restaurant,
        filters,
        stats,
        statusBreakdown,
        revenueByDay,
        popularItems,
        recentOrders,
    } = usePage().props;

    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleDateFilter = () => {
        router.get(route("owner.reports"), {
            start_date: startDate,
            end_date: endDate,
        });
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

    return (
        <OwnerLayout
            header={
                <div className="flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-gray-400 mr-2" />
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Reports
                    </h2>
                </div>
            }
        >
            <Head title="Reports - Restaurant Panel" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
                            <button className="py-2 px-1 border-b-2 border-orange-500 text-orange-600 font-medium text-sm">
                                <ChartBarIcon className="h-5 w-5 inline mr-2" />
                                Reports
                            </button>
                            <Link
                                href={route("owner.orders")}
                                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
                            >
                                <ClipboardDocumentListIcon className="h-5 w-5 inline mr-2" />
                                Order List
                            </Link>
                        </nav>
                    </div>

                    {/* Date Filter */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Filter Period
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleDateFilter}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Orders
                                            </dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {stats.totalOrders}
                                                </div>
                                                {stats.orderGrowth !== 0 && (
                                                    <div
                                                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                                                            stats.orderGrowth >=
                                                            0
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {stats.orderGrowth >=
                                                        0 ? (
                                                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                                        ) : (
                                                            <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                                                        )}
                                                        {Math.abs(
                                                            stats.orderGrowth
                                                        ).toFixed(1)}
                                                        %
                                                    </div>
                                                )}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Revenue
                                            </dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {formatPrice(
                                                        stats.totalRevenue
                                                    )}
                                                </div>
                                                {stats.revenueGrowth !== 0 && (
                                                    <div
                                                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                                                            stats.revenueGrowth >=
                                                            0
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {stats.revenueGrowth >=
                                                        0 ? (
                                                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                                        ) : (
                                                            <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                                                        )}
                                                        {Math.abs(
                                                            stats.revenueGrowth
                                                        ).toFixed(1)}
                                                        %
                                                    </div>
                                                )}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Average Order Value
                                            </dt>
                                            <dd className="text-2xl font-semibold text-gray-900">
                                                {formatPrice(
                                                    stats.avgOrderValue
                                                )}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ClockIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Pending Orders
                                            </dt>
                                            <dd className="text-2xl font-semibold text-gray-900">
                                                {statusBreakdown.pending +
                                                    statusBreakdown.accepted +
                                                    statusBreakdown.in_progress}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Chart and Status Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue by Day */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Revenue by Day
                                </h3>
                                <div className="space-y-2">
                                    {revenueByDay.map((day, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2 border-b border-gray-100"
                                        >
                                            <span className="text-sm text-gray-600">
                                                {formatDate(day.date)}
                                            </span>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPrice(day.revenue)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {day.orders} orders
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Status Breakdown */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Order Status
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(statusBreakdown).map(
                                        ([status, count]) => (
                                            <div
                                                key={status}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(status)}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {count}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Popular Items and Recent Orders */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Most Popular Items */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Most Popular Items
                                </h3>
                                <div className="space-y-3">
                                    {popularItems.map((item, index) => (
                                        <div
                                            key={item.menu_item_id}
                                            className="flex items-center justify-between py-2 border-b border-gray-100"
                                        >
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 mr-3">
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.menu_item?.name ||
                                                            "Unknown Item"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Sold:{" "}
                                                        {item.total_quantity}{" "}
                                                        pcs.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(
                                                    item.total_revenue
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {popularItems.length === 0 && (
                                        <p className="text-gray-500 text-sm">
                                            No sales data available for the
                                            selected period.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Recent Orders
                                </h3>
                                <div className="space-y-3">
                                    {recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between py-2 border-b border-gray-100"
                                        >
                                            <div className="flex items-center">
                                                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        #{order.id} -{" "}
                                                        {order.user?.name ||
                                                            "Guest"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(
                                                            order.created_at
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPrice(
                                                        order.total_amount
                                                    )}
                                                </div>
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        order.status
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <p className="text-gray-500 text-sm">
                                            No orders to display.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}

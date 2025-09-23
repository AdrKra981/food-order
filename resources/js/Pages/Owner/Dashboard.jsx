import OwnerLayout from "@/Layouts/OwnerLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    ChartBarIcon,
    ShoppingBagIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    HomeIcon,
    ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
    const { auth, stats } = usePage().props;
    console.log("stats", stats);

    // Use stats provided by the controller; apply safe defaults so view won't crash
    const statsData = {
        totalOrders: 0,
        totalRevenue: 0.0,
        totalCustomers: 0,
        pendingOrders: 0,
        ...stats,
    };

    return (
        <OwnerLayout
            header={
                <div className="flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-gray-400 mr-2" />
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Dashboard
                    </h2>
                </div>
            }
        >
            <Head title="Owner Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button className="py-2 px-1 border-b-2 border-orange-500 text-orange-600 font-medium text-sm">
                                <HomeIcon className="h-5 w-5 inline mr-2" />
                                Dashboard
                            </button>
                            <Link
                                href={route("owner.reports")}
                                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
                            >
                                <ChartBarIcon className="h-5 w-5 inline mr-2" />
                                Reports
                            </Link>
                            <Link
                                href={route("owner.orders")}
                                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
                            >
                                <ClipboardDocumentListIcon className="h-5 w-5 inline mr-2" />
                                Order List
                            </Link>
                        </nav>
                    </div>

                    {/* Welcome Section */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                Welcome back, {auth.user.name}!
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Here's what's happening with your restaurant
                                today.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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
                                            <dd className="text-lg font-medium text-gray-900">
                                                {statsData.totalOrders}
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
                                                Revenue
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                $
                                                {statsData.totalRevenue.toFixed(
                                                    2
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
                                        <UserGroupIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Customers
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {statsData.totalCustomers}
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
                                        <ShoppingBagIcon className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Pending Orders
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {statsData.pendingOrders}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Quick Actions
                                </h3>
                                <div className="space-y-3">
                                    <a
                                        href={route(
                                            "owner.menu-categories.create"
                                        )}
                                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <PlusIcon className="h-5 w-5 text-indigo-600 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">
                                            Add Menu Category
                                        </span>
                                    </a>
                                    <a
                                        href={route("owner.menu-items.create")}
                                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <PlusIcon className="h-5 w-5 text-indigo-600 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">
                                            Add Menu Item
                                        </span>
                                    </a>
                                    <a
                                        href={route("owner.restaurant.edit")}
                                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <PencilIcon className="h-5 w-5 text-indigo-600 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">
                                            Restaurant Settings
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Recent Activity
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <EyeIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                New order received
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                2 minutes ago
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <EyeIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Menu item updated
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                1 hour ago
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <EyeIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Customer review received
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                3 hours ago
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import useTrans from "@/Hooks/useTrans";
import {
    UserGroupIcon,
    BuildingStorefrontIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard({
    stats,
    recent_restaurants,
    restaurants_by_cuisine,
}) {
    const { auth } = usePage().props;

    const dashboardStats = [
        {
            name: "Total Users",
            value: stats.total_users.toLocaleString(),
            change: "Active users",
            changeType: "neutral",
            icon: UsersIcon,
            color: "bg-blue-500",
        },
        {
            name: "Active Restaurants",
            value: stats.active_restaurants.toString(),
            change: `${stats.pending_restaurants} pending`,
            changeType: stats.pending_restaurants > 0 ? "warning" : "positive",
            icon: BuildingStorefrontIcon,
            color: "bg-green-500",
        },
        {
            name: "Total Restaurants",
            value: stats.total_restaurants.toString(),
            change: `${stats.restaurant_owners} owners`,
            changeType: "neutral",
            icon: BuildingStorefrontIcon,
            color: "bg-purple-500",
        },
        {
            name: "Menu Items",
            value: stats.total_menu_items.toLocaleString(),
            change: "Available dishes",
            changeType: "positive",
            icon: DocumentTextIcon,
            color: "bg-orange-500",
        },
    ];

    const quickActions = [
        {
            name: "Manage Restaurants",
            description: "View and manage all restaurants",
            href: route("admin.restaurants"),
            icon: BuildingStorefrontIcon,
            color: "bg-blue-500",
        },
        {
            name: "Pending Approvals",
            description: `${stats.pending_restaurants} restaurants awaiting approval`,
            href: route("admin.restaurants.pending"),
            icon: ExclamationTriangleIcon,
            color: "bg-yellow-500",
        },
        {
            name: "User Management",
            description: "Manage platform users",
            href: "#",
            icon: UserGroupIcon,
            color: "bg-indigo-500",
        },
        {
            name: "System Reports",
            description: "View platform analytics",
            href: "#",
            icon: ChartBarIcon,
            color: "bg-pink-500",
        },
    ];

    const { t } = useTrans();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {t("admin_dashboard_title")}
                </h2>
            }
        >
            <Head title={t("admin_dashboard_title")} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {dashboardStats.map((stat) => (
                            <div
                                key={stat.name}
                                className="bg-white overflow-hidden shadow-sm rounded-lg"
                            >
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div
                                            className={`${stat.color} rounded-md p-3`}
                                        >
                                            <stat.icon
                                                className="h-6 w-6 text-white"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {stat.value}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {stat.name}
                                            </p>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    stat.changeType ===
                                                    "positive"
                                                        ? "text-green-600"
                                                        : stat.changeType ===
                                                          "warning"
                                                        ? "text-yellow-600"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {stat.change}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Quick Actions */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Quick Actions
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4">
                                    {quickActions.map((action) => (
                                        <Link
                                            key={action.name}
                                            href={action.href}
                                            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-150 ease-in-out"
                                        >
                                            <div
                                                className={`${action.color} rounded-md p-2`}
                                            >
                                                <action.icon
                                                    className="h-5 w-5 text-white"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {action.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Restaurants */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Recent Restaurants
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {recent_restaurants.map((restaurant) => (
                                        <div
                                            key={restaurant.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {restaurant.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {restaurant.cuisine_type} •{" "}
                                                    {restaurant.city}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Owner:{" "}
                                                    {restaurant.user.name}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    restaurant.is_accepted
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {restaurant.is_accepted
                                                    ? "Active"
                                                    : "Pending"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href={route("admin.restaurants")}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View all restaurants →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Restaurants by Cuisine Chart */}
                    <div className="mt-8 bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Restaurants by Cuisine Type
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {restaurants_by_cuisine.map((cuisine) => (
                                    <div
                                        key={cuisine.cuisine_type}
                                        className="text-center p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="text-2xl font-bold text-gray-900">
                                            {cuisine.count}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {cuisine.cuisine_type}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

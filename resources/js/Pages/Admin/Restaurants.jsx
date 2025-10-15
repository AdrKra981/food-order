import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import ConfirmModal from "@/Components/ConfirmModal";
import useTrans from "@/Hooks/useTrans";
import {
    BuildingStorefrontIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    TrashIcon,
    PowerIcon,
    EyeIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";

export default function AdminRestaurants({ restaurants, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("admin.restaurants"), {
            search: search,
            status: status,
        });
    };

    const { t } = useTrans();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    const toggleRestaurantStatus = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setConfirmAction("toggle");
        setConfirmOpen(true);
    };

    const deleteRestaurant = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setConfirmAction("delete");
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (!selectedRestaurant) return;

        if (confirmAction === "toggle") {
            router.post(
                route("admin.restaurants.toggle-status", selectedRestaurant.id)
            );
        } else if (confirmAction === "delete") {
            router.delete(
                route("admin.restaurants.delete", selectedRestaurant.id)
            );
        }

        setConfirmOpen(false);
        setSelectedRestaurant(null);
        setConfirmAction(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {t("restaurant_management")}
                    </h2>
                    <Link
                        href={route("admin.dashboard")}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        {t("back_to_dashboard")}
                    </Link>
                </div>
            }
        >
            <Head title={t("restaurant_management")} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
                        <div className="p-6">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-col md:flex-row gap-4"
                            >
                                <div className="flex-1">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder={t(
                                                "search_restaurants_placeholder"
                                            )}
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                <div className="min-w-0 md:w-48 relative">
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        className="appearance-none w-full pl-3 pr-10 py-2 border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-white cursor-pointer"
                                    >
                                        <option value="">
                                            {t("all_restaurants")}
                                        </option>
                                        <option value="active">
                                            {t("active_only")}
                                        </option>
                                        <option value="inactive">
                                            {t("inactive_only")}
                                        </option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2"
                                >
                                    <FunnelIcon className="h-4 w-4" />
                                    {t("filter")}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {t("restaurants")} ({restaurants.total}{" "}
                                    {t("total")})
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <BuildingStorefrontIcon className="h-4 w-4" />
                                    {
                                        restaurants.data.filter(
                                            (r) => r.is_accepted
                                        ).length
                                    }{" "}
                                    {t("active")},{" "}
                                    {
                                        restaurants.data.filter(
                                            (r) => !r.is_accepted
                                        ).length
                                    }{" "}
                                    {t("inactive")}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("restaurant")}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("owner")}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("cuisine")}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("location")}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("status")}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("actions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {restaurants.data.map((restaurant) => (
                                        <tr
                                            key={restaurant.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                            <BuildingStorefrontIcon className="h-5 w-5 text-orange-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {restaurant.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {t(
                                                                "delivery_label"
                                                            )}{" "}
                                                            {restaurant.delivery_fee ||
                                                                0}{" "}
                                                            zł •{" "}
                                                            {t("min_label")}{" "}
                                                            {restaurant.minimum_order ||
                                                                0}{" "}
                                                            zł
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {restaurant.user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {restaurant.user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    {restaurant.cuisine_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>{restaurant.city}</div>
                                                <div className="text-gray-500 text-xs">
                                                    {restaurant.address}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        restaurant.is_accepted
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {restaurant.is_accepted
                                                        ? t("active")
                                                        : t("inactive")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route(
                                                            "restaurant.show",
                                                            restaurant.id
                                                        )}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                        title={t(
                                                            "view_restaurant"
                                                        )}
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            toggleRestaurantStatus(
                                                                restaurant
                                                            )
                                                        }
                                                        className={`p-1 rounded ${
                                                            restaurant.is_accepted
                                                                ? "text-red-600 hover:text-red-900"
                                                                : "text-green-600 hover:text-green-900"
                                                        }`}
                                                        title={
                                                            restaurant.is_accepted
                                                                ? t(
                                                                      "deactivate"
                                                                  )
                                                                : t("activate")
                                                        }
                                                    >
                                                        <PowerIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteRestaurant(
                                                                restaurant
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900 p-1 rounded"
                                                        title={t("delete")}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={confirmOpen}
                title={
                    confirmAction === "delete"
                        ? selectedRestaurant
                            ? `${t("delete")} ${selectedRestaurant.name}`
                            : t("delete_restaurant")
                        : selectedRestaurant
                        ? `${
                              selectedRestaurant.is_accepted
                                  ? t("deactivate")
                                  : t("activate")
                          } ${selectedRestaurant.name}`
                        : t("confirm")
                }
                message={
                    confirmAction === "delete"
                        ? selectedRestaurant
                            ? t("delete_restaurant_message", {
                                  name: selectedRestaurant.name,
                              })
                            : ""
                        : selectedRestaurant
                        ? t(
                              selectedRestaurant.is_accepted
                                  ? "deactivate_restaurant_message"
                                  : "activate_restaurant_message",
                              { name: selectedRestaurant.name }
                          )
                        : ""
                }
                confirmText={
                    confirmAction === "delete"
                        ? t("delete")
                        : selectedRestaurant && selectedRestaurant.is_accepted
                        ? t("deactivate")
                        : t("activate")
                }
                cancelText={t("cancel")}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </AuthenticatedLayout>
    );
}

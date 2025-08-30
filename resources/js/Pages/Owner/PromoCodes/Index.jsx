import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    PlusIcon,
    TagIcon,
    CalendarIcon,
    CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export default function Index({ auth, promoCodes }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPromoCodes = promoCodes.data.filter(
        (promo) =>
            promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (promoCode) => {
        const now = new Date();
        const validFrom = new Date(promoCode.valid_from);
        const validUntil = new Date(promoCode.valid_until);

        if (!promoCode.is_active) {
            return (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    Inactive
                </span>
            );
        }

        if (now < validFrom) {
            return (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Scheduled
                </span>
            );
        }

        if (now > validUntil) {
            return (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Expired
                </span>
            );
        }

        if (
            promoCode.total_usage_limit &&
            promoCode.used_count >= promoCode.total_usage_limit
        ) {
            return (
                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                    Limit Reached
                </span>
            );
        }

        return (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Active
            </span>
        );
    };

    const getDiscountDisplay = (promoCode) => {
        if (promoCode.discount_type === "percentage") {
            return (
                <div className="flex items-center text-green-600">
                    <span className="text-lg font-bold mr-1">%</span>
                    {promoCode.discount_value}% off
                </div>
            );
        } else {
            return (
                <div className="flex items-center text-green-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />$
                    {promoCode.discount_value} off
                </div>
            );
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Promo Codes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Promo Codes
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Manage discount codes for your
                                        restaurant
                                    </p>
                                </div>
                                <a
                                    href={route("owner.promo-codes.create")}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Create Promo Code
                                </a>
                            </div>

                            {/* Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search promo codes..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Promo Codes Grid */}
                            {filteredPromoCodes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPromoCodes.map((promoCode) => (
                                        <div
                                            key={promoCode.id}
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="p-6">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center">
                                                        <TagIcon className="h-6 w-6 text-indigo-600 mr-2" />
                                                        <div>
                                                            <h3 className="font-bold text-lg text-gray-900">
                                                                {promoCode.code}
                                                            </h3>
                                                            <p className="text-gray-600 text-sm">
                                                                {promoCode.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(promoCode)}
                                                </div>

                                                {/* Discount Info */}
                                                <div className="mb-4">
                                                    {getDiscountDisplay(
                                                        promoCode
                                                    )}
                                                    {promoCode.minimum_order_amount >
                                                        0 && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Min. order: $
                                                            {
                                                                promoCode.minimum_order_amount
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Usage Stats */}
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>
                                                            Used:{" "}
                                                            {
                                                                promoCode.used_count
                                                            }
                                                        </span>
                                                        <span>
                                                            {promoCode.total_usage_limit
                                                                ? `Limit: ${promoCode.total_usage_limit}`
                                                                : "No limit"}
                                                        </span>
                                                    </div>
                                                    {promoCode.total_usage_limit && (
                                                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-indigo-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${Math.min(
                                                                        (promoCode.used_count /
                                                                            promoCode.total_usage_limit) *
                                                                            100,
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Dates */}
                                                <div className="mb-4 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                                        <span>
                                                            {new Date(
                                                                promoCode.valid_from
                                                            ).toLocaleDateString()}{" "}
                                                            -{" "}
                                                            {new Date(
                                                                promoCode.valid_until
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex space-x-2">
                                                    <a
                                                        href={route(
                                                            "owner.promo-codes.show",
                                                            promoCode.id
                                                        )}
                                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium text-center"
                                                    >
                                                        View
                                                    </a>
                                                    <a
                                                        href={route(
                                                            "owner.promo-codes.edit",
                                                            promoCode.id
                                                        )}
                                                        className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium text-center"
                                                    >
                                                        Edit
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No promo codes
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating your first promo
                                        code.
                                    </p>
                                    <div className="mt-6">
                                        <a
                                            href={route(
                                                "owner.promo-codes.create"
                                            )}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            <PlusIcon className="h-5 w-5 mr-2" />
                                            Create Promo Code
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {promoCodes.links && (
                                <div className="mt-6">
                                    {/* Add pagination component here */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

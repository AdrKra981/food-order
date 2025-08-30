import OwnerLayout from "@/Layouts/OwnerLayout";
import { Head, useForm } from "@inertiajs/react";
import {
    BuildingStorefrontIcon,
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    PhotoIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";

export default function RestaurantSettings({ restaurant, errors }) {
    const { data, setData, put, processing } = useForm({
        name: restaurant?.name || "",
        description: restaurant?.description || "",
        address: restaurant?.address || "",
        phone_number: restaurant?.phone_number || "",
        email: restaurant?.email || "",
        city: restaurant?.city || "",
        website: restaurant?.website || "",
        cuisine_type: restaurant?.cuisine_type || "",
        delivery_fee: restaurant?.delivery_fee || 0,
        minimum_order: restaurant?.minimum_order || 0,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("owner.restaurant.update"));
    };

    const cuisineTypes = [
        "Italian",
        "Chinese",
        "Indian",
        "Mexican",
        "Thai",
        "Japanese",
        "American",
        "Mediterranean",
        "French",
        "Greek",
        "Vietnamese",
        "Korean",
        "Lebanese",
        "Turkish",
        "Spanish",
        "Other",
    ];

    return (
        <OwnerLayout
            header={
                <div className="flex items-center">
                    <BuildingStorefrontIcon className="h-6 w-6 text-gray-400 mr-2" />
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Restaurant Settings
                    </h2>
                </div>
            }
        >
            <Head title="Restaurant Settings" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Restaurant Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Cuisine Type
                                        </label>
                                        <div className="relative mt-1">
                                            <select
                                                value={data.cuisine_type}
                                                onChange={(e) =>
                                                    setData(
                                                        "cuisine_type",
                                                        e.target.value
                                                    )
                                                }
                                                className="appearance-none block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer"
                                            >
                                                <option value="">
                                                    Select cuisine type
                                                </option>
                                                {cuisineTypes.map((type) => (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.cuisine_type && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.cuisine_type}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Tell customers about your restaurant..."
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone_number}
                                            onChange={(e) =>
                                                setData(
                                                    "phone_number",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        {errors.phone_number && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.phone_number}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) =>
                                                setData("city", e.target.value)
                                            }
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="City"
                                        />
                                        {errors.city && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={data.website}
                                            onChange={(e) =>
                                                setData(
                                                    "website",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="https://yourrestaurant.com"
                                        />
                                        {errors.website && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.website}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="flex items-center text-sm font-medium text-gray-700">
                                            <MapPinIcon className="h-4 w-4 mr-1" />
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    "address",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Full restaurant address"
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Settings */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    Delivery Settings
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Delivery Fee ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.delivery_fee}
                                            onChange={(e) =>
                                                setData(
                                                    "delivery_fee",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="0.00"
                                        />
                                        {errors.delivery_fee && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.delivery_fee}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Minimum Order ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.minimum_order}
                                            onChange={(e) =>
                                                setData(
                                                    "minimum_order",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="0.00"
                                        />
                                        {errors.minimum_order && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.minimum_order}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {processing
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </OwnerLayout>
    );
}

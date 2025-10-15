import { Head, Link } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import AddToCartButton from "@/Components/AddToCartButton";
import useTrans from "@/Hooks/useTrans";

export default function RestaurantShow({ restaurant }) {
    const { t } = useTrans();

    return (
        <>
            <Head title={restaurant.name} />
            <div className="min-h-screen bg-gray-50">
                {/* Shared Navbar */}
                <Navbar />

                {/* Compact back link + title (below navbar) */}
                <div className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                className="text-orange-600 hover:text-orange-700"
                            >
                                ← {t("back_to_dashboard")}
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {restaurant.name}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Restaurant Header */}
                <section className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Restaurant Image */}
                            <div className="lg:col-span-2">
                                <div className="h-64 lg:h-80 bg-gray-200 rounded-lg overflow-hidden">
                                    {restaurant.image ? (
                                        <img
                                            src={restaurant.image}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                            <svg
                                                className="w-16 h-16 text-gray-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Restaurant Info */}
                            <div>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        {t("restaurant_info")}
                                    </h2>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-20">
                                                {t("cuisine")}
                                            </span>
                                            <span className="text-gray-600">
                                                {restaurant.cuisine_type}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-20">
                                                {t("location")}
                                            </span>
                                            <span className="text-gray-600">
                                                {restaurant.city},{" "}
                                                {restaurant.address}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-20">
                                                {t("phone")}
                                            </span>
                                            <span className="text-gray-600">
                                                {restaurant.phone_number}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-20">
                                                {t("hours")}
                                            </span>
                                            <span className="text-gray-600">
                                                {restaurant.opening_hours &&
                                                restaurant.closing_hours
                                                    ? `${restaurant.opening_hours} - ${restaurant.closing_hours}`
                                                    : t("hours_not_available")}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-20">
                                                {t("delivery")}
                                            </span>
                                            <span className="text-gray-600">
                                                $
                                                {restaurant.delivery_fee ||
                                                    "Free"}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-20">
                                                {t("minimum")}
                                            </span>
                                            <span className="text-gray-600">
                                                ${restaurant.minimum_order || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {restaurant.description}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Menu Section */}
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-3xl font-bold text-gray-900 mb-8">
                            Menu
                        </h3>

                        {restaurant.menuCategories &&
                        restaurant.menuCategories.length > 0 ? (
                            <div className="space-y-12">
                                {restaurant.menuCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="bg-white rounded-lg shadow-sm p-6"
                                    >
                                        <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                                            {category.name}
                                        </h4>
                                        {category.description && (
                                            <p className="text-gray-600 mb-6">
                                                {category.description}
                                            </p>
                                        )}

                                        {category.menuItems &&
                                        category.menuItems.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {category.menuItems.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-300"
                                                        >
                                                            {/* Item Image */}
                                                            <div className="h-32 bg-gray-200 overflow-hidden">
                                                                {item.image ? (
                                                                    <img
                                                                        src={
                                                                            item.image
                                                                        }
                                                                        alt={
                                                                            item.name
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                                                        <svg
                                                                            className="w-8 h-8 text-gray-400"
                                                                            fill="currentColor"
                                                                            viewBox="0 0 20 20"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Item Info */}
                                                            <div className="p-4">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h5 className="font-semibold text-gray-900">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </h5>
                                                                    <span className="text-lg font-bold text-orange-600">
                                                                        {
                                                                            item.price
                                                                        }{" "}
                                                                        zł
                                                                    </span>
                                                                </div>
                                                                {item.description && (
                                                                    <p className="text-gray-600 text-sm mb-3">
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                <AddToCartButton
                                                                    menuItem={
                                                                        item
                                                                    }
                                                                    variant="primary"
                                                                    size="md"
                                                                    showQuantitySelector={
                                                                        false
                                                                    }
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500">
                                                    No items in this category
                                                    yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg
                                    className="mx-auto w-16 h-16 text-gray-400 mb-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                    Menu Coming Soon
                                </h4>
                                <p className="text-gray-600">
                                    This restaurant is still setting up their
                                    menu. Check back soon!
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

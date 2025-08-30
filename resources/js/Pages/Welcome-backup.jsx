import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import FoodieGoLogo from "@/Components/FoodieGoLogo";
import LocationIQAutocomplete from "@/Components/LocationIQAutocomplete";
import CartIcon from "@/Components/CartIcon";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function Welcome({
    auth,
    restaurants,
    searchAddress,
    locationiqApiKey,
}) {
    const [address, setAddress] = useState(searchAddress || "");
    const [coordinates, setCoordinates] = useState(null);
    const [selectedCuisine, setSelectedCuisine] = useState("all");

    // Get unique cuisine types from restaurants
    const cuisineTypes = restaurants
        ? [
              "all",
              ...new Set(
                  restaurants.map((restaurant) => restaurant.cuisine_type)
              ),
          ]
        : ["all"];

    // Filter restaurants based on selected cuisine
    const filteredRestaurants = restaurants
        ? restaurants.filter(
              (restaurant) =>
                  selectedCuisine === "all" ||
                  restaurant.cuisine_type === selectedCuisine
          )
        : [];

    const handleSearch = async () => {
        if (!address.trim()) return;

        const searchParams = new URLSearchParams({
            address: address,
        });

        // Add coordinates if available from Google Maps selection
        if (coordinates) {
            searchParams.append("lat", coordinates.lat);
            searchParams.append("lng", coordinates.lng);
        }

        window.location.href = `/?${searchParams}`;
    };

    const handlePlaceSelect = (placeData) => {
        setAddress(placeData.formatted_address);
        setCoordinates({
            lat: placeData.lat,
            lng: placeData.lng,
        });

        // Optionally auto-search when place is selected
        setTimeout(() => {
            const searchParams = new URLSearchParams({
                address: placeData.formatted_address,
                lat: placeData.lat,
                lng: placeData.lng,
            });
            window.location.href = `/?${searchParams}`;
        }, 100);
    };

    return (
        <>
            <Head title="Food Ordering Platform" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center">
                                <FoodieGoLogo className="h-12" />
                            </div>
                            <nav className="flex items-center space-x-4">
                                <CartIcon />
                                {auth.user ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md font-medium"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                        <div className="text-center">
                            <h2 className="text-4xl md:text-6xl font-bold mb-6">
                                Delicious Food
                                <br />
                                Delivered Fast
                            </h2>
                            <p className="text-xl md:text-2xl mb-8 text-orange-100">
                                Order from your favorite restaurants and get
                                fresh food delivered to your door
                            </p>
                            <div className="max-w-md mx-auto">
                                <div className="flex">
                                    <LocationIQAutocomplete
                                        value={address}
                                        onChange={setAddress}
                                        onPlaceSelect={handlePlaceSelect}
                                        placeholder="Enter your address"
                                        apiKey={locationiqApiKey}
                                        countryCode="pl"
                                        className="flex-1"
                                        types={["address"]}
                                        inputClassName="w-full pl-12 pr-4 py-3 text-gray-900 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="bg-orange-700 hover:bg-orange-800 px-6 py-3 rounded-r-lg font-medium transition duration-150 ease-in-out"
                                    >
                                        Find Food
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Restaurants Section */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                Featured Restaurants
                            </h3>
                            <p className="text-lg text-gray-600">
                                Discover amazing food from the best restaurants
                                in your area
                            </p>
                        </div>

                        {/* Cuisine Filter */}
                        {restaurants && restaurants.length > 0 && (
                            <div className="flex justify-center mb-8">
                                <div className="flex items-center space-x-3">
                                    <label
                                        htmlFor="cuisine-filter"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Filter by cuisine:
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="cuisine-filter"
                                            value={selectedCuisine}
                                            onChange={(e) =>
                                                setSelectedCuisine(
                                                    e.target.value
                                                )
                                            }
                                            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 cursor-pointer"
                                        >
                                            {cuisineTypes.map((cuisine) => (
                                                <option
                                                    key={cuisine}
                                                    value={cuisine}
                                                >
                                                    {cuisine === "all"
                                                        ? "All Cuisines"
                                                        : cuisine}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {filteredRestaurants &&
                        filteredRestaurants.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredRestaurants.map((restaurant) => (
                                    <div
                                        key={restaurant.id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 ease-in-out"
                                    >
                                        {/* Restaurant Image */}
                                        <div className="h-48 bg-gray-200 overflow-hidden">
                                            {restaurant.image ? (
                                                <img
                                                    src={restaurant.image}
                                                    alt={restaurant.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                                    <svg
                                                        className="w-12 h-12 text-gray-400"
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

                                        {/* Restaurant Info */}
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-xl font-semibold text-gray-900">
                                                    {restaurant.name}
                                                </h4>
                                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {restaurant.cuisine_type}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {restaurant.description}
                                            </p>

                                            <div className="space-y-2 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <svg
                                                        className="w-4 h-4 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    {restaurant.city},{" "}
                                                    {restaurant.address}
                                                </div>

                                                <div className="flex items-center">
                                                    <svg
                                                        className="w-4 h-4 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    {restaurant.opening_hours &&
                                                    restaurant.closing_hours
                                                        ? `${restaurant.opening_hours} - ${restaurant.closing_hours}`
                                                        : "Hours not available"}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <svg
                                                            className="w-4 h-4 mr-2"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                                                        </svg>
                                                        Delivery:{" "}
                                                        {Number(
                                                            restaurant.delivery_fee ||
                                                                0
                                                        ) > 0
                                                            ? `${Number(
                                                                  restaurant.delivery_fee
                                                              ).toFixed(2)} zł`
                                                            : "Free"}
                                                    </div>
                                                    <div className="text-xs">
                                                        Min:{" "}
                                                        {restaurant.minimum_order
                                                            ? `${Number(
                                                                  restaurant.minimum_order
                                                              ).toFixed(2)} zł`
                                                            : "0 zł"}
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-500 mt-2">
                                                    <svg
                                                        className="w-4 h-4 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Delivery range:{" "}
                                                    {
                                                        restaurant.delivery_range_km
                                                    }{" "}
                                                    km
                                                </div>
                                            </div>

                                            <Link
                                                href={route(
                                                    "restaurant.show",
                                                    restaurant.id
                                                )}
                                                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out inline-block text-center"
                                            >
                                                View Menu
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : restaurants && restaurants.length > 0 ? (
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
                                    No Restaurants Found
                                </h4>
                                <p className="text-gray-600">
                                    No restaurants match your selected cuisine
                                    filter. Try selecting a different cuisine
                                    type.
                                </p>
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
                                    No Restaurants Available
                                </h4>
                                <p className="text-gray-600">
                                    We're working hard to bring amazing
                                    restaurants to your area. Check back soon!
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-800 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <FoodieGoLogo
                                    showText={true}
                                    className="h-8 mb-4"
                                />
                                <p className="text-gray-400">
                                    Your favorite food delivered fast and fresh
                                    to your door.
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                            <p>© 2025 FoodieGo. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

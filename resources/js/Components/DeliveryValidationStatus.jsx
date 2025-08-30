import React from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const DeliveryValidationStatus = ({ validationResult, isValidating }) => {
    if (isValidating) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                    <p className="text-yellow-800 font-medium">
                        Checking delivery availability...
                    </p>
                </div>
            </div>
        );
    }

    if (!validationResult) {
        return null;
    }

    const { all_deliverable, restaurants } = validationResult;

    if (all_deliverable) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-green-800 font-medium">
                        Delivery Available!
                    </h3>
                </div>
                <div className="space-y-2">
                    {restaurants.map((restaurant, index) => (
                        <div key={index} className="text-sm text-green-700">
                            <span className="font-medium">
                                {restaurant.restaurant_name}
                            </span>{" "}
                            - {restaurant.distance_km} km away
                        </div>
                    ))}
                </div>
            </div>
        );
    } else {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="text-red-800 font-medium">
                        Delivery Not Available
                    </h3>
                </div>
                <div className="space-y-3">
                    {restaurants.map((restaurant, index) => (
                        <div
                            key={index}
                            className={`text-sm p-3 rounded-md ${
                                restaurant.delivery_possible
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">
                                    {restaurant.restaurant_name}
                                </span>
                                {restaurant.delivery_possible ? (
                                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                ) : (
                                    <XCircleIcon className="h-4 w-4 text-red-600" />
                                )}
                            </div>
                            <div className="mt-1">
                                Distance: {restaurant.distance_km} km
                                {!restaurant.delivery_possible && (
                                    <span className="text-red-600">
                                        {" "}
                                        (Max: {
                                            restaurant.max_delivery_range_km
                                        }{" "}
                                        km)
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-3 p-3 bg-yellow-100 rounded-md">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                            Some restaurants cannot deliver to this address. You
                            may need to choose pickup or remove items from
                            restaurants outside their delivery range.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
};

export default DeliveryValidationStatus;

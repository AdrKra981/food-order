import React from "react";
import { router } from "@inertiajs/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Navbar from "@/Components/Navbar";

export default function OrderSuccess({ orderNumbers = "" }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Order Placed Successfully!
                    </h1>

                    <p className="text-lg text-gray-600 mb-6">
                        Thank you for your order. We've received your request
                        and will start preparing your food shortly.
                    </p>

                    {orderNumbers && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-500 mb-2">
                                Order Numbers:
                            </p>
                            <p className="font-mono text-lg font-semibold text-gray-900">
                                {orderNumbers}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">
                                What's Next?
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>
                                    • You'll receive a confirmation email
                                    shortly
                                </li>
                                <li>
                                    • The restaurant will start preparing your
                                    order
                                </li>
                                <li>
                                    • You'll be notified when your order is
                                    ready
                                </li>
                            </ul>
                        </div>

                        <div className="flex space-x-4 justify-center">
                            <button
                                onClick={() => router.visit("/")}
                                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                            >
                                Continue Shopping
                            </button>

                            <button
                                onClick={() => router.visit("/orders")}
                                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                View Orders
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

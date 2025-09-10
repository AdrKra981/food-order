import { useState } from "react";
import { TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function PromoCodeInput({
    restaurantId,
    onPromoCodeApplied,
    appliedPromoCode,
    onPromoCodeRemoved,
}) {
    const [code, setCode] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState("");

    const validatePromoCode = async () => {
        if (!code.trim()) {
            setError("Please enter a promo code");
            return;
        }

        setIsValidating(true);
        setError("");

        try {
            const response = await fetch(route("api.promo-codes.validate"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: JSON.stringify({
                    code: code.trim(),
                    restaurant_id: restaurantId,
                }),
            });

            const data = await response.json();

            if (data.valid) {
                onPromoCodeApplied(data);
                setCode("");
                setError("");
            } else {
                setError(data.message || "Invalid promo code");
            }
        } catch (error) {
            setError(
                `Failed to validate promo code. Please try again. ${error.message}`
            );
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        validatePromoCode();
    };

    const removePromoCode = () => {
        onPromoCodeRemoved();
        setCode("");
        setError("");
    };

    if (appliedPromoCode) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                            <p className="font-medium text-green-900">
                                Promo code applied:{" "}
                                {appliedPromoCode.promo_code.code}
                            </p>
                            <p className="text-sm text-green-700">
                                {appliedPromoCode.promo_code.name} - Save $
                                {appliedPromoCode.discount.amount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={removePromoCode}
                        className="text-green-600 hover:text-green-800"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
                <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium text-gray-900">Promo Code</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isValidating}
                    />
                    <button
                        type="submit"
                        disabled={isValidating || !code.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isValidating ? "Checking..." : "Apply"}
                    </button>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
        </div>
    );
}

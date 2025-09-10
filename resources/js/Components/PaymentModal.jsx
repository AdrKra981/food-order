import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import {
    XMarkIcon,
    CreditCardIcon,
    DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { router } from "@inertiajs/react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({
    formData,
    onSuccess,
    onError,
    onCancel,
    isProcessing,
    setIsProcessing,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState("");
    const [amount, setAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState(
        formData.payment_method || "online"
    );
    const [blikCode, setBlikCode] = useState("");

    useEffect(() => {
        // Create PaymentIntent when component mounts or payment method changes
        const createPaymentIntent = async () => {
            try {
                const response = await fetch("/payment/create-intent", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                    body: JSON.stringify({
                        ...formData,
                        payment_method: paymentMethod,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setClientSecret(data.client_secret);
                    setAmount(data.amount);
                } else {
                    onError(data.error || "Failed to initialize payment");
                }
            } catch (error) {
                onError(`Payment initialization failed! ${error.message}`);
            }
        };

        createPaymentIntent();
    }, [formData, paymentMethod]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !clientSecret) {
            return;
        }

        setIsProcessing(true);

        let result;

        if (paymentMethod === "blik") {
            // For BLIK, we need to confirm the payment with the BLIK code
            result = await stripe.confirmBlikPayment(clientSecret, {
                payment_method: {
                    blik: {
                        code: blikCode,
                    },
                    billing_details: {
                        name: `${formData.first_name} ${formData.last_name}`,
                        email: formData.email,
                        phone: formData.phone,
                    },
                },
            });
        } else {
            // For card payments
            if (!elements) {
                setIsProcessing(false);
                return;
            }

            const card = elements.getElement(CardElement);

            result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: card,
                    billing_details: {
                        name: `${formData.first_name} ${formData.last_name}`,
                        email: formData.email,
                        phone: formData.phone,
                    },
                },
            });
        }

        const { error, paymentIntent } = result;

        if (error) {
            setIsProcessing(false);
            onError(error.message);
        } else if (paymentIntent.status === "succeeded") {
            // Confirm payment on backend and create orders
            try {
                const response = await fetch("/payment/confirm", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                    body: JSON.stringify({
                        payment_intent_id: paymentIntent.id,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    onSuccess(data);
                    router.visit(data.redirect_url);
                } else {
                    onError(data.error || "Payment confirmation failed");
                }
            } catch (error) {
                onError(`Order creation failed! ${error.message}`);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
        }).format(price);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Complete Payment
                </h3>
                <p className="text-gray-600">
                    Total:{" "}
                    <span className="font-semibold text-orange-600">
                        {formatPrice(amount)}
                    </span>
                </p>
            </div>

            <div className="space-y-4">
                {/* Payment Method Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Method
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="payment_method"
                                value="online"
                                checked={paymentMethod === "online"}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                                className="mr-3 text-orange-600 focus:ring-orange-500"
                            />
                            <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
                            <span className="font-medium">
                                Credit/Debit Card
                            </span>
                        </label>

                        <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="payment_method"
                                value="blik"
                                checked={paymentMethod === "blik"}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                                className="mr-3 text-orange-600 focus:ring-orange-500"
                            />
                            <DevicePhoneMobileIcon className="h-5 w-5 mr-2 text-gray-600" />
                            <span className="font-medium">📱 BLIK</span>
                        </label>
                    </div>
                </div>

                {/* Card Information - Show only for card payments */}
                {paymentMethod === "online" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Information
                        </label>
                        <div className="border border-gray-300 rounded-md p-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: "16px",
                                            color: "#424770",
                                            "::placeholder": {
                                                color: "#aab7c4",
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* BLIK Code Input - Show only for BLIK payments */}
                {paymentMethod === "blik" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            BLIK Code
                        </label>
                        <input
                            type="text"
                            value={blikCode}
                            onChange={(e) =>
                                setBlikCode(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6)
                                )
                            }
                            placeholder="Enter 6-digit BLIK code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-center text-lg font-mono"
                            maxLength="6"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Open your banking app and generate a BLIK code
                        </p>
                    </div>
                )}

                <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                        Order Summary
                    </h4>
                    <div className="text-sm text-gray-600">
                        <p>
                            <strong>Name:</strong> {formData.first_name}{" "}
                            {formData.last_name}
                        </p>
                        <p>
                            <strong>Email:</strong> {formData.email}
                        </p>
                        <p>
                            <strong>Delivery:</strong>{" "}
                            {formData.delivery_type === "delivery"
                                ? "Delivery"
                                : "Pickup"}
                        </p>
                        {formData.delivery_type === "delivery" && (
                            <p>
                                <strong>Address:</strong> {formData.street},{" "}
                                {formData.city}, {formData.postal_code}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={
                        !stripe ||
                        isProcessing ||
                        (paymentMethod === "online" && !elements) ||
                        (paymentMethod === "blik" && blikCode.length !== 6)
                    }
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            {paymentMethod === "blik" ? (
                                <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
                            ) : (
                                <CreditCardIcon className="h-5 w-5 mr-2" />
                            )}
                            Pay {formatPrice(amount)}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default function PaymentModal({ isOpen, onClose, formData }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSuccess = (data) => {
        console.log("Payment successful:", data);
        onClose();
    };

    const handleError = (errorMessage) => {
        setError(errorMessage);
        setIsProcessing(false);
    };

    const handleCancel = () => {
        if (!isProcessing) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={handleCancel}
                ></div>

                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Secure Payment
                        </h2>
                        <button
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <Elements stripe={stripePromise}>
                        <CheckoutForm
                            formData={formData}
                            onSuccess={handleSuccess}
                            onError={handleError}
                            onCancel={handleCancel}
                            isProcessing={isProcessing}
                            setIsProcessing={setIsProcessing}
                        />
                    </Elements>
                </div>
            </div>
        </div>
    );
}

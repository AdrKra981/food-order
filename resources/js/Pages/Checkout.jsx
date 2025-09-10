import React, { useState, useEffect } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import axios from "axios";
import {
    CreditCardIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    UserIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/Contexts/CartContext";
import Navbar from "@/Components/Navbar";
import PaymentModal from "@/Components/PaymentModal";
import DeliveryValidationStatus from "@/Components/DeliveryValidationStatus";
import LocationIQAutocomplete from "@/Components/LocationIQAutocomplete";
import PromoCodeInput from "@/Components/PromoCodeInput";

const Checkout = ({ stripePublicKey }) => {
    const { cartByRestaurant, grandTotal, totalItems, loading, clearCart } =
        useCart();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Delivery validation state
    const [deliveryValidation, setDeliveryValidation] = useState(null);
    const [isValidatingDelivery, setIsValidatingDelivery] = useState(false);
    const [addressCoordinates, setAddressCoordinates] = useState(null);
    const [addressInputValue, setAddressInputValue] = useState("");

    // Promo code state
    const [appliedPromoCode, setAppliedPromoCode] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);

    // Make Stripe public key available globally for PaymentModal
    useEffect(() => {
        if (stripePublicKey) {
            window.STRIPE_PUBLIC_KEY = stripePublicKey;
        }
    }, [stripePublicKey]);

    // Update final total when grand total or discount changes
    useEffect(() => {
        setFinalTotal(grandTotal - discountAmount);
    }, [grandTotal, discountAmount]);

    // Promo code handlers
    const handlePromoCodeApplied = (promoData) => {
        setAppliedPromoCode(promoData);
        setDiscountAmount(promoData.discount.amount);
        setData({
            ...data,
            promo_code_id: promoData.promo_code.id,
            promo_code: promoData.promo_code.code,
            discount_amount: promoData.discount.amount,
        });
    };

    const handlePromoCodeRemoved = () => {
        setAppliedPromoCode(null);
        setDiscountAmount(0);
        setData({
            ...data,
            promo_code_id: null,
            promo_code: "",
            discount_amount: 0,
        });
    };

    const { data, setData, post, processing, errors } = useForm({
        // Customer Information
        first_name: "",
        last_name: "",
        email: "",
        phone: "",

        // Delivery Address
        street: "",
        city: "",
        postal_code: "",

        // Order Options
        delivery_type: "delivery", // delivery or pickup
        payment_method: "cash", // cash, card, online
        notes: "",

        // Promo code information
        promo_code_id: null,
        promo_code: "",
        discount_amount: 0,
    });

    // Redirect if cart is empty
    useEffect(() => {
        if (!loading && cartByRestaurant.length === 0) {
            router.visit("/");
        }
    }, [cartByRestaurant, loading]);

    // Validate delivery address
    const validateDeliveryAddress = async (coordinates) => {
        if (!coordinates || data.delivery_type !== "delivery") {
            setDeliveryValidation(null);
            return;
        }

        setIsValidatingDelivery(true);
        try {
            const response = await axios.post("/api/cart/validate-delivery", {
                lat: coordinates.lat,
                lng: coordinates.lng,
            });

            setDeliveryValidation(response.data.data);
        } catch (error) {
            console.error("Delivery validation error:", error);
            setDeliveryValidation(null);
        } finally {
            setIsValidatingDelivery(false);
        }
    };

    // Handle address selection from LocationIQ
    const handleAddressSelect = (location) => {
        console.log("Selected location:", location); // Debug log

        const coordinates = {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lng),
        };

        // Extract address components
        const streetName = location.address_components?.street || "";
        const houseNumber = location.address_components?.house_number || "";
        const city = location.address_components?.city || "";
        const postalCode = location.address_components?.postcode || "";

        // Validate that we have all required components for a complete address
        if (!streetName || !houseNumber || !city || !postalCode) {
            alert(
                "Please select a complete address with street number, street name, city, and postal code. The selected location is not specific enough for delivery."
            );
            return;
        }

        setAddressCoordinates(coordinates);
        setAddressInputValue(
            location.formatted_address || location.display_name
        );

        setData({
            ...data,
            street: `${houseNumber} ${streetName}`,
            city: city,
            postal_code: postalCode,
        });

        // Validate delivery if it's a delivery order
        if (data.delivery_type === "delivery") {
            validateDeliveryAddress(coordinates);
        }
    };

    // Re-validate when delivery type changes
    useEffect(() => {
        if (addressCoordinates && data.delivery_type === "delivery") {
            validateDeliveryAddress(addressCoordinates);
        } else if (data.delivery_type !== "delivery") {
            setDeliveryValidation(null);
        }
    }, [data.delivery_type]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate complete address for delivery orders
        if (data.delivery_type === "delivery") {
            if (!data.street || !data.city || !data.postal_code) {
                alert(
                    "Please select a complete delivery address with street, city, and postal code."
                );
                return;
            }

            // Check if the address contains a house number
            const hasHouseNumber = /\d/.test(data.street);
            if (!hasHouseNumber) {
                alert(
                    "Please select an address that includes a house number for precise delivery."
                );
                return;
            }

            // Check delivery validation
            if (deliveryValidation && !deliveryValidation.all_deliverable) {
                alert(
                    "Some restaurants cannot deliver to this address. Please choose pickup or change your address."
                );
                return;
            }
        }

        // Check if online payment methods are selected
        if (
            data.payment_method === "online" ||
            data.payment_method === "blik"
        ) {
            setShowPaymentModal(true);
            return;
        }

        // Handle cash/card on delivery/pickup payments
        post("/checkout", {
            onSuccess: () => {
                clearCart();
                router.visit("/orders/success");
            },
            onError: (errors) => {
                console.error("Order submission errors:", errors);
            },
        });
    };

    const formatPrice = (price) => {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return "PLN 0.00";
        return new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
        }).format(numPrice);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Checkout - FoodieGo" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Checkout
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Complete your order ({totalItems}{" "}
                        {totalItems === 1 ? "item" : "items"})
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Form */}
                    <div className="space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <UserIcon className="h-5 w-5 mr-2" />
                                    Customer Information
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={data.first_name}
                                            onChange={(e) =>
                                                setData(
                                                    "first_name",
                                                    e.target.value
                                                )
                                            }
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                                                errors.first_name
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.first_name && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.first_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={data.last_name}
                                            onChange={(e) =>
                                                setData(
                                                    "last_name",
                                                    e.target.value
                                                )
                                            }
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                                                errors.last_name
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.last_name && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.last_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <div className="relative">
                                            <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                                                    errors.email
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <div className="relative">
                                            <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        "phone",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                                                    errors.phone
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Options */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <MapPinIcon className="h-5 w-5 mr-2" />
                                    Delivery Options
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="delivery_type"
                                                value="delivery"
                                                checked={
                                                    data.delivery_type ===
                                                    "delivery"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "delivery_type",
                                                        e.target.value
                                                    )
                                                }
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700">
                                                Delivery
                                            </span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="delivery_type"
                                                value="pickup"
                                                checked={
                                                    data.delivery_type ===
                                                    "pickup"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "delivery_type",
                                                        e.target.value
                                                    )
                                                }
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700">
                                                Pickup
                                            </span>
                                        </label>
                                    </div>

                                    {data.delivery_type === "delivery" && (
                                        <div className="space-y-4 pt-4 border-t border-gray-200">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Search Address *
                                                </label>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    Please enter a complete
                                                    address including street
                                                    name and house number (e.g.,
                                                    "Krakowska 123, Warszawa")
                                                </p>
                                                <LocationIQAutocomplete
                                                    value={addressInputValue}
                                                    onChange={
                                                        setAddressInputValue
                                                    }
                                                    onPlaceSelect={
                                                        handleAddressSelect
                                                    }
                                                    apiKey={
                                                        import.meta.env
                                                            .VITE_LOCATIONIQ_API_KEY ||
                                                        "pk.cc96ff13e8f6c931477a51d095337349"
                                                    }
                                                    placeholder="Type complete delivery address with house number..."
                                                    className="w-full"
                                                />
                                            </div>

                                            {/* Show selected address details */}
                                            {(data.street || data.city) && (
                                                <div className="bg-gray-50 p-3 rounded-md">
                                                    <p className="text-sm text-gray-700">
                                                        <strong>
                                                            Selected Address:
                                                        </strong>
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {data.street &&
                                                            `${data.street}, `}
                                                        {data.city &&
                                                            `${data.city} `}
                                                        {data.postal_code}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Delivery Validation Status */}
                                            <DeliveryValidationStatus
                                                validationResult={
                                                    deliveryValidation
                                                }
                                                isValidating={
                                                    isValidatingDelivery
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <CreditCardIcon className="h-5 w-5 mr-2" />
                                    Payment Method
                                </h2>

                                <div className="space-y-3">
                                    <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cash"
                                            checked={
                                                data.payment_method === "cash"
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "payment_method",
                                                    e.target.value
                                                )
                                            }
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">
                                            Cash on{" "}
                                            {data.delivery_type === "delivery"
                                                ? "Delivery"
                                                : "Pickup"}
                                        </span>
                                    </label>

                                    <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="card"
                                            checked={
                                                data.payment_method === "card"
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "payment_method",
                                                    e.target.value
                                                )
                                            }
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">
                                            Card on{" "}
                                            {data.delivery_type === "delivery"
                                                ? "Delivery"
                                                : "Pickup"}
                                        </span>
                                    </label>

                                    <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="online"
                                            checked={
                                                data.payment_method === "online"
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "payment_method",
                                                    e.target.value
                                                )
                                            }
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">
                                            Online Payment (Credit/Debit Card)
                                        </span>
                                    </label>

                                    <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="blik"
                                            checked={
                                                data.payment_method === "blik"
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "payment_method",
                                                    e.target.value
                                                )
                                            }
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">
                                            BLIK Payment
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Order Notes */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Order Notes (Optional)
                                </h2>
                                <textarea
                                    name="notes"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData("notes", e.target.value)
                                    }
                                    rows="3"
                                    placeholder="Any special instructions for your order..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        {/* Promo Code Section */}
                        {cartByRestaurant.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <PromoCodeInput
                                    restaurantId={
                                        cartByRestaurant[0].restaurant.id
                                    }
                                    onPromoCodeApplied={handlePromoCodeApplied}
                                    appliedPromoCode={appliedPromoCode}
                                    onPromoCodeRemoved={handlePromoCodeRemoved}
                                />
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-4">
                                {cartByRestaurant.map((restaurantCart) => (
                                    <div
                                        key={restaurantCart.restaurant.id}
                                        className="border-b border-gray-200 pb-4"
                                    >
                                        <h3 className="font-medium text-gray-900 mb-2">
                                            {restaurantCart.restaurant.name}
                                        </h3>

                                        <div className="space-y-2">
                                            {restaurantCart.items.map(
                                                (item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between text-sm"
                                                    >
                                                        <div className="flex-1">
                                                            <span className="text-gray-900">
                                                                {item.quantity}x{" "}
                                                                {
                                                                    item
                                                                        .menu_item
                                                                        .name
                                                                }
                                                            </span>
                                                            {item.notes && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Note:{" "}
                                                                    {item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className="text-gray-600 ml-2">
                                                            {formatPrice(
                                                                item.price *
                                                                    item.quantity
                                                            )}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <div className="flex justify-between text-sm font-medium text-gray-900 mt-2 pt-2 border-t border-gray-100">
                                            <span>Restaurant Total:</span>
                                            <span>
                                                {formatPrice(
                                                    restaurantCart.total
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-4">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(grandTotal)}</span>
                                </div>

                                {appliedPromoCode && discountAmount > 0 && (
                                    <div className="flex justify-between text-md text-green-600 border-t border-gray-200 pt-2">
                                        <span>
                                            Discount (
                                            {appliedPromoCode.promo_code.code}):
                                        </span>
                                        <span>
                                            -{formatPrice(discountAmount)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                                    <span>Total:</span>
                                    <span className="text-orange-600">
                                        {formatPrice(finalTotal)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={
                                    processing || cartByRestaurant.length === 0
                                }
                                className="w-full mt-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        Place Order
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-3">
                                By placing this order, you agree to our terms
                                and conditions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                formData={data}
            />
        </div>
    );
};

export default Checkout;

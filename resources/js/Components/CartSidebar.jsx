import React from "react";
import {
    XMarkIcon,
    MinusIcon,
    PlusIcon,
    TrashIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/Contexts/CartContext";
import { router } from "@inertiajs/react";

const CartSidebar = ({ isOpen, onClose }) => {
    const {
        cartByRestaurant,
        grandTotal,
        totalItems,
        loading,
        updateCartItem,
        removeFromCart,
        clearCart,
    } = useCart();

    const handleQuantityChange = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            await removeFromCart(cartItemId);
        } else {
            await updateCartItem(cartItemId, newQuantity);
        }
    };

    const handleCheckout = () => {
        router.visit("/checkout");
        onClose();
    };

    const formatPrice = (price) => {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) {
            console.error("Invalid price value:", price);
            return "PLN 0.00";
        }
        return new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
        }).format(numPrice);
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Your Cart ({totalItems}{" "}
                        {totalItems === 1 ? "item" : "items"})
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    )}

                    {!loading && cartByRestaurant.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <ShoppingCartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">
                                Your cart is empty
                            </p>
                            <p className="text-sm">
                                Add some delicious items to get started!
                            </p>
                        </div>
                    )}

                    {!loading &&
                        cartByRestaurant.map((restaurantCart) => (
                            <div
                                key={restaurantCart.restaurant.id}
                                className="mb-6 border border-gray-200 rounded-lg"
                            >
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {restaurantCart.restaurant.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {restaurantCart.item_count}{" "}
                                            {restaurantCart.item_count === 1
                                                ? "item"
                                                : "items"}{" "}
                                            •{" "}
                                            {formatPrice(restaurantCart.total)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            clearCart(
                                                restaurantCart.restaurant.id
                                            )
                                        }
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {restaurantCart.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-4 min-h-[120px] flex items-center"
                                        >
                                            <div className="flex items-start space-x-3 w-full">
                                                <div className="flex-shrink-0">
                                                    {item.menu_item.media &&
                                                    item.menu_item.media
                                                        .length > 0 ? (
                                                        <img
                                                            src={`/storage/menu-items/${item.menu_item_id}/${item.menu_item.media[0].filename}`}
                                                            alt={
                                                                item.menu_item
                                                                    .name
                                                            }
                                                            className="h-16 w-16 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">
                                                                No image
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {item.menu_item.name}
                                                    </h4>
                                                    {item.menu_item
                                                        .description && (
                                                        <p
                                                            className="text-xs text-gray-600 mt-1 line-clamp-3 overflow-hidden"
                                                            style={{
                                                                display:
                                                                    "-webkit-box",
                                                                WebkitLineClamp: 3,
                                                                WebkitBoxOrient:
                                                                    "vertical",
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "ellipsis",
                                                            }}
                                                        >
                                                            {
                                                                item.menu_item
                                                                    .description
                                                            }
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {formatPrice(
                                                            item.price
                                                        )}
                                                    </p>
                                                    {item.notes && (
                                                        <p className="text-xs text-gray-400 mt-1 truncate">
                                                            Note: {item.notes}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center mt-2 space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.id,
                                                                    item.quantity -
                                                                        1
                                                                )
                                                            }
                                                            className="p-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                                                        >
                                                            <MinusIcon className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-sm font-medium px-2">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.id,
                                                                    item.quantity +
                                                                        1
                                                                )
                                                            }
                                                            className="p-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                                                        >
                                                            <PlusIcon className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    item.id
                                                                )
                                                            }
                                                            className="p-1 text-red-500 hover:text-red-700 ml-2"
                                                        >
                                                            <TrashIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPrice(
                                                        item.price *
                                                            item.quantity
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>

                {cartByRestaurant.length > 0 && (
                    <div className="border-t border-gray-200 p-4 space-y-4">
                        <div className="flex items-center justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span className="text-orange-600">
                                {formatPrice(grandTotal)}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
                            >
                                Proceed to Checkout
                            </button>
                            <button
                                onClick={() => clearCart()}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Clear All Items
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;

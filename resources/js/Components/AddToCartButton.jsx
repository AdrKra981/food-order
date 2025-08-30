import React, { useState } from "react";
import {
    PlusIcon,
    ShoppingCartIcon,
    MinusIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/Contexts/CartContext";

const AddToCartButton = ({
    menuItem,
    variant = "primary",
    size = "md",
    showQuantitySelector = false,
    className = "",
}) => {
    const { addToCart, loading } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            const result = await addToCart(menuItem.id, quantity, notes);
            if (result.success) {
                setQuantity(1);
                setNotes("");
                setShowNotes(false);
            } else {
                console.error("Failed to add to cart:", result.message);
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
        } finally {
            setIsAdding(false);
        }
    };

    // Style variants
    const variants = {
        primary: "bg-orange-600 hover:bg-orange-700 text-white",
        secondary:
            "bg-white hover:bg-gray-50 text-orange-600 border border-orange-600",
        icon: "bg-orange-600 hover:bg-orange-700 text-white rounded-full p-2",
    };

    // Size variants
    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    const baseClasses = `
        font-medium rounded-md transition-colors duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-2
    `;

    const buttonClasses = `
        ${baseClasses}
        ${variants[variant]}
        ${variant !== "icon" ? sizes[size] : ""}
        ${className}
    `;

    if (variant === "icon") {
        return (
            <button
                onClick={handleAddToCart}
                disabled={isAdding || loading}
                className={buttonClasses}
                title="Add to cart"
            >
                {isAdding ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                    <PlusIcon className="h-4 w-4" />
                )}
            </button>
        );
    }

    return (
        <div className="space-y-3">
            {showQuantitySelector && (
                <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">
                        Quantity:
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                            type="button"
                            onClick={() =>
                                setQuantity(Math.max(1, quantity - 1))
                            }
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setQuantity(Math.min(10, quantity + 1))
                            }
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <PlusIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {showNotes && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requests..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        rows="2"
                        maxLength="500"
                    />
                </div>
            )}

            {!showNotes && (
                <button
                    type="button"
                    onClick={() => setShowNotes(true)}
                    className="text-sm text-orange-600 hover:text-orange-700 underline"
                >
                    Add special instructions
                </button>
            )}

            <button
                onClick={handleAddToCart}
                disabled={isAdding || loading}
                className={buttonClasses}
            >
                {isAdding ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Adding...</span>
                    </>
                ) : (
                    <>
                        <ShoppingCartIcon className="h-4 w-4" />
                        <span>Add to Cart</span>
                        {showQuantitySelector && quantity > 1 && (
                            <span className="bg-white bg-opacity-20 rounded-full px-2 py-0.5 text-xs">
                                {quantity}
                            </span>
                        )}
                    </>
                )}
            </button>
        </div>
    );
};

export default AddToCartButton;

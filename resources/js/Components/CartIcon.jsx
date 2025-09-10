import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/Contexts/CartContext";
import CartSidebar from "./CartSidebar";

const CartIcon = ({ className = "" }) => {
    const { totalItems } = useCart();
    const [showCart, setShowCart] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowCart(true)}
                className={`relative p-2 text-gray-700 hover:text-orange-600 transition-colors duration-200 ${className}`}
                aria-label="Shopping cart"
            >
                <ShoppingCartIcon className="h-6 w-6" />

                {/* Cart Count Badge */}
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse">
                        {totalItems > 99 ? "99+" : totalItems}
                    </span>
                )}
            </button>

            {/* Cart Sidebar */}
            <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
        </>
    );
};

export default CartIcon;

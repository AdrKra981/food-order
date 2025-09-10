import { createContext, useContext, useReducer, useEffect } from "react";

// Use the configured axios from window to ensure CSRF token is included
const axios = window.axios;

// Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
    SET_CART: "SET_CART",
    SET_LOADING: "SET_LOADING",
    SET_ERROR: "SET_ERROR",
    UPDATE_COUNT: "UPDATE_COUNT",
};

// Cart Reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case CART_ACTIONS.SET_CART:
            return {
                ...state,
                cartByRestaurant: action.payload.cart_by_restaurant || [],
                grandTotal: action.payload.grand_total || 0,
                totalItems: action.payload.total_items || 0,
                loading: false,
                error: null,
            };
        case CART_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            };
        case CART_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case CART_ACTIONS.UPDATE_COUNT:
            return {
                ...state,
                totalItems: action.payload,
            };
        default:
            return state;
    }
};

// Initial State
const initialState = {
    cartByRestaurant: [],
    grandTotal: 0,
    totalItems: 0,
    loading: false,
    error: null,
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Fetch cart data
    const fetchCart = async () => {
        try {
            dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
            const response = await axios.get("/api/cart");
            dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data });
        } catch (error) {
            dispatch({
                type: CART_ACTIONS.SET_ERROR,
                payload: "Failed to fetch cart",
            });
            console.error("Cart fetch error:", error);
        }
    };

    // Add item to cart
    const addToCart = async (menuItemId, quantity = 1, notes = "") => {
        try {
            dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
            const response = await axios.post("/api/cart/add", {
                menu_item_id: menuItemId,
                quantity,
                notes,
            });

            // Update cart count
            dispatch({
                type: CART_ACTIONS.UPDATE_COUNT,
                payload: response.data.cart_count,
            });

            // Refresh cart data
            await fetchCart();

            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("Add to cart error:", error);
            dispatch({
                type: CART_ACTIONS.SET_ERROR,
                payload: "Failed to add item to cart",
            });
            return {
                success: false,
                message: error.response?.data?.message || "Failed to add item",
            };
        }
    };

    // Update cart item
    const updateCartItem = async (cartItemId, quantity, notes = "") => {
        try {
            dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
            const response = await axios.put(`/api/cart/${cartItemId}`, {
                quantity,
                notes,
            });

            // Update cart count
            dispatch({
                type: CART_ACTIONS.UPDATE_COUNT,
                payload: response.data.cart_count,
            });

            // Refresh cart data
            await fetchCart();

            return { success: true, message: response.data.message };
        } catch (error) {
            dispatch({
                type: CART_ACTIONS.SET_ERROR,
                payload: "Failed to update cart item",
            });
            console.error("Update cart error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to update item",
            };
        }
    };

    // Remove item from cart
    const removeFromCart = async (cartItemId) => {
        try {
            dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
            const response = await axios.delete(`/api/cart/${cartItemId}`);

            // Update cart count
            dispatch({
                type: CART_ACTIONS.UPDATE_COUNT,
                payload: response.data.cart_count,
            });

            // Refresh cart data
            await fetchCart();

            return { success: true, message: response.data.message };
        } catch (error) {
            dispatch({
                type: CART_ACTIONS.SET_ERROR,
                payload: "Failed to remove item from cart",
            });
            console.error("Remove from cart error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to remove item",
            };
        }
    };

    // Clear cart (entire cart or specific restaurant)
    const clearCart = async (restaurantId = null) => {
        try {
            dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
            const response = await axios.delete("/api/cart", {
                params: restaurantId ? { restaurant_id: restaurantId } : {},
            });

            // Update cart count
            dispatch({
                type: CART_ACTIONS.UPDATE_COUNT,
                payload: response.data.cart_count,
            });

            // Refresh cart data
            await fetchCart();

            return { success: true, message: response.data.message };
        } catch (error) {
            dispatch({
                type: CART_ACTIONS.SET_ERROR,
                payload: "Failed to clear cart",
            });
            console.error("Clear cart error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to clear cart",
            };
        }
    };

    // Get cart count only
    const fetchCartCount = async () => {
        try {
            const response = await axios.get("/api/cart/count");
            dispatch({
                type: CART_ACTIONS.UPDATE_COUNT,
                payload: response.data.count,
            });
        } catch (error) {
            console.error("Cart count fetch error:", error);
        }
    };

    // Load cart on mount
    useEffect(() => {
        fetchCart();
    }, []);

    const value = {
        // State
        cartByRestaurant: state.cartByRestaurant,
        grandTotal: state.grandTotal,
        totalItems: state.totalItems,
        loading: state.loading,
        error: state.error,

        // Actions
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCartCount,
    };

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
};

// Hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export default CartContext;

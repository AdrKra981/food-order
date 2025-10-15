import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Function to get CSRF token
const getCSRFToken = () => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    return token ? token.content : null;
};

// Set up CSRF token for axios requests
const setCsrfToken = () => {
    const token = getCSRFToken();
    if (token) {
        window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
        axios.defaults.headers.common["X-CSRF-TOKEN"] = token;

        return true;
    } else {
        console.error("CSRF token not found in meta tag");
        return false;
    }
};

// Set CSRF token initially
setCsrfToken();

// Add request interceptor to ensure CSRF token is always present
axios.interceptors.request.use(
    (config) => {
        const token = getCSRFToken();
        if (token) {
            config.headers["X-CSRF-TOKEN"] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle CSRF token mismatch
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 419) {
            console.error("CSRF token mismatch - please refresh the page");
            // Optionally reload the page to get a fresh token
            // window.location.reload();
        }
        return Promise.reject(error);
    }
);

window.testCartApi = async function () {
    try {
        const response = await axios.post("/api/cart/add", {
            menu_item_id: 1,
            quantity: 1,
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        return null;
    }
};

window.testCSRF = async function () {
    try {
        const response = await axios.post("/api/test-csrf", {});
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        return null;
    }
};

// --- Laravel Echo + Pusher setup (realtime) ---
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

try {
    const key = import.meta.env.VITE_PUSHER_APP_KEY;
    if (key) {
        window.Echo = new Echo({
            broadcaster: "pusher",
            key,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            wsHost:
                import.meta.env.VITE_PUSHER_HOST ||
                (import.meta.env.VITE_PUSHER_APP_CLUSTER
                    ? `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`
                    : undefined),
            wsPort: Number(import.meta.env.VITE_PUSHER_PORT || 80),
            wssPort: Number(import.meta.env.VITE_PUSHER_PORT || 443),
            forceTLS:
                (import.meta.env.VITE_PUSHER_SCHEME || "https") === "https",
            enabledTransports: ["ws", "wss"],
            authEndpoint: "/broadcasting/auth",
            auth: {
                headers: {
                    "X-CSRF-TOKEN": getCSRFToken(),
                },
            },
        });
    }
} catch (e) {
    console.warn("Echo/Pusher init failed:", e);
}

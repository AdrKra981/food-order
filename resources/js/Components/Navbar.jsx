import { useState, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import FoodieGoLogo from "./FoodieGoLogo";

export default function Navbar() {
    const { auth } = usePage().props;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.visit("/")}
                            className="flex items-center space-x-2 cursor-pointer"
                        >
                            <FoodieGoLogo className="cursor-pointer" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        {auth.user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() =>
                                        setShowUserMenu(!showUserMenu)
                                    }
                                    className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors"
                                >
                                    <UserIcon className="h-6 w-6" />
                                    <span className="hidden md:block text-sm font-medium">
                                        {auth.user.name}
                                    </span>
                                    <ChevronDownIcon className="h-4 w-4" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        <button
                                            onClick={() => {
                                                router.visit("/profile");
                                                setShowUserMenu(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile Settings
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.visit("/orders");
                                                setShowUserMenu(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            My Orders
                                        </button>
                                        {auth.user.role === "OWNER" && (
                                            <button
                                                onClick={() => {
                                                    router.visit(
                                                        "/owner/dashboard"
                                                    );
                                                    setShowUserMenu(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Restaurant Dashboard
                                            </button>
                                        )}
                                        {auth.user.role === "ADMIN" && (
                                            <button
                                                onClick={() => {
                                                    router.visit(
                                                        "/admin/dashboard"
                                                    );
                                                    setShowUserMenu(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Admin Dashboard
                                            </button>
                                        )}
                                        <hr className="my-1" />
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setShowUserMenu(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => router.visit("/login")}
                                    className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => router.visit("/register")}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Register
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

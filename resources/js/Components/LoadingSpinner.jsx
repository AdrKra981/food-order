import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

export default function LoadingSpinner({
    size = "medium",
    text = "Loading...",
}) {
    const sizeClasses = {
        small: "h-6 w-6",
        medium: "h-8 w-8",
        large: "h-12 w-12",
        xl: "h-16 w-16",
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                {/* Spinning outer ring */}
                <div
                    className={`${sizeClasses[size]} border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin`}
                ></div>

                {/* Inner icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <BuildingStorefrontIcon
                        className={`${
                            size === "small"
                                ? "h-3 w-3"
                                : size === "medium"
                                ? "h-4 w-4"
                                : size === "large"
                                ? "h-6 w-6"
                                : "h-8 w-8"
                        } text-indigo-600 animate-pulse`}
                    />
                </div>
            </div>

            {text && (
                <p
                    className={`text-gray-600 ${
                        size === "small"
                            ? "text-sm"
                            : size === "medium"
                            ? "text-base"
                            : size === "large"
                            ? "text-lg"
                            : "text-xl"
                    } animate-pulse`}
                >
                    {text}
                </p>
            )}
        </div>
    );
}

// Full page loading component
export function FullPageLoader({ text = "Loading your dashboard..." }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
            <div className="text-center">
                <div className="mb-8">
                    <LoadingSpinner size="xl" text="" />
                </div>

                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {text}
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                    Please wait while we prepare your experience...
                </p>

                {/* Progress dots */}
                <div className="flex justify-center space-x-1 mt-6">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div
                        className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                        className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

// Skeleton loader for content areas
export function SkeletonLoader() {
    return (
        <div className="animate-pulse">
            <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    );
}

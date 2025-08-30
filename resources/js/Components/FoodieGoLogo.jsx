import React from "react";

const FoodieGoLogo = ({
    className = "h-8 w-auto",
    textColor = "text-orange-600",
    showText = true,
}) => {
    return (
        <div className={`flex items-center ${className}`}>
            {/* Logo Icon */}
            <div className="relative">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                >
                    {/* Background Circle */}
                    <circle
                        cx="20"
                        cy="20"
                        r="18"
                        fill="url(#gradient1)"
                        stroke="#f97316"
                        strokeWidth="2"
                    />

                    {/* Fork */}
                    <g>
                        {/* Fork handle */}
                        <rect
                            x="13.5"
                            y="18"
                            width="1"
                            height="8"
                            fill="white"
                            rx="0.5"
                        />
                        {/* Fork tines */}
                        <rect
                            x="12"
                            y="8"
                            width="0.8"
                            height="12"
                            fill="white"
                            rx="0.4"
                        />
                        <rect
                            x="13.2"
                            y="8"
                            width="0.8"
                            height="10"
                            fill="white"
                            rx="0.4"
                        />
                        <rect
                            x="14.4"
                            y="8"
                            width="0.8"
                            height="12"
                            fill="white"
                            rx="0.4"
                        />
                        <rect
                            x="15.6"
                            y="8"
                            width="0.8"
                            height="10"
                            fill="white"
                            rx="0.4"
                        />
                    </g>

                    {/* Spoon */}
                    <g>
                        {/* Spoon handle */}
                        <rect
                            x="25.5"
                            y="18"
                            width="1"
                            height="8"
                            fill="white"
                            rx="0.5"
                        />
                        {/* Spoon bowl */}
                        <ellipse cx="26" cy="12" rx="3" ry="4" fill="white" />
                        <ellipse
                            cx="26"
                            cy="12"
                            rx="2.2"
                            ry="3.2"
                            fill="url(#gradient1)"
                        />
                    </g>

                    {/* Food Elements - Small circles representing food */}
                    <circle
                        cx="15"
                        cy="25"
                        r="2"
                        fill="#fbbf24"
                        opacity="0.8"
                    />
                    <circle
                        cx="25"
                        cy="28"
                        r="1.5"
                        fill="#ef4444"
                        opacity="0.8"
                    />
                    <circle
                        cx="20"
                        cy="32"
                        r="1"
                        fill="#22c55e"
                        opacity="0.8"
                    />

                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient
                            id="gradient1"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Logo Text */}
            {showText && (
                <div className="flex flex-col">
                    <span
                        className={`font-bold text-2xl ${textColor} leading-none`}
                    >
                        Foodie
                        <span className="text-gray-800">Go</span>
                    </span>
                    <span className="text-xs text-gray-500 font-medium tracking-wide">
                        FOOD DELIVERY
                    </span>
                </div>
            )}
        </div>
    );
};

// Alternative compact version for mobile/small spaces
export const FoodieGoLogoCompact = ({ className = "h-6 w-auto" }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <svg
                width="32"
                height="32"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
            >
                <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="url(#gradient2)"
                    stroke="#f97316"
                    strokeWidth="2"
                />
                <path
                    d="M14 10v6c0 1 0.5 1.5 1.5 1.5S17 17 17 16v-6M14 10h3M15.5 10v6"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
                <g>
                    {/* Compact Fork */}
                    <rect
                        x="15"
                        y="10"
                        width="0.6"
                        height="8"
                        fill="white"
                        rx="0.3"
                    />
                    <rect
                        x="14.2"
                        y="10"
                        width="0.6"
                        height="6"
                        fill="white"
                        rx="0.3"
                    />
                    <rect
                        x="15.8"
                        y="10"
                        width="0.6"
                        height="6"
                        fill="white"
                        rx="0.3"
                    />
                    <rect
                        x="16.6"
                        y="10"
                        width="0.6"
                        height="8"
                        fill="white"
                        rx="0.3"
                    />
                </g>
                <g>
                    {/* Compact Spoon */}
                    <rect
                        x="23.5"
                        y="16"
                        width="0.8"
                        height="6"
                        fill="white"
                        rx="0.4"
                    />
                    <ellipse cx="23.9" cy="12.5" rx="2.2" ry="3" fill="white" />
                    <ellipse
                        cx="23.9"
                        cy="12.5"
                        rx="1.6"
                        ry="2.2"
                        fill="url(#gradient2)"
                    />
                </g>
                <circle cx="16" cy="24" r="1.5" fill="#fbbf24" opacity="0.9" />
                <circle cx="24" cy="26" r="1" fill="#ef4444" opacity="0.9" />
                <defs>
                    <linearGradient
                        id="gradient2"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                </defs>
            </svg>
            <span className="font-bold text-lg text-orange-600">
                Foodie<span className="text-gray-800">Go</span>
            </span>
        </div>
    );
};

// Icon only version
export const FoodieGoIcon = ({ size = 40, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle
                cx="20"
                cy="20"
                r="18"
                fill="url(#gradient3)"
                stroke="#f97316"
                strokeWidth="2"
            />
            <path
                d="M12 8v8c0 1.5 1 2.5 2.5 2.5S17 17.5 17 16V8M12 8h5M14 8v8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <g>
                {/* Icon Fork */}
                <rect
                    x="13.5"
                    y="18"
                    width="1"
                    height="8"
                    fill="white"
                    rx="0.5"
                />
                <rect
                    x="12"
                    y="8"
                    width="0.8"
                    height="12"
                    fill="white"
                    rx="0.4"
                />
                <rect
                    x="13.2"
                    y="8"
                    width="0.8"
                    height="10"
                    fill="white"
                    rx="0.4"
                />
                <rect
                    x="14.4"
                    y="8"
                    width="0.8"
                    height="12"
                    fill="white"
                    rx="0.4"
                />
                <rect
                    x="15.6"
                    y="8"
                    width="0.8"
                    height="10"
                    fill="white"
                    rx="0.4"
                />
            </g>
            <g>
                {/* Icon Spoon */}
                <rect
                    x="25.5"
                    y="18"
                    width="1"
                    height="8"
                    fill="white"
                    rx="0.5"
                />
                <ellipse cx="26" cy="12" rx="3" ry="4" fill="white" />
                <ellipse
                    cx="26"
                    cy="12"
                    rx="2.2"
                    ry="3.2"
                    fill="url(#gradient3)"
                />
            </g>
            <circle cx="15" cy="25" r="2" fill="#fbbf24" opacity="0.8" />
            <circle cx="25" cy="28" r="1.5" fill="#ef4444" opacity="0.8" />
            <circle cx="20" cy="32" r="1" fill="#22c55e" opacity="0.8" />
            <defs>
                <linearGradient
                    id="gradient3"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default FoodieGoLogo;

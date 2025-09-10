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
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 64 64"
                    role="img"
                    aria-labelledby="title desc"
                >
                    <title id="title">FoodieGo Logo</title>
                    <desc id="desc">
                        A location pin with a plate and fork/spoon inside,
                        symbolizing food delivery.
                    </desc>

                    <defs>
                        <linearGradient
                            id="pinGradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="var(--logo-start, #FF6A00)"
                            />
                            <stop
                                offset="100%"
                                stopColor="var(--logo-end, #FF3D3D)"
                            />
                        </linearGradient>
                        <clipPath id="plateClip">
                            <circle cx="32" cy="26" r="10" />
                        </clipPath>
                    </defs>

                    <path
                        fill="url(#pinGradient)"
                        d="M32 4c-12.15 0-22 9.85-22 22 0 16.5 22 34 22 34s22-17.5 22-34C54 13.85 44.15 4 32 4z"
                    />

                    <circle
                        cx="32"
                        cy="26"
                        r="12"
                        fill="rgba(255,255,255,0.9)"
                    />
                    <circle cx="32" cy="26" r="10" fill="white" />

                    <g clipPath="url(#plateClip)" fill="#0F172A">
                        <ellipse cx="27" cy="22" rx="3.2" ry="3.7" />
                        <rect
                            x="26.1"
                            y="24.8"
                            width="1.8"
                            height="9.2"
                            rx="0.9"
                        />
                        <g transform="translate(35.5,20)">
                            <rect
                                x="-0.9"
                                y="5.5"
                                width="1.8"
                                height="11.5"
                                rx="0.9"
                            />
                            <rect
                                x="-2.8"
                                y="1.8"
                                width="5.6"
                                height="4"
                                rx="1.2"
                            />
                            <rect x="-2.2" y="0" width="0.9" height="3" />
                            <rect x="-0.45" y="0" width="0.9" height="3" />
                            <rect x="1.3" y="0" width="0.9" height="3" />
                        </g>
                    </g>

                    <path
                        fill="rgba(255,255,255,0.25)"
                        d="M22 12c-3.5 3.3-5.5 7.9-5.5 13 0 1 .05 2 .16 3C19 19 24.8 14.3 32 14.3c3.7 0 7.1 1.1 9.9 2.9-2.8-6.1-9-10.2-16.2-10.2-1.3 0-2.6.1-3.8.3z"
                    />
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

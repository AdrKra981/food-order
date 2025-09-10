import { useState, useRef, useEffect } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

const LocationIQAutocomplete = ({
    value = "",
    onChange,
    onPlaceSelect,
    placeholder = "Enter your address...",
    className = "",
    inputClassName = "",
    disabled = false,
    countryCode = "pl",
    apiKey = "",
    // types = ["address"],
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        if (onChange) {
            onChange(newValue);
        }

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce the search
        debounceRef.current = setTimeout(() => {
            if (newValue.length >= 3) {
                searchAddresses(newValue);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
    };

    const searchAddresses = async (query) => {
        if (!apiKey) {
            setError("LocationIQ API key is not configured");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                key: apiKey,
                q: query,
                format: "json",
                addressdetails: 1,
                limit: 8,
                countrycodes: countryCode,
                "accept-language": "pl,en",
                extratags: 1,
                namedetails: 1,
                // Focus on specific addresses, not general areas
                zoom: 18,
                viewbox:
                    "14.0745211117,49.0020468701,24.0299857927,54.8515359564", // Poland bounding box
                bounded: 1,
            });

            const response = await fetch(
                `https://eu1.locationiq.com/v1/search.php?${params}`
            );

            if (!response.ok) {
                throw new Error(`LocationIQ API error: ${response.status}`);
            }

            const data = await response.json();

            const formattedSuggestions = data
                .map((place) => ({
                    place_id: place.place_id,
                    display_name: place.display_name,
                    formatted_address: place.display_name,
                    lat: parseFloat(place.lat),
                    lng: parseFloat(place.lon),
                    address_components: {
                        city:
                            place.address?.city ||
                            place.address?.town ||
                            place.address?.village ||
                            "",
                        country: place.address?.country || "",
                        postcode: place.address?.postcode || "",
                        street: place.address?.road || "",
                        house_number: place.address?.house_number || "",
                    },
                    // Calculate completeness score for prioritization
                    completeness:
                        (place.address?.road ? 1 : 0) +
                        (place.address?.house_number ? 1 : 0) +
                        (place.address?.postcode ? 1 : 0) +
                        (place.address?.city ||
                        place.address?.town ||
                        place.address?.village
                            ? 1
                            : 0),
                }))
                // Filter to prioritize complete addresses
                .filter((place) => place.completeness >= 3) // Must have at least 3 of 4 components
                // Sort by completeness (most complete first)
                .sort((a, b) => b.completeness - a.completeness);

            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
        } catch (err) {
            console.error("LocationIQ search error:", err);
            setError(err.message);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (onChange) {
            onChange(suggestion.display_name);
        }

        setShowSuggestions(false);
        setSuggestions([]);

        if (onPlaceSelect) {
            onPlaceSelect(suggestion); // Pass the complete suggestion object
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={inputRef}>
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
                className={
                    inputClassName ||
                    "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                }
            />

            {/* Icon positioned based on input padding */}
            <div
                className={`absolute inset-y-0 left-0 flex items-center pointer-events-none ${
                    inputClassName && inputClassName.includes("px-4")
                        ? "pl-4"
                        : "pl-3"
                }`}
            >
                <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <div
                    className={`absolute inset-y-0 right-0 flex items-center pointer-events-none ${
                        inputClassName && inputClassName.includes("px-4")
                            ? "pr-4"
                            : "pr-3"
                    }`}
                >
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.place_id || index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                            <div className="flex items-start">
                                <MapPinIcon className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {suggestion.address_components
                                            .house_number &&
                                        suggestion.address_components.street
                                            ? `${suggestion.address_components.house_number} ${suggestion.address_components.street}`
                                            : suggestion.display_name.split(
                                                  ","
                                              )[0]}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {suggestion.address_components.city &&
                                        suggestion.address_components.postcode
                                            ? `${suggestion.address_components.city}, ${suggestion.address_components.postcode}`
                                            : suggestion.display_name}
                                    </p>
                                    {suggestion.completeness === 4 && (
                                        <div className="flex items-center mt-1">
                                            <div className="h-1 w-1 bg-green-500 rounded-full mr-1"></div>
                                            <span className="text-xs text-green-600">
                                                Complete address
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {suggestions.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            <p>
                                Please type a more specific address with street
                                name and number
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="absolute z-50 w-full bg-red-50 border border-red-300 rounded-md shadow-lg mt-1 p-3">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationIQAutocomplete;

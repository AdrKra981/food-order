import { useState, useEffect } from "react";
import { PhotoIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function MediaSelector({
    value,
    onChange,
    media = [],
    className = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (value) {
            setSelectedImage(value);
        }
    }, [value]);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleSelect = (mediaItem) => {
        setSelectedImage(mediaItem);
        onChange(mediaItem);
        setIsOpen(false);
    };

    const handleRemove = () => {
        setSelectedImage(null);
        onChange(null);
    };

    return (
        <div className={className}>
            {/* Selected Image Display */}
            {selectedImage ? (
                <div className="relative group">
                    <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img
                            src={
                                selectedImage.url
                                    ? selectedImage.url
                                    : `/storage/restaurants/${selectedImage.restaurant_id}/${selectedImage.filename}`
                            }
                            alt={selectedImage.original_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleOpen}
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100"
                    >
                        <span className="text-white text-sm font-medium">
                            Change Image
                        </span>
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleOpen}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                    <PhotoIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Select Image</span>
                </button>
            )}

            {/* Media Selection Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Select Image
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-96">
                            {media.length === 0 ? (
                                <div className="text-center py-12">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No images found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Upload some images first to use them
                                        here.
                                    </p>
                                    <div className="mt-6">
                                        <a
                                            href={route("owner.media.create")}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                                        >
                                            <PlusIcon className="w-5 h-5 mr-2" />
                                            Upload Images
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {media.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => handleSelect(item)}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                                                selectedImage?.id === item.id
                                                    ? "border-blue-500 ring-2 ring-blue-200"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <img
                                                src={
                                                    item.url
                                                        ? item.url
                                                        : `/storage/restaurants/${item.restaurant_id}/${item.filename}`
                                                }
                                                alt={item.original_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    console.log(
                                                        "Image failed to load:",
                                                        item.filename
                                                    );
                                                    e.target.style.display =
                                                        "none";
                                                }}
                                            />
                                            {selectedImage?.id === item.id && (
                                                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                                    <div className="bg-blue-500 text-white rounded-full p-1">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            {selectedImage && (
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    Use Selected Image
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

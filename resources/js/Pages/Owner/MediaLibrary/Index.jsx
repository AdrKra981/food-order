import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { useState } from "react";
import OwnerLayout from "../../../Layouts/OwnerLayout";
import ConfirmModal from "../../../Components/ConfirmModal";
import {
    PlusIcon,
    TrashIcon,
    PhotoIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";

export default function MediaIndex() {
    const { media } = usePage().props;
    const [selectedItems, setSelectedItems] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState({});

    const handleDelete = (id, fileName) => {
        setConfirmPayload({
            title: "Delete image",
            message: `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
            onConfirm: () => router.delete(route("owner.media.destroy", id)),
        });
        setConfirmOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) return;

        setConfirmPayload({
            title: "Delete selected images",
            message: `Are you sure you want to delete ${selectedItems.length} selected image(s)? This action cannot be undone.`,
            onConfirm: () =>
                router.delete(route("owner.media.bulk-destroy"), {
                    data: { media_ids: selectedItems },
                    onSuccess: () => {
                        setSelectedItems([]);
                        setIsSelecting(false);
                    },
                }),
        });
        setConfirmOpen(true);
    };

    const toggleSelection = (id) => {
        setSelectedItems((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedItems.length === media.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(media.map((item) => item.id));
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <OwnerLayout title="Media Library">
            <ConfirmModal
                open={confirmOpen}
                title={confirmPayload.title}
                message={confirmPayload.message}
                onConfirm={confirmPayload.onConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
            <div className="max-w-7xl mx-auto">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Media Library
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage your restaurant's images and media
                                    files
                                    {media.length > 0 &&
                                        ` (${media.length} total)`}
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                {media.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setIsSelecting(!isSelecting);
                                            setSelectedItems([]);
                                        }}
                                        className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                                            isSelecting
                                                ? "bg-gray-600 hover:bg-gray-700 text-white"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                        }`}
                                    >
                                        {isSelecting
                                            ? "Cancel Selection"
                                            : "Select Images"}
                                    </button>
                                )}
                                <Link
                                    href={route("owner.media.create")}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Upload Images
                                </Link>
                            </div>
                        </div>

                        {/* Bulk Actions Bar */}
                        {isSelecting && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={selectAll}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            {selectedItems.length ===
                                            media.length
                                                ? "Deselect All"
                                                : "Select All"}
                                        </button>
                                        <span className="text-gray-600">
                                            {selectedItems.length} of{" "}
                                            {media.length} selected
                                        </span>
                                    </div>
                                    {selectedItems.length > 0 && (
                                        <button
                                            onClick={handleBulkDelete}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200"
                                        >
                                            <TrashIcon className="w-4 h-4 mr-2" />
                                            Delete Selected (
                                            {selectedItems.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Media Grid */}
                        {media.length === 0 ? (
                            <div className="text-center py-12">
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No images uploaded
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by uploading your first image.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route("owner.media.create")}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                                    >
                                        <PlusIcon className="w-5 h-5 mr-2" />
                                        Upload Images
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {media.map((file) => (
                                    <div
                                        key={file.id}
                                        className={`group relative bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 ${
                                            isSelecting
                                                ? selectedItems.includes(
                                                      file.id
                                                  )
                                                    ? "border-blue-500 ring-2 ring-blue-200"
                                                    : "border-gray-200 hover:border-gray-300"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        {/* Selection Checkbox */}
                                        {isSelecting && (
                                            <div className="absolute top-2 left-2 z-10">
                                                <button
                                                    onClick={() =>
                                                        toggleSelection(file.id)
                                                    }
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                                        selectedItems.includes(
                                                            file.id
                                                        )
                                                            ? "bg-blue-600 border-blue-600 text-white"
                                                            : "bg-white border-gray-300 hover:border-gray-400"
                                                    }`}
                                                >
                                                    {selectedItems.includes(
                                                        file.id
                                                    ) && (
                                                        <CheckIcon className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Usage Badge */}
                                        {file.menu_items_count > 0 && (
                                            <div className="absolute top-2 right-2 z-10">
                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    Used in{" "}
                                                    {file.menu_items_count} item
                                                    {file.menu_items_count !== 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                            </div>
                                        )}

                                        {/* Image */}
                                        <div
                                            className="aspect-square bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                                isSelecting &&
                                                toggleSelection(file.id)
                                            }
                                        >
                                            <img
                                                src={file.path}
                                                alt={file.original_name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Overlay with actions */}
                                        {!isSelecting && (
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            file.id,
                                                            file.original_name
                                                        )
                                                    }
                                                    className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all duration-200 transform scale-90 group-hover:scale-100"
                                                    title="Delete image"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}

                                        {/* File info */}
                                        <div className="p-3">
                                            <p
                                                className="text-sm font-medium text-gray-900 truncate"
                                                title={file.original_name}
                                            >
                                                {file.original_name}
                                            </p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-gray-500">
                                                    {formatFileSize(file.size)}
                                                </p>
                                                {file.menu_items_count > 0 && (
                                                    <p className="text-xs text-green-600 font-medium">
                                                        In use
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}

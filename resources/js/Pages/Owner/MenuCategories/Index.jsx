import OwnerLayout from "@/Layouts/OwnerLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import { ConfirmationModal, AlertModal } from "@/Components/ConfirmationModal";
import {
    DocumentTextIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    StarIcon,
    FireIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

export default function Index() {
    const { categories } = usePage().props;
    const [showAlert, setShowAlert] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 1:
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <StarIcon className="w-3 h-3 mr-1" />
                        Featured
                    </span>
                );
            case 2:
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FireIcon className="w-3 h-3 mr-1" />
                        Promoted
                    </span>
                );
            case 3:
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        Special
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Normal
                    </span>
                );
        }
    };

    const toggleAvailability = async (category) => {
        try {
            const response = await fetch(
                route("owner.menu-categories.toggle-availability", category.id),
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                }
            );

            if (response.ok) {
                router.reload({ only: ["categories"] });
            }
        } catch (error) {
            console.error("Error toggling availability:", error);
        }
    };

    const handleDelete = (category) => {
        setSelectedCategory(category);

        if (category.menu_items_count > 0) {
            setShowAlert(true);
            return;
        }

        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (!selectedCategory) return;

        setIsDeleting(true);
        try {
            router.delete(
                route("owner.menu-categories.destroy", selectedCategory.id),
                {
                    onFinish: () => {
                        setIsDeleting(false);
                        setShowConfirm(false);
                        setSelectedCategory(null);
                    },
                }
            );
        } catch (error) {
            setIsDeleting(false);
        }
    };

    const closeAlert = () => {
        setShowAlert(false);
        setSelectedCategory(null);
    };

    const closeConfirm = () => {
        if (!isDeleting) {
            setShowConfirm(false);
            setSelectedCategory(null);
        }
    };

    return (
        <OwnerLayout
            header={
                <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-2" />
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Menu Categories
                        </h2>
                    </div>
                    <Link
                        href={route("owner.menu-categories.create")}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 transition ease-in-out duration-150"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Category
                    </Link>
                </div>
            }
        >
            <Head title="Menu Categories" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {categories && categories.length > 0 ? (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                                                !category.is_available
                                                    ? "opacity-60 bg-gray-50"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {category.name}
                                                        </h3>
                                                        {!category.is_available && (
                                                            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                                                Unavailable
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mb-2">
                                                        {getPriorityBadge(
                                                            category.priority
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            toggleAvailability(
                                                                category
                                                            )
                                                        }
                                                        className={`px-2 py-1 text-xs rounded ${
                                                            category.is_available
                                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                                        }`}
                                                        title={
                                                            category.is_available
                                                                ? "Mark as unavailable"
                                                                : "Mark as available"
                                                        }
                                                    >
                                                        {category.is_available
                                                            ? "Available"
                                                            : "Unavailable"}
                                                    </button>
                                                    <Link
                                                        href={route(
                                                            "owner.menu-categories.edit",
                                                            category.id
                                                        )}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Edit category"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                category
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete category"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3">
                                                {category.description ||
                                                    "No description provided"}
                                            </p>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>
                                                    {category.menu_items_count ||
                                                        0}{" "}
                                                    items
                                                </span>
                                                <span>
                                                    Order:{" "}
                                                    {category.sort_order || 0}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-8 sm:px-6 text-center">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No menu categories
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating your first menu
                                    category.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route(
                                            "owner.menu-categories.create"
                                        )}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 transition ease-in-out duration-150"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Add Category
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Alert Modal for categories with items */}
            <AlertModal
                isOpen={showAlert}
                onClose={closeAlert}
                title="Cannot Delete Category"
                message={
                    selectedCategory
                        ? `Cannot delete "${selectedCategory.name}" because it contains ${selectedCategory.menu_items_count} menu items. Please remove all items from this category first.`
                        : ""
                }
                type="error"
                buttonText="Got it"
            />

            {/* Confirmation Modal for delete */}
            <ConfirmationModal
                isOpen={showConfirm}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
                title="Delete Category"
                message={
                    selectedCategory
                        ? `Are you sure you want to delete "${selectedCategory.name}"? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                isLoading={isDeleting}
            />
        </OwnerLayout>
    );
}

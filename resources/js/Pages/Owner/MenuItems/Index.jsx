import OwnerLayout from "@/Layouts/OwnerLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import ConfirmModal from "@/Components/ConfirmModal";
import useTrans from "@/Hooks/useTrans";
import {
    DocumentTextIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    PhotoIcon,
    StarIcon,
    FireIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

export default function Index() {
    const { menuItems } = usePage().props;

    const { t } = useTrans();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [pendingDeleteName, setPendingDeleteName] = useState(null);

    const handleDelete = (id, name) => {
        setPendingDeleteId(id);
        setPendingDeleteName(name || null);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (pendingDeleteId) {
            router.delete(route("owner.menu-items.destroy", pendingDeleteId));
        }
        setConfirmOpen(false);
        setPendingDeleteId(null);
        setPendingDeleteName(null);
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 1:
                return {
                    label: "Featured",
                    color: "bg-blue-100 text-blue-800",
                    icon: StarIcon,
                };
            case 2:
                return {
                    label: "Promoted",
                    color: "bg-green-100 text-green-800",
                    icon: FireIcon,
                };
            case 3:
                return {
                    label: "Chef's Special",
                    color: "bg-purple-100 text-purple-800",
                    icon: SparklesIcon,
                };
            default:
                return null;
        }
    };

    const toggleAvailability = (itemId, currentStatus) => {
        router.patch(route("owner.menu-items.update", itemId), {
            is_available: !currentStatus,
        });
    };

    return (
        <OwnerLayout
            header={
                <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-4">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-2" />
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {t("menu_items")}
                        </h2>
                    </div>
                    <Link
                        href={route("owner.menu-items.create")}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 transition ease-in-out duration-150"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        {t("add_item")}
                    </Link>
                </div>
            }
        >
            <Head title={t("menu_items")} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {menuItems && menuItems.length > 0 ? (
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {menuItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        {item.media ? (
                                            <img
                                                src={
                                                    item.media.url
                                                        ? item.media.url
                                                        : `/storage/restaurants/${item.restaurant_id}/${item.media.filename}`
                                                }
                                                alt={item.name}
                                                className="w-full h-48 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                                <PhotoIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {item.name}
                                                        </h3>
                                                        {!item.is_available && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Unavailable
                                                            </span>
                                                        )}
                                                    </div>
                                                    {getPriorityBadge(
                                                        item.priority
                                                    ) && (
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {(() => {
                                                                const badge =
                                                                    getPriorityBadge(
                                                                        item.priority
                                                                    );
                                                                const IconComponent =
                                                                    badge.icon;
                                                                return (
                                                                    <span
                                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                                                                    >
                                                                        <IconComponent className="h-3 w-3 mr-1" />
                                                                        {
                                                                            badge.label
                                                                        }
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2 items-center">
                                                    <button
                                                        onClick={() =>
                                                            toggleAvailability(
                                                                item.id,
                                                                item.is_available
                                                            )
                                                        }
                                                        className={`text-sm px-2 py-1 rounded ${
                                                            item.is_available
                                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                                        }`}
                                                        title={
                                                            item.is_available
                                                                ? "Mark as unavailable"
                                                                : "Mark as available"
                                                        }
                                                    >
                                                        {item.is_available
                                                            ? t("available")
                                                            : t("unavailable")}
                                                    </button>
                                                    <Link
                                                        href={route(
                                                            "owner.menu-items.edit",
                                                            item.id
                                                        )}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title={t("edit_item")}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id,
                                                                item.name
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                        title={t("delete_item")}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3">
                                                {item.description ||
                                                    "No description provided"}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold text-green-600">
                                                    ${item.price}
                                                </span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {item.menu_category?.name ||
                                                        "No category"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-8 sm:px-6 text-center">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    {t("no_menu_items")}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {t("create_first_item")}
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route("owner.menu-items.create")}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 transition ease-in-out duration-150"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        {t("add_item")}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </OwnerLayout>
    );
}

// Confirm modal rendered at module bottom to avoid interrupting JSX above
export function ConfirmModalWrapper({ open, onClose, onConfirm, name }) {
    const { t } = useTrans();

    return (
        <ConfirmModal
            open={open}
            title={name ? `${t("delete")} ${name}` : t("delete_item")}
            message={
                name
                    ? t("delete_item_message", { name })
                    : t("delete_item_generic")
            }
            confirmText={t("delete")}
            cancelText={t("cancel")}
            onConfirm={onConfirm}
            onCancel={onClose}
        />
    );
}

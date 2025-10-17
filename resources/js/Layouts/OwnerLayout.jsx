import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { FullPageLoader } from "@/Components/LoadingSpinner";
import { Link, usePage } from "@inertiajs/react";
import useTrans from "@/Hooks/useTrans";
import { useState } from "react";
import {
    HomeIcon,
    BuildingStorefrontIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    PhotoIcon,
    ChartBarIcon,
    Bars3Icon,
    XMarkIcon,
    ShoppingBagIcon,
    TagIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function OwnerLayout({ header, children }) {
    const pageProps = usePage().props;
    const { auth } = pageProps;
    const user = auth?.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const { t } = useTrans();

    // Don't render if user is not loaded yet
    if (!user) {
        return <FullPageLoader text={t("loading_dashboard")} />;
    }

    const navigation = [
        {
            name: "Dashboard",
            i18n: "restaurant_dashboard",
            href: route("owner.dashboard"),
            icon: HomeIcon,
            current: route().current("owner.dashboard"),
        },
        {
            name: "Restaurant Settings",
            i18n: "restaurant_settings",
            href: route("owner.restaurant.edit"),
            icon: BuildingStorefrontIcon,
            current: route().current("owner.restaurant.*"),
        },
        {
            name: "Menu Categories",
            i18n: "menu_categories",
            href: route("owner.menu-categories.index"),
            icon: DocumentTextIcon,
            current: route().current("owner.menu-categories.*"),
        },
        {
            name: "Menu Items",
            i18n: "menu_items",
            href: route("owner.menu-items.index"),
            icon: ClipboardDocumentListIcon,
            current: route().current("owner.menu-items.*"),
        },
        {
            name: "Promo Codes",
            i18n: "promo_codes",
            href: route("owner.promo-codes.index"),
            icon: TagIcon,
            current: route().current("owner.promo-codes.*"),
        },
        {
            name: "Employees",
            href: route("owner.employees.index"),
            icon: UserGroupIcon,
            current: route().current("owner.employees.*"),
        },
        {
            name: "Orders",
            i18n: "orders",
            href: route("owner.orders"),
            icon: ShoppingBagIcon,
            current: route().current("owner.orders*"),
        },
        {
            name: "Media Library",
            i18n: "media_library",
            href: route("owner.media.index"),
            icon: PhotoIcon,
            current: route().current("owner.media.*"),
        },
        {
            name: "Reports",
            i18n: "reports",
            href: route("owner.reports"),
            icon: ChartBarIcon,
            current: route().current("owner.reports"),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile menu */}
            <div
                className={`fixed inset-0 z-40 lg:hidden ${
                    showingNavigationDropdown ? "block" : "hidden"
                }`}
            >
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75"
                    onClick={() => setShowingNavigationDropdown(false)}
                ></div>
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col">
                    <div className="flex min-h-0 flex-1 flex-col bg-white">
                        <div className="flex h-16 flex-shrink-0 items-center justify-between px-4 bg-indigo-600">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-8 w-auto text-white" />
                                <span className="ml-2 text-white font-semibold">
                                    {t("restaurant_panel")}
                                </span>
                            </div>
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(false)
                                }
                                className="text-white hover:text-gray-200"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex flex-1 flex-col overflow-y-auto">
                            <nav className="flex-1 space-y-1 px-2 py-4">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                            item.current
                                                ? "bg-indigo-100 text-indigo-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                    >
                                        <item.icon
                                            className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                                item.current
                                                    ? "text-indigo-500"
                                                    : "text-gray-400 group-hover:text-gray-500"
                                            }`}
                                        />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
                    <div className="flex h-16 flex-shrink-0 items-center px-4 bg-indigo-600">
                        <ApplicationLogo className="h-8 w-auto text-white" />
                        <span className="ml-2 text-white font-semibold">
                            {t("restaurant_panel")}
                        </span>
                    </div>
                    <div className="flex flex-1 flex-col overflow-y-auto">
                        <nav className="flex-1 space-y-1 px-2 py-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                        item.current
                                            ? "bg-indigo-100 text-indigo-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                            item.current
                                                ? "text-indigo-500"
                                                : "text-gray-400 group-hover:text-gray-500"
                                        }`}
                                    />
                                    {t(item.i18n)}
                                </Link>
                            ))}
                        </nav>

                        {/* User info at bottom */}
                        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                            <div className="group block w-full flex-shrink-0">
                                <div className="flex items-center">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500">
                                        <span className="text-sm font-medium leading-none text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-700">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Restaurant Owner
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Top navigation */}
                <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
                    <button
                        onClick={() =>
                            setShowingNavigationDropdown(
                                !showingNavigationDropdown
                            )
                        }
                        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex flex-1">
                            {header && (
                                <div className="flex items-center">
                                    {header}
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex items-center md:ml-6">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                        >
                                            {user.name}
                                            <svg
                                                className="-me-0.5 ms-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route("profile.edit")}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route("owner.dashboard")}
                                    >
                                        Restaurant Panel
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}

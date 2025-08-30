import { Link, usePage } from "@inertiajs/react";
import FoodieGoLogo from "@/Components/FoodieGoLogo";

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r shadow-sm p-6 space-y-4">
                <FoodieGoLogo className="h-10 mb-4" />
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <nav className="flex flex-col gap-2">
                    {user.role === "admin" && (
                        <>
                            <Link
                                href={route("admin.dashboard")}
                                className="hover:underline"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href={route("admin.restaurants.pending")}
                                className="hover:underline"
                            >
                                Pending Restaurants
                            </Link>
                        </>
                    )}
                    {/* Add more admin links here */}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Hello, {auth.user.name}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {auth.user.email}
                        </p>
                    </div>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="text-sm text-red-500 hover:underline"
                    >
                        Logout
                    </Link>
                </div>

                <div className="bg-white p-6 rounded shadow">{children}</div>
            </main>
        </div>
    );
}

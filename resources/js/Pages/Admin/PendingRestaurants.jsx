import { router } from "@inertiajs/react";

export default function PendingRestaurants({ restaurants }) {
    const handleAccept = (id) => {
        router.post(`/admin/restaurants/${id}/accept`);
    };

    const handleReject = (id) => {
        router.post(`/admin/restaurants/${id}/reject`);
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Pending Restaurants</h1>
            {restaurants.length === 0 ? (
                <p>No pending restaurants.</p>
            ) : (
                <ul>
                    {restaurants.map((restaurant) => (
                        <li
                            key={restaurant.id}
                            className="mb-4 border p-4 rounded"
                        >
                            <p>
                                <strong>{restaurant.name}</strong> -{" "}
                                {restaurant.city}
                            </p>
                            <div className="mt-2">
                                <button
                                    onClick={() => handleAccept(restaurant.id)}
                                    className="mr-2 bg-green-500 text-white px-3 py-1 rounded"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleReject(restaurant.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Reject
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

import { useForm } from "@inertiajs/react";
import OwnerLayout from "../../../Layouts/OwnerLayout";
import MediaSelector from "../../../Components/MediaSelector";

export default function Edit({ menuItem, categories, media }) {
    const { data, setData, put, processing, errors } = useForm({
        name: menuItem.name,
        description: menuItem.description || "",
        price: menuItem.price,
        media_id: menuItem.media_id || null,
        menu_category_id: menuItem.menu_category_id,
        priority: menuItem.priority || 0,
        is_available: menuItem.is_available ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("owner.menu-items.update", menuItem.id));
    };

    const handleMediaSelect = (media) => {
        setData("media_id", media ? media.id : null);
    };

    return (
        <OwnerLayout title="Edit Menu Item">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">
                            Edit Menu Item
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    required
                                />
                                {errors.name && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    rows="3"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                                {errors.description && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.description}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="price"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Price
                                </label>
                                <input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData("price", e.target.value)
                                    }
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    required
                                />
                                {errors.price && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.price}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image
                                </label>
                                <MediaSelector
                                    value={menuItem.media}
                                    onChange={handleMediaSelect}
                                    media={media}
                                />
                                {errors.media_id && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.media_id}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="menu_category_id"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Category
                                </label>
                                <select
                                    id="menu_category_id"
                                    value={data.menu_category_id}
                                    onChange={(e) =>
                                        setData(
                                            "menu_category_id",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.menu_category_id && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.menu_category_id}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="priority"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Priority Level
                                </label>
                                <select
                                    id="priority"
                                    value={data.priority}
                                    onChange={(e) =>
                                        setData(
                                            "priority",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                >
                                    <option value={0}>Normal</option>
                                    <option value={1}>Featured</option>
                                    <option value={2}>Promoted</option>
                                    <option value={3}>Chef's Special</option>
                                </select>
                                {errors.priority && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.priority}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_available}
                                        onChange={(e) =>
                                            setData(
                                                "is_available",
                                                e.target.checked
                                            )
                                        }
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Item is available for ordering
                                    </span>
                                </label>
                                {errors.is_available && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.is_available}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end space-x-4">
                                <a
                                    href={route("owner.menu-items.index")}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                >
                                    Cancel
                                </a>
                                <button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Updating..."
                                        : "Update Menu Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}

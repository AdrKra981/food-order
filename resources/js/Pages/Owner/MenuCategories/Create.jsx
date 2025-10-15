import OwnerLayout from "@/Layouts/OwnerLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import useTrans from "@/Hooks/useTrans";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function Create() {
    const { t } = useTrans();
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        sort_order: 0,
        priority: 0,
        is_available: true,
    });

    function submit(e) {
        e.preventDefault();
        post(route("owner.menu-categories.store"));
    }

    return (
        <OwnerLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                        <Link
                            href={route("owner.menu-categories.index")}
                            className="mr-4 text-gray-400 hover:text-gray-600"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Link>
                        <PlusIcon className="h-6 w-6 text-gray-400 mr-2" />
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {t("create_menu_category_title")}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={t("create_menu_category_title")} />

            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg">
                        <form
                            onSubmit={submit}
                            className="px-4 py-5 sm:p-6 space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Category Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter category name"
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter category description"
                                />
                                {errors.description && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="sort_order"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Sort Order
                                </label>
                                <input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) =>
                                        setData("sort_order", e.target.value)
                                    }
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="0"
                                />
                                {errors.sort_order && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.sort_order}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="priority"
                                    className="block text-sm font-medium text-gray-700"
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
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value={0}>Normal</option>
                                    <option value={1}>Featured</option>
                                    <option value={2}>Promoted</option>
                                    <option value={3}>Special Category</option>
                                </select>
                                {errors.priority && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.priority}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="is_available"
                                    type="checkbox"
                                    checked={data.is_available}
                                    onChange={(e) =>
                                        setData(
                                            "is_available",
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="is_available"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Category is available
                                </label>
                                {errors.is_available && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.is_available}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route("owner.menu-categories.index")}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {t("cancel")}
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? t("processing") : t("create")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}

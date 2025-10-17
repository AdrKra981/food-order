import React from "react";
import { Head, useForm } from "@inertiajs/react";
import OwnerLayout from "@/Layouts/OwnerLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        code: "",
        name: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        minimum_order_amount: "0",
        maximum_discount_amount: "",
        usage_limit_per_customer: "",
        total_usage_limit: "",
        applicable_categories: [],
        is_active: true,
        valid_from: "",
        valid_until: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("owner.promo-codes.store"));
    };

    const handleCategoryChange = (categoryId) => {
        const currentCategories = data.applicable_categories || [];
        if (currentCategories.includes(categoryId)) {
            setData(
                "applicable_categories",
                currentCategories.filter((id) => id !== categoryId)
            );
        } else {
            setData("applicable_categories", [
                ...currentCategories,
                categoryId,
            ]);
        }
    };

    return (
        <OwnerLayout
            header={
                <div className="flex items-center">
                    <a
                        href={route("owner.promo-codes.index")}
                        className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </a>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Create Promo Code
                    </h2>
                </div>
            }
        >
            <Head title="Create Promo Code" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center mb-6">
                                <a
                                    href={route("owner.promo-codes.index")}
                                    className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </a>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Create Promo Code
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Set up a new discount code for your
                                        customers
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel
                                            htmlFor="code"
                                            value="Promo Code *"
                                        />
                                        <TextInput
                                            id="code"
                                            type="text"
                                            className="mt-1 block w-full uppercase"
                                            value={data.code}
                                            onChange={(e) =>
                                                setData(
                                                    "code",
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            placeholder="e.g., SAVE20"
                                            maxLength="50"
                                        />
                                        <InputError
                                            message={errors.code}
                                            className="mt-2"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Enter a unique code customers will
                                            use
                                        </p>
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="name"
                                            value="Display Name *"
                                        />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            placeholder="e.g., 20% Summer Discount"
                                        />
                                        <InputError
                                            message={errors.name}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="description"
                                        value="Description"
                                    />
                                    <textarea
                                        id="description"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows="3"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Optional description for internal use"
                                    />
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Discount Configuration */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Discount Settings
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <InputLabel
                                                htmlFor="discount_type"
                                                value="Discount Type *"
                                            />
                                            <select
                                                id="discount_type"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={data.discount_type}
                                                onChange={(e) =>
                                                    setData(
                                                        "discount_type",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="percentage">
                                                    Percentage (%)
                                                </option>
                                                <option value="fixed_amount">
                                                    Fixed Amount ($)
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.discount_type}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="discount_value"
                                                value="Discount Value *"
                                            />
                                            <TextInput
                                                id="discount_value"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={
                                                    data.discount_type ===
                                                    "percentage"
                                                        ? "100"
                                                        : undefined
                                                }
                                                className="mt-1 block w-full"
                                                value={data.discount_value}
                                                onChange={(e) =>
                                                    setData(
                                                        "discount_value",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={
                                                    data.discount_type ===
                                                    "percentage"
                                                        ? "20"
                                                        : "10.00"
                                                }
                                            />
                                            <InputError
                                                message={errors.discount_value}
                                                className="mt-2"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                {data.discount_type ===
                                                "percentage"
                                                    ? "Percentage (0-100)"
                                                    : "Dollar amount"}
                                            </p>
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="maximum_discount_amount"
                                                value="Max Discount Amount"
                                            />
                                            <TextInput
                                                id="maximum_discount_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="mt-1 block w-full"
                                                value={
                                                    data.maximum_discount_amount
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "maximum_discount_amount",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="50.00"
                                            />
                                            <InputError
                                                message={
                                                    errors.maximum_discount_amount
                                                }
                                                className="mt-2"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Optional cap on discount amount
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <InputLabel
                                            htmlFor="minimum_order_amount"
                                            value="Minimum Order Amount *"
                                        />
                                        <TextInput
                                            id="minimum_order_amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="mt-1 block w-full md:w-1/3"
                                            value={data.minimum_order_amount}
                                            onChange={(e) =>
                                                setData(
                                                    "minimum_order_amount",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors.minimum_order_amount
                                            }
                                            className="mt-2"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Minimum order required to use this
                                            code
                                        </p>
                                    </div>
                                </div>

                                {/* Usage Limits */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Usage Limits
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel
                                                htmlFor="total_usage_limit"
                                                value="Total Usage Limit"
                                            />
                                            <TextInput
                                                id="total_usage_limit"
                                                type="number"
                                                min="1"
                                                className="mt-1 block w-full"
                                                value={data.total_usage_limit}
                                                onChange={(e) =>
                                                    setData(
                                                        "total_usage_limit",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="100"
                                            />
                                            <InputError
                                                message={
                                                    errors.total_usage_limit
                                                }
                                                className="mt-2"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Total times this code can be
                                                used (leave empty for unlimited)
                                            </p>
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="usage_limit_per_customer"
                                                value="Per Customer Limit"
                                            />
                                            <TextInput
                                                id="usage_limit_per_customer"
                                                type="number"
                                                min="1"
                                                className="mt-1 block w-full"
                                                value={
                                                    data.usage_limit_per_customer
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "usage_limit_per_customer",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="1"
                                            />
                                            <InputError
                                                message={
                                                    errors.usage_limit_per_customer
                                                }
                                                className="mt-2"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Times each customer can use this
                                                code
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Selection */}
                                {categories.length > 0 && (
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Applicable Categories
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Select categories this promo code
                                            applies to (leave empty for all
                                            categories)
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {categories.map((category) => (
                                                <label
                                                    key={category.id}
                                                    className="flex items-center"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        checked={data.applicable_categories.includes(
                                                            category.id
                                                        )}
                                                        onChange={() =>
                                                            handleCategoryChange(
                                                                category.id
                                                            )
                                                        }
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">
                                                        {category.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        <InputError
                                            message={
                                                errors.applicable_categories
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                )}

                                {/* Validity Period */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Validity Period
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel
                                                htmlFor="valid_from"
                                                value="Valid From *"
                                            />
                                            <TextInput
                                                id="valid_from"
                                                type="datetime-local"
                                                className="mt-1 block w-full"
                                                value={data.valid_from}
                                                onChange={(e) =>
                                                    setData(
                                                        "valid_from",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.valid_from}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="valid_until"
                                                value="Valid Until *"
                                            />
                                            <TextInput
                                                id="valid_until"
                                                type="datetime-local"
                                                className="mt-1 block w-full"
                                                value={data.valid_until}
                                                onChange={(e) =>
                                                    setData(
                                                        "valid_until",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.valid_until}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="border-t pt-6">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            checked={data.is_active}
                                            onChange={(e) =>
                                                setData(
                                                    "is_active",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Active (customers can use this code)
                                        </span>
                                    </label>
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end space-x-3 pt-6">
                                    <a
                                        href={route("owner.promo-codes.index")}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </a>
                                    <PrimaryButton disabled={processing}>
                                        {processing
                                            ? "Creating..."
                                            : "Create Promo Code"}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Confirmation Modal Component
export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    type = "warning",
    isLoading = false,
}) {
    const { t } = require("@/Hooks/useTrans")();
    const iconMap = {
        warning: ExclamationTriangleIcon,
        error: ExclamationTriangleIcon,
        danger: ExclamationTriangleIcon,
        info: InformationCircleIcon,
        success: CheckCircleIcon,
    };

    const colorMap = {
        warning: "text-amber-600 bg-amber-100",
        error: "text-red-600 bg-red-100",
        danger: "text-red-600 bg-red-100",
        info: "text-blue-600 bg-blue-100",
        success: "text-green-600 bg-green-100",
    };

    const buttonColorMap = {
        warning: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
        error: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    };

    const Icon = iconMap[type];

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-start">
                                    <div
                                        className={`flex-shrink-0 ${colorMap[type]} rounded-full p-2`}
                                    >
                                        <Icon
                                            className="h-6 w-6"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="ml-4 w-full">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex space-x-3 justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        {cancelText ?? t("cancel")}
                                    </button>
                                    <button
                                        type="button"
                                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${buttonColorMap[type]}`}
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                {t("processing")}
                                            </div>
                                        ) : (
                                            confirmText ?? t("delete")
                                        )}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

// Alert Modal Component
export function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    buttonText = "OK",
    type = "error",
}) {
    const iconMap = {
        warning: ExclamationTriangleIcon,
        error: ExclamationTriangleIcon,
        info: InformationCircleIcon,
        success: CheckCircleIcon,
    };

    const colorMap = {
        warning: "text-amber-600 bg-amber-100",
        error: "text-red-600 bg-red-100",
        info: "text-blue-600 bg-blue-100",
        success: "text-green-600 bg-green-100",
    };

    const Icon = iconMap[type];

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-start">
                                    <div
                                        className={`flex-shrink-0 ${colorMap[type]} rounded-full p-2`}
                                    >
                                        <Icon
                                            className="h-6 w-6"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="ml-4 w-full">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                                        onClick={onClose}
                                    >
                                        {buttonText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

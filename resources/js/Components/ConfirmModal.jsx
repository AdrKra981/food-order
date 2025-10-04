import React from "react";
import useTrans from "@/Hooks/useTrans";

export default function ConfirmModal({
    open,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
}) {
    const { t } = useTrans();

    if (!open) return null;

    const confirmLabel = confirmText ?? t("confirm");
    const cancelLabel = cancelText ?? t("cancel");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black opacity-50"
                onClick={onCancel}
            ></div>
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 z-10">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                        {message}
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-white border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                try {
                                    onConfirm && onConfirm();
                                } catch (e) {
                                    /* swallow */
                                }
                                onCancel && onCancel();
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

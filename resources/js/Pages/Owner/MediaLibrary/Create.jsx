import { useForm } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { useState, useRef } from "react";
import OwnerLayout from "../../../Layouts/OwnerLayout";
import {
    CloudArrowUpIcon,
    XMarkIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function MediaCreate() {
    const { data, setData, post, processing, errors } = useForm({
        files: [],
    });
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewFiles, setPreviewFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileSelect = (files) => {
        const validFiles = Array.from(files).filter((file) => {
            const isImage = file.type.startsWith("image/");
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
            return isImage && isValidSize;
        });

        if (validFiles.length > 0) {
            setData("files", [...data.files, ...validFiles]);

            // Create previews
            validFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewFiles((prev) => [
                        ...prev,
                        {
                            file,
                            preview: e.target.result,
                            name: file.name,
                            size: file.size,
                        },
                    ]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleFileInputChange = (e) => {
        handleFileSelect(e.target.files);
    };

    const removeFile = (index) => {
        const newFiles = data.files.filter((_, i) => i !== index);
        const newPreviews = previewFiles.filter((_, i) => i !== index);
        setData("files", newFiles);
        setPreviewFiles(newPreviews);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        data.files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });

        post(route("owner.media.store"), {
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <OwnerLayout title="Upload Images">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Upload Images
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Add new images to your media library
                                </p>
                            </div>
                            <Link
                                href={route("owner.media.index")}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors duration-200"
                            >
                                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                Back to Library
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Drag and Drop Area */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                                    isDragOver
                                        ? "border-blue-400 bg-blue-50"
                                        : "border-gray-300 hover:border-gray-400"
                                }`}
                            >
                                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Drop images here or click to upload
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Supports: JPG, PNG, GIF up to 10MB each
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            {/* File Previews */}
                            {previewFiles.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Selected Images ({previewFiles.length})
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {previewFiles.map((fileObj, index) => (
                                            <div
                                                key={index}
                                                className="relative bg-gray-50 rounded-lg overflow-hidden"
                                            >
                                                <div className="aspect-square">
                                                    <img
                                                        src={fileObj.preview}
                                                        alt={fileObj.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeFile(index)
                                                    }
                                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors duration-200"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                                <div className="p-2">
                                                    <p
                                                        className="text-xs font-medium text-gray-900 truncate"
                                                        title={fileObj.name}
                                                    >
                                                        {fileObj.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(
                                                            fileObj.size
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error Messages */}
                            {errors.files && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <p className="text-sm text-red-600">
                                        {errors.files}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route("owner.media.index")}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    {t("cancel")}
                                </Link>
                                <button
                                    type="submit"
                                    disabled={
                                        processing || data.files.length === 0
                                    }
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors duration-200"
                                >
                                    {processing
                                        ? t("processing")
                                        : `${t("upload")} ${
                                              data.files.length
                                          } ${t("image_plural", {
                                              count: data.files.length,
                                          })}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}

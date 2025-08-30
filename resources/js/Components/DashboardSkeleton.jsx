export default function DashboardSkeleton() {
    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                    <div className="p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white overflow-hidden shadow-sm sm:rounded-lg"
                        >
                            <div className="p-5 animate-pulse">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Skeleton */}
                <div className="bg-white shadow-sm sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="p-6 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

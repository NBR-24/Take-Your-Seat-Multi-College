import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ===== Base Skeleton Shimmer Block =====
const Shimmer = ({ className = '' }) => {
    const { isDark } = useTheme();
    return (
        <div
            className={`rounded-xl animate-pulse ${isDark ? 'bg-dark-400/60' : 'bg-gray-200/80'} ${className}`}
        />
    );
};

// ===== Booking Page Skeleton =====
export const BookingPageSkeleton = () => {
    const { isDark } = useTheme();
    const bg = isDark ? 'bg-dark-700' : 'bg-gray-50';
    const headerBg = isDark ? 'bg-dark-500 border-dark-200' : 'bg-white border-gray-200';
    const cardBg = isDark ? 'bg-dark-500/60 border border-white/5 rounded-2xl' : 'bg-white rounded-2xl shadow-lg border border-gray-200';

    return (
        <div className={`min-h-screen ${bg}`}>
            {/* Header Skeleton */}
            <div className={`${headerBg} border-b sticky top-0 z-40`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <Shimmer className="w-10 h-10 rounded-xl" />
                            <div>
                                <Shimmer className="w-40 h-5 mb-1.5" />
                                <Shimmer className="w-24 h-3" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shimmer className="w-16 h-8 rounded-full" />
                            <Shimmer className="w-20 h-9 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 sm:py-8">
                {/* Title Skeleton */}
                <div className="text-center mb-8">
                    <Shimmer className="w-72 h-10 mx-auto mb-3" />
                    <Shimmer className="w-80 h-5 mx-auto" />
                </div>

                {/* Route Selector Skeleton */}
                <div className="mb-6">
                    <Shimmer className="w-24 h-4 mb-3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2].map(i => (
                            <div key={i} className={`${cardBg} p-4`}>
                                <Shimmer className="w-36 h-5 mb-2" />
                                <Shimmer className="w-48 h-4 mb-1" />
                                <Shimmer className="w-32 h-3" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bogie Selector Skeleton */}
                <div className="mb-6">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {[1, 2, 3].map(i => (
                            <Shimmer key={i} className="w-28 h-20 rounded-xl flex-shrink-0" />
                        ))}
                    </div>
                </div>

                {/* Seat Map Skeleton */}
                <div className={`${cardBg} p-6 mb-6`}>
                    <Shimmer className="w-40 h-6 mb-6" />
                    <div className="grid grid-cols-8 gap-2 max-w-lg mx-auto">
                        {Array.from({ length: 32 }).map((_, i) => (
                            <Shimmer key={i} className="w-full aspect-square rounded-lg" />
                        ))}
                    </div>
                    <div className="flex justify-center gap-6 mt-6">
                        <Shimmer className="w-24 h-4" />
                        <Shimmer className="w-24 h-4" />
                        <Shimmer className="w-24 h-4" />
                    </div>
                </div>

                {/* How to Book Skeleton */}
                <div className={`${cardBg} p-6`}>
                    <Shimmer className="w-32 h-5 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <Shimmer key={i} className="w-full h-4 max-w-md" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== Setup Page Skeleton =====
export const SetupPageSkeleton = () => {
    const { isDark } = useTheme();
    const bg = isDark ? 'bg-dark-700' : 'bg-gray-50';
    const cardBg = isDark ? 'bg-dark-500/60 border border-white/5 rounded-2xl' : 'bg-white rounded-2xl shadow-xl border border-gray-200';

    return (
        <div className={`min-h-screen ${bg} py-12 px-4`}>
            {/* Theme toggle skeleton */}
            <div className="absolute top-4 right-4 z-50">
                <Shimmer className="w-16 h-8 rounded-full" />
            </div>

            <div className="container mx-auto max-w-3xl">
                {/* Title Skeleton */}
                <div className="text-center mb-8">
                    <Shimmer className="w-72 h-10 mx-auto mb-3" />
                    <Shimmer className="w-24 h-5 mx-auto" />
                </div>

                {/* Progress Bar Skeleton */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <Shimmer className="w-20 h-4" />
                        <Shimmer className="w-28 h-4" />
                        <Shimmer className="w-16 h-4" />
                    </div>
                    <Shimmer className="w-full h-2 rounded-full" />
                </div>

                {/* Form Card Skeleton */}
                <div className={`${cardBg} p-8`}>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i}>
                                <Shimmer className="w-36 h-4 mb-2" />
                                <Shimmer className="w-full h-12 rounded-xl" />
                            </div>
                        ))}
                    </div>

                    {/* Button Row Skeleton */}
                    <div className="flex gap-4 mt-8">
                        <Shimmer className="flex-1 h-12 rounded-xl" />
                        <Shimmer className="flex-1 h-12 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shimmer;

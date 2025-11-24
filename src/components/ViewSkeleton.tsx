import React from 'react';

interface ViewSkeletonProps {
    type: 'kanban' | 'calendar';
}

const ViewSkeleton: React.FC<ViewSkeletonProps> = ({ type }) => {
    if (type === 'kanban') {
        return (
            <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex gap-3 overflow-hidden">
                {/* Colonna 1 */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-16 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse"></div>
                        <div className="h-16 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse"></div>
                        <div className="h-16 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Colonna 2 */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-100 rounded animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-16 bg-gradient-to-r from-blue-200 to-blue-100 rounded animate-pulse"></div>
                        <div className="h-16 bg-gradient-to-r from-blue-200 to-blue-100 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Colonna 3 */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="h-8 bg-gradient-to-r from-green-200 to-green-100 rounded animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-16 bg-gradient-to-r from-green-200 to-green-100 rounded animate-pulse"></div>
                        <div className="h-16 bg-gradient-to-r from-green-200 to-green-100 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Calendar skeleton
    return (
        <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex flex-col gap-4">
            {/* Header con controlli */}
            <div className="space-y-2">
                <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-1/3 animate-pulse"></div>
                <div className="flex gap-2">
                    <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-16 animate-pulse"></div>
                </div>
            </div>

            {/* Griglia calendario */}
            <div className="flex-1 flex flex-col gap-2">
                {/* Righe */}
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-2 h-12">
                        {Array(7).fill(0).map((_, j) => (
                            <div
                                key={`${i}-${j}`}
                                className="flex-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse"
                            ></div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewSkeleton;

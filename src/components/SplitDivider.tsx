import React from 'react';
import { GripVertical } from 'lucide-react';

interface SplitDividerProps {
    viewMode?: 'both' | 'kanban' | 'calendar';
    isDragging: boolean;
    isSnapAnimating?: boolean;
    splitRatio: number;
    onMouseDown: (e: React.MouseEvent) => void;
}

const SplitDivider: React.FC<SplitDividerProps> = ({
    viewMode,
    isDragging,
    isSnapAnimating = false,
    splitRatio,
    onMouseDown
}) => {
    let dividerWidth = 'w-2';
    if (viewMode === 'both' && !isDragging) {
        dividerWidth = 'w-4';
    }
    if (isDragging) {
        dividerWidth = 'w-8';
    }
    return (
        <div
            className={`${dividerWidth} hover:w-8 flex items-center justify-center relative group transition-[width] duration-200`}
            onMouseDown={onMouseDown}
        >
            {isDragging ? (
                <div className="text-sm font-bold text-gray-700" style={{ transform: 'rotate(90deg)', whiteSpace: 'nowrap' }}>
                    {(splitRatio).toFixed(1)}%
                </div>
            ) : (
                <>
                    <div className="hidden group-hover:flex flex-col items-center">
                        <div
                            className={`w-3 h-7 bg-gray-400 rounded-full flex items-center justify-center cursor-pointer transition-colors ${isSnapAnimating ? 'divider-snap' : ''}`}
                            style={isSnapAnimating ? {
                                '--snap-distance': splitRatio < 50 ? '-100px' : '100px'
                            } as React.CSSProperties : {}}
                        >
                            <GripVertical className="w-3 h-3 text-white" />
                        </div>
                        <div 
                            className="text-xs text-gray-500 font-medium whitespace-nowrap mt-10"
                            style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
                        >
                            Drag to resize
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SplitDivider;

import React from 'react';
import { GripVertical } from 'lucide-react';

interface SplitDividerProps {
    isDragging: boolean;
    isSnapAnimating?: boolean;
    splitRatio: number;
    onMouseDown: (e: React.MouseEvent) => void;
}

const SplitDivider: React.FC<SplitDividerProps> = ({
    isDragging,
    isSnapAnimating = false,
    splitRatio,
    onMouseDown
}) => {
    return (
        <div
            className="w-8 flex items-center justify-center px-2 hover:bg-gray-100 relative group"
            onMouseDown={onMouseDown}
        >
            {isDragging ? (
                <div className="text-sm font-bold text-gray-700" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                    {(splitRatio).toFixed(1)}%
                </div>
            ) : (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                        className={`w-3 h-7 bg-gray-400 hover:bg-black rounded-full flex items-center justify-center cursor-col-resize transition-colors ${isSnapAnimating ? 'divider-snap' : ''}`}
                        style={isSnapAnimating ? {
                            '--snap-distance': splitRatio < 50 ? '-100px' : '100px'
                        } as React.CSSProperties : {}}
                    >
                        <GripVertical className="w-3 h-3 text-white" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplitDivider;

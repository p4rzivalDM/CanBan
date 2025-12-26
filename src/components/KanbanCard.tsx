import React from 'react';
import { X, GripVertical, Calendar, AlertCircle, Flame, AlertTriangle, CircleDot, ArrowDown, Minus } from 'lucide-react';
import { truncateText, priorityColors, availablePriorities } from '../utils';
import { format } from "date-fns";
import MDEditor from '@uiw/react-md-editor';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface KanbanCardProps {
    task: any;
    onViewTask: (task: any) => void;
    onDeleteTask: (taskId: string) => void;
    onDragStart: (task: any) => void;
    compact?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
    task,
    onViewTask,
    onDeleteTask,
    onDragStart,
    compact = false
}) => {
    // Local normalizeTags since KanbanView no longer passes it
    const normalizeTags = (tags: any) => {
        if (Array.isArray(tags)) return tags;
        if (typeof tags === 'string' && tags.length > 0) return tags.split(/\s+/).filter(Boolean);
        return [];
    };

    const priorityIcon = (p: string) => {
        switch (p) {
            case 'very_high':
                return <Flame className="w-3 h-3 text-red-600" />;
            case 'high':
                return <AlertTriangle className="w-3 h-3 text-orange-500" />;
            case 'low':
                return <ArrowDown className="w-3 h-3 text-green-500" />;
            case 'very_low':
                return <Minus className="w-3 h-3 text-gray-500" />;
            case 'medium':
                return <CircleDot className="w-3 h-3 text-yellow-500" />;
            case '':
            case undefined:
            case null:
                return null;
            default:
                return <CircleDot className="w-3 h-3 text-yellow-500" />;
        }
    };

    // Rimuovi le immagini dal markdown, sostituendole con link
    const removeImages = (text: string) => {
        return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[$1]($2)');
    };

    return (
        <div
            draggable
            onDragStart={() => onDragStart(task)}
            className={`bg-white rounded-lg ${compact ? 'p-2' : 'p-3'} shadow-sm hover:shadow-md transition-shadow cursor-pointer ${priorityColors(task.priority)}`}
            onClick={() => onViewTask(task)}
        >
            <div className={`flex items-center justify-between ${compact ? 'mb-1' : 'mb-2'} ${compact ? '-mt-0.5' : '-mt-1'}`}>
                <div className="flex items-center gap-2 flex-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <GripVertical className="text-gray-400 mt-1 shrink-0 cursor-move w-4 h-4" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>Drag to reorder</TooltipContent>
                    </Tooltip>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm mt-1 font-semibold text-gray-900 wrap-break-word w-7/8">{truncateText(task.title, compact ? 35 : 45)}</p>
                    </div>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>
                            <X
                                className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTask(task.id);
                                }}
                            />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>Delete task</TooltipContent>
                </Tooltip>
            </div>
            {(!compact && task.description) && (
                <div className="mb-2 w-full overflow-hidden" data-color-mode="light">
                    <div className="max-h-90 overflow-y-auto pointer-events-auto">
                        <MDEditor.Markdown 
                            source={removeImages(task.description)}
                            style={{ 
                                fontSize: '0.75rem',
                                backgroundColor: 'transparent',
                                color: '#4b5563',
                                padding: '0.5rem',
                                pointerEvents: 'none'
                            }}
                        />
                    </div>
                </div>
            )}
            {compact ? (
                <div className="flex items-center gap-2 mb-1">
                    {task.priority && priorityIcon(task.priority)}
                    {task.scheduled && (
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(task.scheduled), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                    )}
                    {task.deadline && (
                        <div className="text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span className="text-red-600">{format(new Date(task.deadline), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {task.priority && (
                        <div className="flex items-center gap-1 mb-2">
                            {priorityIcon(task.priority)}
                            <span className="text-xs text-gray-600 capitalize">{availablePriorities(task.priority)}</span>
                        </div>
                    )}
                    {task.scheduled && (
                        <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(task.scheduled), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                    )}
                    {task.deadline && (
                        <div className="text-xs font-medium mb-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span className="text-red-600">{format(new Date(task.deadline), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                    )}
                </>
            )}

            {normalizeTags(task.tags).length > 0 && (
                <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1'}`}>
                    {normalizeTags(task.tags).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KanbanCard;

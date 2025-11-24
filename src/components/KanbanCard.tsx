import React from 'react';
import { X, GripVertical, Calendar, AlertCircle, Flame, AlertTriangle, CircleDot, ArrowDown, Minus } from 'lucide-react';
import { truncateText, priorityColors, availablePriorities } from '../utils';
import { format } from "date-fns";

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
            default:
                return <CircleDot className="w-3 h-3 text-yellow-500" />;
        }
    };

    const renderMarkdownPreview = (text: string) => {
        if (!text) return '';

        let html = text;

        // Code blocks with language
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre class="bg-gray-900 text-gray-100 p-2 rounded text-xs my-1 overflow-x-auto"><code class="font-mono">${code.trim()}</code></pre>`;
        });

        return html
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 rounded text-xs">$1</code>')
            .replace(/\n/g, '<br />');
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
                    <GripVertical className="text-gray-400 mt-1 shrink-0 cursor-move w-4 h-4" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm mt-1 font-semibold text-gray-900 wrap-break-word w-7/8">{truncateText(task.title, compact ? 35 : 45)}</p>
                    </div>
                </div>
                <X
                    className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                    }}
                />
            </div>
            {(!compact && task.description) && (
                <div className="mb-2 w-full overflow-hidden">
                    <div className="w-full overflow-y-auto">
                        <div
                            className="text-xs text-gray-600 px-2 wrap-break-word max-h-90"
                            dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(task.description) }}
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

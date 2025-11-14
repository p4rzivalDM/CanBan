import React from 'react';
import { X, GripVertical } from 'lucide-react';
import { truncateText, priorityColors, availablePriorities } from '../utils';

interface KanbanCardProps {
    task: any;
    onViewTask: (task: any) => void;
    onDeleteTask: (taskId: string) => void;
    onDragStart: (task: any) => void;
    normalizeTags: (tags: any) => string[];
}

const KanbanCard: React.FC<KanbanCardProps> = ({
    task,
    onViewTask,
    onDeleteTask,
    onDragStart,
    normalizeTags
}) => {
    return (
        <div
            draggable
            onDragStart={() => onDragStart(task)}
            className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${priorityColors(task.priority)}`}
            onClick={() => onViewTask(task)}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                    <GripVertical className="w-4 h-4 text-gray-400 mt-1 shrink-0 cursor-move" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{truncateText(task.title, 50)}</p>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                    title="Delete task"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {task.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
            )}

            <div className="mb-2">
                <span className="text-xs font-medium text-gray-700 capitalize">Priority: </span>
                <span className="text-xs text-gray-600 capitalize">{availablePriorities(task.priority)}</span>
            </div>

            {task.date && (
                <div className="mb-2 text-xs text-gray-600">
                    <span>Scheduled: {new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {task.time && `${task.time}`}</span>
                </div>
            )}

            {task.deadline && (
                <div className="mb-2 text-xs font-medium">
                    <span className="text-red-600">Deadline: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {task.deadline_time && `${task.deadline_time}`}</span>
                </div>
            )}

            {normalizeTags(task.tags).length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {normalizeTags(task.tags).map((tag, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KanbanCard;

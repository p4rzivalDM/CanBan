import React from 'react';
import { Plus, X, MoreVertical, GripVertical, ChevronLeftSquare, ChevronRightSquare, Check } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { availableColors } from '../utils';

interface KanbanViewProps {
    columnsState: any[];
    tasks: any[];
    onViewTask: (task: any) => void;
    onDeleteTask: (taskId: string) => void;
    onDragStart: (task: any) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (columnId: string, e: React.DragEvent) => void;
    getSortedTasks: (columnId: string) => any[];
    newTaskColumn: string | null;
    onAddTaskClick: (columnId: string) => void;
    onCancelNewTask: () => void;
    newTaskTitle: string;
    onNewTaskTitleChange: (title: string) => void;
    onContinueNewTask: (column: any) => void;
    editingColumn: string | null;
    onEditColumnClick: (columnId: string) => void;
    openColumnMenu: string | null;
    onToggleColumnMenu: (columnId: string) => void;
    onUpdateColumn: (columnId: string, updates: any) => void;
    onToggleColumnSort: (columnId: string) => void;
    columnSortBy: any;
    onAddColumnAtPosition: (columnId: string, position: string) => void;
    onDeleteColumn: (columnId: string) => void;
    normalizeTags: (tags: any) => string[];
}

const KanbanView: React.FC<KanbanViewProps> = ({
    columnsState,
    tasks,
    onViewTask,
    onDeleteTask,
    onDragStart,
    onDragOver,
    onDrop,
    getSortedTasks,
    newTaskColumn,
    onAddTaskClick,
    onCancelNewTask,
    newTaskTitle,
    onNewTaskTitleChange,
    onContinueNewTask,
    editingColumn,
    onEditColumnClick,
    openColumnMenu,
    onToggleColumnMenu,
    onUpdateColumn,
    onToggleColumnSort,
    columnSortBy,
    onAddColumnAtPosition,
    onDeleteColumn,
    normalizeTags
}) => {
    return (
        <div className="flex flex-wrap gap-4 h-full overflow-auto pb-4">
            {columnsState.map(column => (
                <div
                    key={column.id}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(column.id, e)}
                    className={`flex-1 min-w-[280px] ${column.color} rounded-lg p-4 relative`}
                >
                    <div
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer?.setData('columnId', column.id);
                        }}
                        className="cursor-move mb-4"
                    >
                        <div className="flex items-center justify-between">
                            {editingColumn === column.id ? (
                                <input
                                    type="text"
                                    defaultValue={column.title}
                                    className="font-bold text-gray-800 text-lg bg-white px-2 py-1 rounded border-2 border-blue-500 flex-1"
                                    autoFocus
                                    onBlur={(e) => onUpdateColumn(column.id, { title: e.target.value })}
                                    onKeyDown={(e: any) => {
                                        if (e.key === 'Enter') onUpdateColumn(column.id, { title: e.target.value });
                                        if (e.key === 'Escape') onEditColumnClick('');
                                    }}
                                />
                            ) : (
                                <div className="flex items-center gap-2 flex-1">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                    <h3
                                        className="font-bold text-gray-800 text-lg cursor-pointer hover:text-blue-600"
                                        onClick={() => onEditColumnClick(column.id)}
                                    >
                                        {column.title}
                                    </h3>
                                    {column.isDone && (
                                        <Check className="w-5 h-5 text-green-600" />
                                    )}
                                </div>
                            )}
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onAddTaskClick(column.id)}
                                    className="p-1 hover:bg-white/50 rounded transition-colors"
                                    title="Add task"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => onToggleColumnMenu(column.id)}
                                        className="p-1 hover:bg-white/50 rounded transition-colors"
                                        title="Column menu"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {openColumnMenu === column.id && (
                                        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[200px]">
                                            <button
                                                onClick={() => {
                                                    onToggleColumnSort(column.id);
                                                    onToggleColumnMenu('');
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <span className={columnSortBy[column.id] === 'priority' ? 'text-blue-600 font-medium' : ''}>
                                                    <span className="flex gap-2">{columnSortBy[column.id] === 'priority' ? <Check className="w-4 h-4" /> : ''}Sort by priority</span>
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onUpdateColumn(column.id, { isDone: !column.isDone });
                                                    onToggleColumnMenu('');
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <span className={column.isDone ? 'text-blue-600 font-medium' : ''}>
                                                    <span className="flex gap-2">{column.isDone ? <Check className="w-4 h-4" />  : ''}Mark card as completed</span>
                                                </span>
                                            </button>
                                            <div className="px-4 py-2">
                                                <div className="text-xs text-gray-600 mb-2">Column color:</div>
                                                <div className="grid grid-cols-5 gap-1">
                                                    {availableColors.map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => {
                                                                onUpdateColumn(column.id, { color });
                                                                onToggleColumnMenu('');
                                                            }}
                                                            className={`w-6 h-6 rounded ${color} border-2 ${column.color === color ? 'border-blue-600' : 'border-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-200 my-1"></div>
                                            <button
                                                onClick={() => onAddColumnAtPosition(column.id, 'left')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <ChevronLeftSquare className="w-4 h-4" />
                                                Add on left
                                            </button>
                                            <button
                                                onClick={() => onAddColumnAtPosition(column.id, 'right')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <ChevronRightSquare className="w-4 h-4" />
                                                Add on right
                                            </button>
                                            {columnsState.length > 1 && (
                                                <>
                                                    <div className="border-t border-gray-200 my-1"></div>
                                                    <button
                                                        onClick={() => {
                                                            onDeleteColumn(column.id);
                                                            onToggleColumnMenu('');
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Delete column
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {newTaskColumn === column.id && (
                        <div className="bg-white rounded-lg p-3 mb-3 shadow-sm">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                placeholder="Task title..."
                                className="w-full p-2 border rounded mb-2 text-sm"
                                value={newTaskTitle}
                                onChange={(e) => onNewTaskTitleChange(e.target.value)}
                                autoFocus
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onContinueNewTask(column)}
                                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Continue
                                </button>
                                <button
                                    onClick={onCancelNewTask}
                                    className="px-3 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {getSortedTasks(column.id).map((task) => (
                            <div key={task.id}>
                                <KanbanCard
                                    task={task}
                                    onViewTask={onViewTask}
                                    onDeleteTask={onDeleteTask}
                                    onDragStart={onDragStart}
                                    normalizeTags={normalizeTags}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanView;

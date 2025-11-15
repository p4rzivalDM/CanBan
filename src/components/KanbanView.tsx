import React, { useState, useEffect } from 'react';
import { Plus, X, MoreVertical, GripVertical, ChevronLeftSquare, ChevronRightSquare, Check } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { availableColors } from '../utils';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface KanbanViewProps {
    columnsState: any[];
    tasks: any[];
    onViewTask: (task: any) => void;
    onDeleteTask: (taskId: string) => void;
    onUpdateColumn: (columnId: string, updates: any) => void;
    onAddColumnAtPosition: (columnId: string, position: string) => void;
    onDeleteColumn: (columnId: string) => void;
    onUpdateTask?: (taskId: string, updates: any) => void;
    onReorderColumns?: (columns: any[]) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({
    columnsState,
    tasks,
    onViewTask,
    onDeleteTask,
    onUpdateColumn,
    onAddColumnAtPosition,
    onDeleteColumn,
    onUpdateTask,
    onReorderColumns
}) => {
    const [draggedTask, setDraggedTask] = useState(null);
    const [newTaskColumn, setNewTaskColumn] = useState(null);
    const [newTaskForm, setNewTaskForm] = useState({ title: '' });
    const [editingColumn, setEditingColumn] = useState(null);
    const [openOptionsMenu, setOpenOptionsMenu] = useState(null);
    const [draggedColumn, setDraggedColumn] = useState(null);
    const [columnSortBy, setColumnSortBy] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('canban_column_sort');
            return saved ? JSON.parse(saved) : {};
        }
        return {};
    });
    
    const [compactColumns, setCompactColumns] = useState<Record<string, boolean>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('canban_compact_columns');
            return saved ? JSON.parse(saved) : {};
        }
        return {};
    });

    // Salvataggio automatico delle preferenze colonne
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('canban_column_sort', JSON.stringify(columnSortBy));
        }
    }, [columnSortBy]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('canban_compact_columns', JSON.stringify(compactColumns));
        }
    }, [compactColumns]);

    const handleDragStart = (task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (columnId) => {
        if (draggedTask && draggedTask.column !== columnId) {
            const tasksInColumn = tasks.filter(t => t.column === columnId);
            const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : -1;
            
            // Update task through parent callback if available, otherwise just view it
            if (onUpdateTask) {
                onUpdateTask(draggedTask.id, { column: columnId, order: maxOrder + 1 });
            }
            setDraggedTask(null);
        }
    };

    const getSortedTasks = (columnId) => {
        const columnTasks = tasks.filter(t => t.column === columnId);
        const sortBy = columnSortBy[columnId];

        if (sortBy === 'priority') {
            const priorityOrder = { very_high: 0, high: 1, medium: 2, low: 3, very_low: 4 };
            return [...columnTasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }

        return [...columnTasks].sort((a, b) => a.order - b.order);
    };

    const toggleColumnSort = (columnId) => {
        setColumnSortBy({
            ...columnSortBy,
            [columnId]: columnSortBy[columnId] === 'priority' ? null : 'priority'
        });
    };

    const toggleCompactView = (columnId: string) => {
        setCompactColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }));
    };

    const handleColumnDragStart = (column) => {
        setDraggedColumn(column);
    };

    const handleColumnDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleColumnDrop = (targetColumn) => {
        if (!draggedColumn || draggedColumn.id === targetColumn.id) {
            setDraggedColumn(null);
            return;
        }

        const newColumns = [...columnsState];
        const draggedIndex = newColumns.findIndex(c => c.id === draggedColumn.id);
        const targetIndex = newColumns.findIndex(c => c.id === targetColumn.id);

        newColumns.splice(draggedIndex, 1);
        newColumns.splice(targetIndex, 0, draggedColumn);

        if (onReorderColumns) {
            onReorderColumns(newColumns);
        }
        
        setDraggedColumn(null);
    };

    const handleContinueNewTask = (column) => {
        if (newTaskForm.title.trim()) {
            const newTask = {
                id: Date.now().toString(),
                title: newTaskForm.title,
                column: column.id,
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                deadline: '',
                deadline_time: '',
                priority: 'medium',
                tags: '',
                description: '',
                order: 0
            };
            onViewTask(newTask);
            setNewTaskColumn(null);
            setNewTaskForm({ title: '' });
        }
    };
    return (
        <div className="flex flex-wrap gap-4 h-full">
            {columnsState.map(column => (
                <div
                    key={column.id}
                    onDragOver={(e) => {
                        handleDragOver(e);
                        handleColumnDragOver(e);
                    }}
                    onDrop={(e) => {
                        handleDrop(column.id);
                        handleColumnDrop(column);
                    }}
                    className={`flex-1 min-w-[280px] ${column.color} rounded-lg p-4 relative flex flex-col max-h-full`}
                >
                    <div
                        draggable
                        onDragStart={(e) => {
                            handleColumnDragStart(column);
                        }}
                        className="cursor-move mb-4 shrink-0"
                    >
                        <div className="flex items-center justify-between">
                            {editingColumn === column.id ? (
                                <Input
                                    type="text"
                                    defaultValue={column.title}
                                    autoFocus
                                    onBlur={(e) => {
                                        onUpdateColumn(column.id, { title: e.target.value });
                                        setEditingColumn(null);
                                    }}
                                    onKeyDown={(e: any) => {
                                        if (e.key === 'Enter') {
                                            onUpdateColumn(column.id, { title: e.target.value });
                                            setEditingColumn(null);
                                        }
                                        if (e.key === 'Escape') setEditingColumn(null);
                                    }}
                                />
                            ) : (
                                <div className="flex items-center gap-2 flex-1">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                    <h3
                                        className="font-bold text-gray-800 text-lg cursor-pointer hover:text-blue-600"
                                        onClick={() => setEditingColumn(column.id)}
                                    >
                                        {column.title}
                                    </h3>
                                    {column.isDone && (
                                        <Check className="w-5 h-5 text-green-600" />
                                    )}
                                </div>
                            )}
                            <div className="flex gap-1">
                                <Button
                                    onClick={() => setNewTaskColumn(column.id)}
                                    title="Add task"
                                    size="icon"
                                    variant="ghost"
                                >
                                    <Plus />
                                </Button>
                                <div className="relative">
                                    <Button
                                        onClick={() => {
                                            if (openOptionsMenu === column.id) {
                                                setOpenOptionsMenu(null);
                                            } else {
                                                setOpenOptionsMenu(column.id);
                                            }
                                        }}
                                        size="icon"
                                        variant="ghost"
                                        title="Options"
                                    >
                                        <MoreVertical />
                                    </Button>
                                    {openOptionsMenu === column.id && (
                                        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[200px]">
                                            <Button
                                                onClick={() => {
                                                    toggleCompactView(column.id);
                                                    setOpenOptionsMenu(null);
                                                }}
                                                variant="outline"
                                                className="w-full items-center justify-start border-0 rounded-none"
                                            >
                                                <span className={compactColumns?.[column.id] ? 'text-blue-600 font-medium' : ''}>
                                                    <span className="flex gap-2">{compactColumns?.[column.id] ? <Check className="w-4 h-4" /> : ''}Compact view</span>
                                                </span>
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    toggleColumnSort(column.id);
                                                    setOpenOptionsMenu(null);
                                                }}
                                                variant="outline"
                                                className="w-full items-center justify-start border-0 rounded-none"
                                            >
                                                <span className={columnSortBy[column.id] === 'priority' ? 'text-blue-600 font-medium' : ''}>
                                                    <span className="flex gap-2">{columnSortBy[column.id] === 'priority' ? <Check className="w-4 h-4" /> : ''}Sort by priority</span>
                                                </span>
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    onUpdateColumn(column.id, { isDone: !column.isDone });
                                                    setOpenOptionsMenu(null);
                                                }}
                                                variant="outline"
                                                className="w-full items-center justify-start border-0 rounded-none"
                                            >
                                                <span className={column.isDone ? 'text-blue-600 font-medium' : ''}>
                                                    <span className="flex gap-2">{column.isDone ? <Check className="w-4 h-4" /> : ''}Cards as completed</span>
                                                </span>
                                            </Button>
                                            <div className="px-4 py-2">
                                                <div className="text-xs text-gray-600 mb-2">Column color:</div>
                                                <div className="grid grid-cols-5 gap-1">
                                                    {availableColors.map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => {
                                                                onUpdateColumn(column.id, { color });
                                                                setOpenOptionsMenu(null);
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
                                                            setOpenOptionsMenu(null);
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
                            <Input
                                type="text"
                                value={newTaskForm.title}
                                placeholder="Task title..."
                                onChange={(e) => setNewTaskForm({ title: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setNewTaskColumn(null);
                                        setNewTaskForm({ title: '' });
                                    }
                                    if (e.key === 'Enter' && e.shiftKey) handleContinueNewTask(column);
                                }}
                                autoFocus
                                required
                            />
                            <div className="flex gap-2 mt-2 justify-between">
                                <Button
                                    onClick={() => {
                                        setNewTaskColumn(null);
                                        setNewTaskForm({ title: '' });
                                    }}
                                    variant="destructive"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        setNewTaskColumn(null);
                                        setNewTaskForm({ title: '' });
                                    }}
                                    variant="outline"
                                >
                                    <Plus />
                                </Button>
                                <Button
                                    onClick={() => handleContinueNewTask(column)}
                                    variant="default"
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
                        {getSortedTasks(column.id).map((task) => (
                            <div key={task.id}>
                                <KanbanCard
                                    task={task}
                                    onViewTask={onViewTask}
                                    onDeleteTask={onDeleteTask}
                                    onDragStart={handleDragStart}
                                    compact={!!compactColumns?.[column.id]}
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

import React, { useState, useEffect } from 'react';
import { Plus, X, MoreVertical, GripVertical, ChevronLeftSquare, ChevronRightSquare, Check } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { availableColors } from '../utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

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

    // Drop onto a specific task to position before/after it (when not sorting by priority)
    const handleDropOnTask = (e: React.DragEvent<HTMLDivElement>, targetTask: any) => {
        if (!draggedTask || !onUpdateTask) return;

        const targetColumn = targetTask.column;
        // If target column is priority-sorted, skip reordering by position
        if (columnSortBy[targetColumn] === 'priority') {
            // If moving across columns, still move to target column appended
            if (draggedTask.column !== targetColumn) {
                const tasksInColumn = tasks.filter(t => t.column === targetColumn);
                const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : -1;
                onUpdateTask(draggedTask.id, { column: targetColumn, order: maxOrder + 1 });
            }
            setDraggedTask(null);
            return;
        }

        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const dropY = e.clientY;
        const insertAfter = dropY > rect.top + rect.height / 2;

        // Build the visible ordered list for the target column based on order
        const columnTasks = tasks
            .filter(t => t.column === targetColumn)
            .sort((a, b) => a.order - b.order);

        // Remove dragged task if it is currently in this list (same column case)
        const filtered = columnTasks.filter(t => t.id !== draggedTask.id);
        const targetIndex = filtered.findIndex(t => t.id === targetTask.id);

        // Determine neighbors around insertion point
        const prev = insertAfter
            ? (targetIndex >= 0 ? filtered[targetIndex] : null)
            : (targetIndex > 0 ? filtered[targetIndex - 1] : null);
        const next = insertAfter
            ? (targetIndex >= 0 && targetIndex + 1 < filtered.length ? filtered[targetIndex + 1] : null)
            : (targetIndex >= 0 ? filtered[targetIndex] : null);

        let newOrder: number;
        if (prev && next) newOrder = (prev.order + next.order) / 2;
        else if (!prev && next) newOrder = next.order - 1; // insert at head
        else if (prev && !next) newOrder = prev.order + 1; // insert at tail
        else newOrder = 0; // empty column fallback

        // Apply update: move across columns if needed and set computed order
        onUpdateTask(draggedTask.id, {
            column: targetColumn,
            order: newOrder
        });

        setDraggedTask(null);
    };

    const getSortedTasks = (columnId) => {
        const column = columnsState.find(c => c.id === columnId);
        let columnTasks = tasks.filter(t => t.column === columnId && (!column?.hideArchived || !t.archived));
        
        const sortBy = columnSortBy[columnId];

        if (sortBy === 'priority') {
            const priorityOrder = { very_high: 0, high: 1, medium: 2, low: 3, very_low: 4, '': 5 };
            return [...columnTasks].sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5));
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

    const handleQuickAddTask = (column) => {
        if (newTaskForm.title.trim()) {
            const tasksInColumn = tasks.filter(t => t.column === column.id);
            const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : -1;
            
            const newTask = {
                id: Date.now().toString(),
                title: newTaskForm.title,
                priority: '',
                column: column.id,
                order: maxOrder + 1,
                scheduled: null,
                archived: false
            };
            
            // Add task directly through update callback
            if (onUpdateTask) {
                onUpdateTask(newTask.id, newTask);
            }
            
            setNewTaskColumn(null);
            setNewTaskForm({ title: '' });
        }
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
                priority: '',
                tags: '',
                description: '',
                order: 0,
                archived: false
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
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <GripVertical className="w-5 h-5 text-gray-400" />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>Drag to reorder column</TooltipContent>
                                    </Tooltip>
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
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => setNewTaskColumn(column.id)}
                                            size="icon"
                                            variant="ghost"
                                        >
                                            <Plus />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Quick add task</TooltipContent>
                                </Tooltip>
                                <DropdownMenu>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <MoreVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>Column options</TooltipContent>
                                    </Tooltip>
                                    <DropdownMenuContent align="end" className="w-[200px]">
                                        <DropdownMenuItem onClick={() => toggleCompactView(column.id)}>
                                            {compactColumns?.[column.id] && <Check className="w-4 h-4" />}
                                            <span className={compactColumns?.[column.id] ? 'text-blue-600 font-medium' : ''}>
                                                Compact view
                                            </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toggleColumnSort(column.id)}>
                                            {columnSortBy[column.id] === 'priority' && <Check className="w-4 h-4" />}
                                            <span className={columnSortBy[column.id] === 'priority' ? 'text-blue-600 font-medium' : ''}>
                                                Sort by priority
                                            </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onUpdateColumn(column.id, { isDone: !column.isDone })}>
                                            {column.isDone && <Check className="w-4 h-4" />}
                                            <span className={column.isDone ? 'text-blue-600 font-medium' : ''}>
                                                Cards as completed
                                            </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onUpdateColumn(column.id, { hideArchived: !column.hideArchived })}>
                                            {column.hideArchived && <Check className="w-4 h-4" />}
                                            <span className={column.hideArchived ? 'text-blue-600 font-medium' : ''}>
                                                Hide archived cards
                                            </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <div className="px-2 py-2">
                                            <div className="text-xs text-gray-600 mb-2">Column color:</div>
                                            <div className="grid grid-cols-5 gap-1">
                                                {availableColors.map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => onUpdateColumn(column.id, { color })}
                                                        className={`w-6 h-6 rounded ${color} border-2 ${column.color === color ? 'border-blue-600' : 'border-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onAddColumnAtPosition(column.id, 'left')}>
                                            <ChevronLeftSquare />
                                            Add on left
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onAddColumnAtPosition(column.id, 'right')}>
                                            <ChevronRightSquare />
                                            Add on right
                                        </DropdownMenuItem>
                                        {columnsState.length > 1 && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => onDeleteColumn(column.id)}
                                                    className="text-red-600"
                                                >
                                                    <X />
                                                    Delete column
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => handleQuickAddTask(column)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Plus />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Add task without opening modal</TooltipContent>
                                </Tooltip>
                                <Button
                                    onClick={() => handleContinueNewTask(column)}
                                    variant="default"
                                    size="sm"
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
                        {getSortedTasks(column.id).map((task) => (
                            <div
                                key={task.id}
                                onDragOver={(e) => {
                                    // allow dropping on single card to define position
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDropOnTask(e, task);
                                }}
                            >
                                <KanbanCard
                                    task={task}
                                    onViewTask={onViewTask}
                                    onDeleteTask={onDeleteTask}
                                    onSave={(updatedTask) => onUpdateTask?.(updatedTask.id, updatedTask)}
                                    onDragStart={handleDragStart}
                                    compact={!!compactColumns?.[column.id]}
                                />
                            </div>
                        ))}
                        {/* Bottom drop zone to append at end when not priority-sorted */}
                        <div
                            className="h-6"
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!draggedTask || !onUpdateTask) return;
                                const colId = column.id;
                                if (columnSortBy[colId] === 'priority') {
                                    // append only if moving across columns
                                    if (draggedTask.column !== colId) {
                                        const tasksInColumn = tasks.filter(t => t.column === colId);
                                        const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : -1;
                                        onUpdateTask(draggedTask.id, { column: colId, order: maxOrder + 1 });
                                    }
                                } else {
                                    const tasksInColumn = tasks.filter(t => t.column === colId);
                                    const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : -1;
                                    onUpdateTask(draggedTask.id, { column: colId, order: maxOrder + 1 });
                                }
                                setDraggedTask(null);
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanView;

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, X, ChevronLeft, ChevronRight, GripVertical, Columns2, MoreVertical, ChevronLeftSquare, ChevronRightSquare, Eye, Check } from 'lucide-react';
import HeaderControls from './HeaderControls';
import TaskModal from './TaskModal';
import { truncateText, getDaysInMonth, getWeekDays, priorityColors, availableColors } from '../utils';

const DevTaskManager = () => {
    // Helper to normalize tags (can be string or array)
    const normalizeTags = (tags) => {
        if (Array.isArray(tags)) return tags;
        if (typeof tags === 'string' && tags.length > 0) return tags.split(/\s+/).filter(Boolean);
        return [];
    };

    const defaultTasks = [
        { id: '1', title: 'Implementare autenticazione', column: 'todo', date: '2025-11-13', time: '09:00', deadline: '2025-11-20', deadline_time: '17:00', priority: 'high', tags: ['backend', 'security'], description: 'Implementare sistema di autenticazione JWT con refresh token', order: 0 },
        { id: '2', title: 'Refactoring componenti UI', column: 'inProgress', date: '2025-11-12', time: '14:30', deadline: '2025-11-18', deadline_time: '18:00', priority: 'medium', tags: ['frontend', 'refactor'], description: 'Refactoring dei componenti React per migliorare la manutenibilità', order: 0 },
        { id: '3', title: 'Code review PR #234', column: 'inProgress', date: '2025-11-12', time: '10:00', deadline: '2025-11-13', deadline_time: '16:00', priority: 'high', tags: ['review'], description: 'Revisione pull request per nuova feature', order: 1 },
        { id: '4', title: 'Fix bug login iOS', column: 'done', date: '2025-11-10', time: '11:00', deadline: '2025-11-12', deadline_time: '15:00', priority: 'high', tags: ['bug', 'mobile'], description: 'Risolto problema con il login su dispositivi iOS', order: 0 },
        { id: '5', title: 'Ottimizzare query database', column: 'todo', date: '2025-11-15', time: '15:00', deadline: '2025-11-25', deadline_time: '17:00', priority: 'medium', tags: ['backend', 'performance'], description: 'Analisi e ottimizzazione delle query più lente', order: 1 },
    ];

    const loadFromStorage = () => {
        if (typeof window !== 'undefined') {
            const savedTasks = localStorage.getItem('canban_tasks');
            return savedTasks ? JSON.parse(savedTasks) : defaultTasks;
        }
        return defaultTasks;
    };

    const [tasks, setTasks] = useState(loadFromStorage());

    const [viewMode, setViewMode] = useState('both');
    const [calendarView, setCalendarView] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 12));
    const [draggedTask, setDraggedTask] = useState(null);
    const [draggedColumn, setDraggedColumn] = useState(null);
    const [newTaskColumn, setNewTaskColumn] = useState(null);
    const [newTaskForm, setNewTaskForm] = useState({ title: '', date: '', time: '', deadline: '', deadline_time: '', priority: 'medium', tags: '', description: '' });
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [editingColumn, setEditingColumn] = useState(null);
    const [openColumnMenu, setOpenColumnMenu] = useState(null);
    const [columnSortBy, setColumnSortBy] = useState({});
    const [splitRatio, setSplitRatio] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const [columnsState, setColumnsState] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedColumns = localStorage.getItem('canban_columns');
            if (savedColumns) {
                return JSON.parse(savedColumns);
            }
        }
        return [
            { id: 'todo', title: 'To Do', color: 'bg-slate-100', isDone: false },
            { id: 'inProgress', title: 'In Progress', color: 'bg-blue-50', isDone: false },
            { id: 'done', title: 'Done', color: 'bg-green-50', isDone: true }
        ];
    });

    // History (undo/redo) per tasks+columns
    const historyRef = useRef({ snapshots: [], index: -1 });
    const ignoreHistoryRef = useRef(false);
    const [historyState, setHistoryState] = useState({ index: -1, length: 0 });

    const pushSnapshot = (tasksSnapshot, columnsSnapshot) => {
        if (ignoreHistoryRef.current) return;
        const h = historyRef.current;
        // truncate future
        h.snapshots = h.snapshots.slice(0, h.index + 1);
        // deep copy
        const snap = { tasks: JSON.parse(JSON.stringify(tasksSnapshot)), columns: JSON.parse(JSON.stringify(columnsSnapshot)) };
        h.snapshots.push(snap);
        h.index = h.snapshots.length - 1;
        setHistoryState({ index: h.index, length: h.snapshots.length });
    };

    const restoreSnapshot = (idx) => {
        const h = historyRef.current;
        if (idx < 0 || idx >= h.snapshots.length) return;
        ignoreHistoryRef.current = true;
        const snap = h.snapshots[idx];
        setTasks(snap.tasks);
        setColumnsState(snap.columns);
        h.index = idx;
        setHistoryState({ index: h.index, length: h.snapshots.length });
        // small timeout to re-enable recording after state update
        setTimeout(() => { ignoreHistoryRef.current = false; }, 0);
    };

    const undo = () => {
        const h = historyRef.current;
        if (h.index > 0) {
            restoreSnapshot(h.index - 1);
        }
    };

    const redo = () => {
        const h = historyRef.current;
        if (h.index < h.snapshots.length - 1) {
            restoreSnapshot(h.index + 1);
        }
    };

    // helpers and constants imported from ../utils

    const handleDragStart = (task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (columnId) => {
        if (draggedTask) {
            const tasksInColumn = tasks.filter(t => t.column === columnId);
            const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : -1;

            const newTasks = tasks.map(t => t.id === draggedTask.id ? { ...t, column: columnId, order: maxOrder + 1 } : t);
            setTasks(newTasks);
            pushSnapshot(newTasks, columnsState);
            setDraggedTask(null);
        }
    };

    const handleColumnDragStart = (column, e) => {
        e.stopPropagation();
        setDraggedColumn(column);
    };

    const handleColumnDrop = (targetColumnId, e) => {
        e.stopPropagation();
        if (draggedColumn && draggedColumn.id !== targetColumnId) {
            const newColumns = [...columnsState];
            const draggedIndex = newColumns.findIndex(c => c.id === draggedColumn.id);
            const targetIndex = newColumns.findIndex(c => c.id === targetColumnId);

            newColumns.splice(draggedIndex, 1);
            newColumns.splice(targetIndex, 0, draggedColumn);

            setColumnsState(newColumns);
            pushSnapshot(tasks, newColumns);
            setDraggedColumn(null);
        }
    };

    const addTask = (column) => {
        if (newTaskForm.title.trim()) {
            const tasksInColumn = tasks.filter(t => t.column === column);
            const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : -1;

            const newTask = {
                id: Date.now().toString(),
                title: newTaskForm.title,
                column,
                date: newTaskForm.date || new Date().toISOString().split('T')[0],
                time: newTaskForm.time || '09:00',
                deadline: newTaskForm.deadline || '',
                deadline_time: newTaskForm.deadline_time || '',
                priority: newTaskForm.priority,
                tags: newTaskForm.tags.split(',').map(t => t.trim()).filter(t => t),
                description: newTaskForm.description || '',
                order: maxOrder + 1
            };
            const newTasks = [...tasks, newTask];
            setTasks(newTasks);
            pushSnapshot(newTasks, columnsState);
            setNewTaskForm({ title: '', date: '', time: '', deadline: '', deadline_time: '', priority: 'medium', tags: '', description: '' });
            setNewTaskColumn(null);
        }
    };

    const deleteTask = (taskId) => {
        const newTasks = tasks.filter(t => t.id !== taskId);
        setTasks(newTasks);
        pushSnapshot(newTasks, columnsState);
    };

    const updateTask = (taskId, updates) => {
        const newTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        setTasks(newTasks);
        pushSnapshot(newTasks, columnsState);
    };

    const updateColumn = (columnId, updates) => {
        const newCols = columnsState.map(c => c.id === columnId ? { ...c, ...updates } : c);
        setColumnsState(newCols);
        pushSnapshot(tasks, newCols);
        setEditingColumn(null);
    };

    const deleteColumn = (columnId) => {
        const newCols = columnsState.filter(c => c.id !== columnId);
        const newTasks = tasks.filter(t => t.column !== columnId);
        setColumnsState(newCols);
        setTasks(newTasks);
        pushSnapshot(newTasks, newCols);
    };

    const addColumnAtPosition = (afterColumnId, position) => {
        const newId = `col_${Date.now()}`;
        const newColumn = {
            id: newId,
            title: 'Nuova Colonna',
            color: 'bg-purple-50',
            isDone: false
        };

        const currentIndex = columnsState.findIndex(c => c.id === afterColumnId);
        const insertIndex = position === 'left' ? currentIndex : currentIndex + 1;

        const newColumns = [...columnsState];
        newColumns.splice(insertIndex, 0, newColumn);
        setColumnsState(newColumns);
        pushSnapshot(tasks, newColumns);
        setOpenColumnMenu(null);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const newRatio = ((e.clientX - rect.left) / rect.width) * 100;

        // lasciare un po' di spazio ai lati (25%)
        if (newRatio > 25 && newRatio < 75) {
            setSplitRatio(newRatio);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.userSelect = '';
    };

    // Salvataggio automatico dei tasks
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('canban_tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    // Salvataggio automatico delle colonne
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('canban_columns', JSON.stringify(columnsState));
        }
    }, [columnsState]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // registra snapshot iniziale una volta
    useEffect(() => {
        if (historyRef.current.index === -1) {
            pushSnapshot(tasks, columnsState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getSortedTasks = (columnId) => {
        const columnTasks = tasks.filter(t => t.column === columnId);
        const sortBy = columnSortBy[columnId];

        if (sortBy === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return [...columnTasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }

        return [...columnTasks].sort((a, b) => a.order - b.order);
    };

    // Funzioni di importazione e esportazione
    const exportData = () => {
        const dataToExport = {
            tasks,
            columns: columnsState,
            exportDate: new Date().toISOString()
        };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `canban_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const importData = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                
                if (data.tasks && Array.isArray(data.tasks) && data.columns && Array.isArray(data.columns)) {
                    setTasks(data.tasks);
                    setColumnsState(data.columns);
                    pushSnapshot(data.tasks, data.columns);
                    alert('Dati importati con successo!');
                } else {
                    alert('Formato file non valido. Assicurati di aver utilizzato un file esportato da CanBan.');
                }
            } catch (error) {
                alert('Errore durante l\'importazione del file. Assicurati che il file sia un JSON valido.');
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

    const toggleColumnSort = (columnId) => {
        setColumnSortBy({
            ...columnSortBy,
            [columnId]: columnSortBy[columnId] === 'priority' ? null : 'priority'
        });
    };

    // getWeekDays imported from utils (week starts Monday)

    const changeMonth = (delta) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const changeWeek = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (delta * 7));
        setCurrentDate(newDate);
    };

    const changeDay = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + delta);
        setCurrentDate(newDate);
    };

    const renderKanban = () => (
        <div className="flex flex-wrap gap-4 h-full overflow-auto pb-4">
            {columnsState.map(column => (
                <div
                    key={column.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                        if (draggedTask) {
                            handleDrop(column.id);
                        } else if (draggedColumn) {
                            handleColumnDrop(column.id, e);
                        }
                    }}
                    className={`flex-1 min-w-[280px] ${column.color} rounded-lg p-4 relative`}
                >
                    <div
                        draggable
                        onDragStart={(e) => handleColumnDragStart(column, e)}
                        className="cursor-move mb-4"
                    >
                        <div className="flex items-center justify-between">
                            {editingColumn === column.id ? (
                                <input
                                    type="text"
                                    defaultValue={column.title}
                                    className="font-bold text-gray-800 text-lg bg-white px-2 py-1 rounded border-2 border-blue-500 flex-1"
                                    autoFocus
                                    onBlur={(e) => updateColumn(column.id, { title: e.target.value })}
                                    onKeyDown={(e: any) => {
                                        if (e.key === 'Enter') updateColumn(column.id, { title: e.target.value });
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
                                <button
                                    onClick={() => setNewTaskColumn(column.id)}
                                    className="p-1 hover:bg-white/50 rounded transition-colors"
                                    title="Add task"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenColumnMenu(openColumnMenu === column.id ? null : column.id)}
                                        className="p-1 hover:bg-white/50 rounded transition-colors"
                                        title="Column menu"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {openColumnMenu === column.id && (
                                        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[200px]">
                                            <button
                                                onClick={() => {
                                                    toggleColumnSort(column.id);
                                                    setOpenColumnMenu(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <span className={columnSortBy[column.id] === 'priority' ? 'text-blue-600 font-medium' : ''}>
                                                    {columnSortBy[column.id] === 'priority' ? '✓ ' : ''}Sort by priority
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    updateColumn(column.id, { isDone: !column.isDone });
                                                    setOpenColumnMenu(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                <span className={column.isDone ? 'text-blue-600 font-medium' : ''}>
                                                    {column.isDone ? '✓ ' : ''}Completed column
                                                </span>
                                            </button>
                                            <div className="px-4 py-2">
                                                <div className="text-xs text-gray-600 mb-2">Column color:</div>
                                                <div className="grid grid-cols-5 gap-1">
                                                    {availableColors.map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => {
                                                                updateColumn(column.id, { color });
                                                                setOpenColumnMenu(null);
                                                            }}
                                                            className={`w-6 h-6 rounded ${color} border-2 ${column.color === color ? 'border-blue-600' : 'border-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-200 my-1"></div>
                                            <button
                                                onClick={() => addColumnAtPosition(column.id, 'left')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <ChevronLeftSquare className="w-4 h-4" />
                                                Add on left
                                            </button>
                                            <button
                                                onClick={() => addColumnAtPosition(column.id, 'right')}
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
                                                            deleteColumn(column.id);
                                                            setOpenColumnMenu(null);
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
                                value={newTaskForm.title}
                                onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                                autoFocus
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
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
                                            setViewingTask(newTask);
                                            setNewTaskColumn(null);
                                        }
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Continue
                                </button>
                                <button
                                    onClick={() => setNewTaskColumn(null)}
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
                                <div
                                    draggable
                                    onDragStart={() => handleDragStart(task)}
                                    className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${priorityColors[task.priority]}`}
                                    onClick={() => setViewingTask(task)}
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
                                                deleteTask(task.id);
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
                                        <span className="text-xs text-gray-600 capitalize">{task.priority}</span>
                                    </div>

                                    {task.deadline && (
                                        <div className="mb-2 text-xs font-medium">
                                            <span className="text-red-600">Deadline: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {task.deadline_time && `@ ${task.deadline_time}`}</span>
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
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderCalendar = () => {
        if (calendarView === 'day') {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
            const hours = Array.from({ length: 24 }, (_, i) => i);

            return (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
                        <button onClick={() => changeDay(-1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">
                                {currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => setCalendarView('month')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Month</button>
                                <button onClick={() => setCalendarView('week')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Week</button>
                                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Day</button>
                            </div>
                        </div>
                        <button onClick={() => changeDay(1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm">
                        {hours.map(hour => {
                            const hourStr = String(hour).padStart(2, '0');
                            const hourTasks = dayTasks.filter(t => t.time.startsWith(hourStr));

                            return (
                                <div key={hour} className="flex border-b">
                                    <div className="w-20 p-2 text-sm text-gray-600 font-medium border-r bg-gray-50">
                                        {hourStr}:00
                                    </div>
                                    <div className="flex-1 p-2 space-y-1">
                                        {hourTasks.map(task => {
                                            const column = columnsState.find(c => c.id === task.column);
                                            const isDone = column?.isDone;
                                            return (
                                                <div
                                                    key={task.id}
                                                    onClick={() => setViewingTask(task)}
                                                    className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 ${priorityColors[task.priority]} bg-white shadow-sm ${isDone ? 'opacity-40' : ''}`}
                                                >
                                                    <div className="font-medium">
                                                        <span className="text-xs mr-1">{task.time} -</span>
                                                        <span className="inline-block align-middle truncate max-w-[200px]">{truncateText(task.title, 60)}</span>
                                                    </div>
                                                    <div className="text-gray-500">{column?.title}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (calendarView === 'week') {
            const weekDays = getWeekDays(currentDate);

            return (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
                        <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">
                                Week - {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => setCalendarView('month')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Month</button>
                                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Week</button>
                                <button onClick={() => setCalendarView('day')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Day</button>
                            </div>
                        </div>
                        <button onClick={() => changeWeek(1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <div className="grid grid-cols-7 gap-3">
                            {weekDays.map(day => {
                                const dateStr = day.toISOString().split('T')[0];
                                const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
                                const isToday = dateStr === new Date().toISOString().split('T')[0];
                                const hours = Array.from({ length: 24 }, (_, i) => i);

                                return (
                                    <div key={dateStr} className={`border rounded-lg p-2 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                                        <div className={`text-sm font-semibold mb-2 text-center ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                                            {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="bg-white rounded overflow-auto max-h-[60vh]">
                                            {hours.map(hour => {
                                                const hourStr = String(hour).padStart(2, '0');
                                                const hourTasks = dayTasks.filter(t => t.time.startsWith(hourStr));

                                                return (
                                                    <div key={hour} className="flex border-t items-start p-1">
                                                        <div className="w-14 p-1 text-xs text-gray-500 font-medium bg-gray-50">{hourStr}:00</div>
                                                        <div className="flex-1 p-1 space-y-1">
                                                            {hourTasks.map(task => {
                                                                const column = columnsState.find(c => c.id === task.column);
                                                                const isDone = column?.isDone;
                                                                return (
                                                                    <div
                                                                        key={task.id}
                                                                        onClick={() => setViewingTask(task)}
                                                                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${priorityColors[task.priority]} bg-white shadow-sm ${isDone ? 'opacity-40' : ''}`}
                                                                    >
                                                                        <div className="font-medium text-xs">
                                                                            <span className="mr-1">{task.time} -</span>
                                                                            <span className="inline-block truncate max-w-40">{truncateText(task.title, 50)}</span>
                                                                        </div>
                                                                        <div className="text-gray-500 text-xs">{column?.title}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
        const days = [];
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-gray-50 rounded"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
            const isToday = dateStr === '2025-11-12';

            days.push(
                <div key={day} className={`min-h-[100px] border rounded-lg p-2 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {dayTasks.map(task => {
                            const column = columnsState.find(c => c.id === task.column);
                            const isDone = column?.isDone;
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => setViewingTask(task)}
                                    className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 ${priorityColors[task.priority]} bg-white shadow-sm ${isDone ? 'opacity-40' : ''}`}
                                >
                                    <div className="font-medium text-xs">{task.time}</div>
                                    <div className="font-medium truncate">{truncateText(task.title, 60)}</div>
                                    <div className="text-gray-500 text-xs">{column?.title}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h3 className="font-bold text-lg">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2 mt-2">
                            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Month</button>
                            <button onClick={() => setCalendarView('week')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Week</button>
                            <button onClick={() => setCalendarView('day')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Day</button>
                        </div>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-600">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2 flex-1 overflow-auto">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 flex flex-col">
            <HeaderControls
                viewMode={viewMode}
                setViewMode={setViewMode}
                exportData={exportData}
                importData={importData}
                undo={undo}
                redo={redo}
                historyState={historyState}
            />

        <div className="flex-1 overflow-hidden" ref={containerRef}>
                {viewMode === 'kanban' && (
                    <div className="h-full">{renderKanban()}</div>
                )}

                {viewMode === 'calendar' && (
                    <div className="h-full">{renderCalendar()}</div>
                )}

                {viewMode === 'both' && (
                    <div className="flex h-full relative">
                        <div className="overflow-auto" style={{ width: `${splitRatio}%` }}>
                            {renderKanban()}
                        </div>

                        <div
                            className="w-8 flex items-center justify-center px-2"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="w-4 h-10 bg-gray-400 hover:bg-blue-500 rounded-full flex items-center justify-center">
                                <GripVertical className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div className="overflow-auto" style={{ width: `${100 - splitRatio}%` }}>
                            {renderCalendar()}
                        </div>
                    </div>
                )}
            </div>

            <TaskModal
                viewingTask={viewingTask}
                setViewingTask={setViewingTask}
                onSave={(updated) => {
                    if (updated.id.includes('Date.now')) {
                        // Nuovo task creato dal Kanban
                        const newTasks = [...tasks, updated];
                        setTasks(newTasks);
                        pushSnapshot(newTasks, columnsState);
                    } else {
                        // Task esistente
                        const newTasks = tasks.map(t => t.id === updated.id ? { ...updated } : t);
                        setTasks(newTasks);
                        pushSnapshot(newTasks, columnsState);
                    }
                }}
                onDelete={(id) => {
                    deleteTask(id);
                }}
            />
        </div>
    );
};

export default DevTaskManager;
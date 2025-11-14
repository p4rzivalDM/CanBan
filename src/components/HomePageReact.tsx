import React, { useState, useEffect, useRef } from 'react';
import { GripVertical, Columns2 } from 'lucide-react';
import HeaderControls from './HeaderControls';
import TaskModal from './TaskModal';
import KanbanView from './KanbanView';
import CalendarView from './CalendarView';

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
    const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedTask, setDraggedTask] = useState(null);
    const [draggedColumn, setDraggedColumn] = useState(null);
    const [newTaskColumn, setNewTaskColumn] = useState(null);
    const [newTaskForm, setNewTaskForm] = useState({ title: '', date: '', time: '', deadline: '', deadline_time: '', priority: 'medium', tags: '', description: '' });
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
            { id: 'todo', title: 'To-do', color: 'bg-slate-100', isDone: false },
            { id: 'inProgress', title: 'In progress', color: 'bg-blue-50', isDone: false },
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
            const priorityOrder = { very_high: 0, high: 1, medium: 2, low: 3, very_low: 4 };
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

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const renderKanban = () => (
        <KanbanView
            columnsState={columnsState}
            tasks={tasks}
            onViewTask={setViewingTask}
            onDeleteTask={deleteTask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={(columnId) => handleDrop(columnId)}
            getSortedTasks={getSortedTasks}
            newTaskColumn={newTaskColumn}
            onAddTaskClick={setNewTaskColumn}
            onCancelNewTask={() => setNewTaskColumn(null)}
            newTaskTitle={newTaskForm.title}
            onNewTaskTitleChange={(title) => setNewTaskForm({ ...newTaskForm, title })}
            onContinueNewTask={(column) => {
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
            editingColumn={editingColumn}
            onEditColumnClick={setEditingColumn}
            openColumnMenu={openColumnMenu}
            onToggleColumnMenu={setOpenColumnMenu}
            onUpdateColumn={updateColumn}
            onToggleColumnSort={toggleColumnSort}
            columnSortBy={columnSortBy}
            onAddColumnAtPosition={addColumnAtPosition}
            onDeleteColumn={deleteColumn}
            normalizeTags={normalizeTags}
        />
    );

    const renderCalendar = () => (
        <CalendarView
            tasks={tasks}
            columnsState={columnsState}
            currentDate={currentDate}
            calendarView={calendarView}
            onChangeDay={changeDay}
            onChangeWeek={changeWeek}
            onChangeMonth={changeMonth}
            onSetCalendarView={setCalendarView}
            onToday={goToToday}
            onViewTask={setViewingTask}
        />
    );

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
                    const taskExists = tasks.some(t => t.id === updated.id);
                    let newTasks;
                    
                    if (taskExists) {
                        // Task esistente - aggiorna
                        newTasks = tasks.map(t => t.id === updated.id ? { ...updated } : t);
                    } else {
                        // Nuovo task - aggiungi
                        const tasksInColumn = tasks.filter(t => t.column === updated.column);
                        const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : -1;
                        newTasks = [...tasks, { ...updated, order: maxOrder + 1 }];
                    }
                    
                    setTasks(newTasks);
                    pushSnapshot(newTasks, columnsState);
                }}
                onDelete={(id) => {
                    deleteTask(id);
                }}
            />
        </div>
    );
};

export default DevTaskManager;
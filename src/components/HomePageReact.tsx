import React, { useState, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import HeaderControls from './HeaderControls';
import TaskModal from './TaskModal';
import KanbanView from './KanbanView';
import CalendarView from './CalendarView';

const DevTaskManager = () => {
    const defaultTasks = [
        {
            id: 0,
            title: 'This is your first task with a very long title to test text truncation in the Kanban card view',
            column: 'todo',
            scheduled: '2025-11-13T05:20:00.000Z',
            deadline: '2025-11-30T05:35:00.000Z',
            priority: 'medium',
            tags: 'test frontend backend',
            description: 'This is your first task description to demonstrate how descriptions are displayed in the Kanban card view.',
            order: 0
        },
        {
            id: 1,
            title: 'This is a sample task to describe the tool functionality',
            column: 'inProgress',
            scheduled: '2025-11-13T05:20:00.000Z',
            deadline: '2025-11-30T05:35:00.000Z',
            priority: 'medium',
            tags: 'test learn',
            description: 'This is a sample description for the task to demonstrate how descriptions are displayed in the Kanban card view.',
            order: 0
        },
        {
            id: 2,
            title: 'This is a sample task with a very long title to test text truncation in the Kanban card view',
            column: 'done',
            scheduled: '2025-11-13T05:20:00.000Z',
            deadline: '2025-11-30T05:35:00.000Z',
            priority: 'medium',
            tags: 'test adds aaaaaaaaaaa',
            description: 'Descrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123',
            order: 0
        },
        {
            id: 3,
            title: 'This is a sample task with a very long title to test text truncation in the Kanban card view',
            column: 'done',
            scheduled: '2025-11-13T05:20:00.000Z',
            deadline: '2025-11-30T05:35:00.000Z',
            priority: 'medium',
            tags: 'test adds aaaaaaaaaaa',
            description: 'Descrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123\nDescrizione PROVA 123',
            order: 0
        },
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
    const [viewingTask, setViewingTask] = useState(null);
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
            { id: 'todo', title: 'To do', color: 'bg-slate-100', isDone: false },
            { id: 'inProgress', title: 'In progress', color: 'bg-blue-50', isDone: false },
            { id: 'done', title: 'Done', color: 'bg-green-50', isDone: true },
            { id: 'deleted', title: 'Deleted', color: 'bg-cyan-50', isDone: true }
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
    };

    const reorderColumns = (newColumns) => {
        setColumnsState(newColumns);
        pushSnapshot(tasks, newColumns);
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
            onUpdateTask={updateTask}
            onUpdateColumn={updateColumn}
            onAddColumnAtPosition={addColumnAtPosition}
            onDeleteColumn={deleteColumn}
            onReorderColumns={reorderColumns}
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
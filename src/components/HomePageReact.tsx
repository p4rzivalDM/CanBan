import React, { useState, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import HeaderControls from './HeaderControls';
import TaskModal from './TaskModal';
import KanbanView from './KanbanView';
import CalendarView from './CalendarView';
import ViewSkeleton from './ViewSkeleton';
import SettingsModal from './SettingsModal';
import { Spinner } from './ui/spinner';
import { convertTasksToCSV, parseCSVToTasks } from '../utils';
import '../styles/transitions.css';
import { toast, Toaster } from 'sonner';

const DevTaskManager = () => {
    // Durata del loading iniziale (in ms) - modifica questo valore per cambiare velocemente
    const INITIAL_LOAD_DELAY = 300;

    // Impostazioni con state
    const [settings, setSettings] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('canban_settings');
            if (savedSettings) {
                return JSON.parse(savedSettings);
            }
        }
        return {
            dividerLeftLimit: 12,
            dividerRightLimit: 88
        };
    });

    const DIVIDER_LEFT_LIMIT = settings.dividerLeftLimit || 12;
    const DIVIDER_RIGHT_LIMIT = settings.dividerRightLimit || 88;
    const SAVED_RATIO_MIN = 20;       // Minimo ratio salvato quando si torna a "both"
    const SAVED_RATIO_MAX = 80;       // Massimo ratio salvato quando si torna a "both"

    // State per la modale settings
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const defaultTasks = [
        {
            id: 0,
            title: 'Welcome to CanBan — overview',
            column: 'todo',
            scheduled: '2025-11-13T08:00:00.000Z',
            deadline: '2025-11-30T17:00:00.000Z',
            priority: 'medium',
            tags: 'guide introduction',
            description: 'CanBan combines Kanban and Calendar. Cards are tasks; columns are workflow phases (To do, In progress, Done, Deleted). Each card shows icons for priority, Scheduled and Deadline. Continue with the next cards to learn all features.',
            order: 0
        },
        {
            id: 1,
            title: 'Create and edit tasks',
            column: 'todo',
            scheduled: '2025-11-14T09:00:00.000Z',
            deadline: '2025-12-01T18:00:00.000Z',
            priority: 'high',
            tags: 'create edit details',
            description: 'Use the + button in a column header to add a card. Click a card to open details: change title, description, priority, tags, Scheduled and Deadline. Save to apply; delete from the modal if no longer needed.',
            order: 1
        },
        {
            id: 2,
            title: 'Drag & drop and column options',
            column: 'inProgress',
            scheduled: '2025-11-15T10:00:00.000Z',
            deadline: '2025-12-05T17:00:00.000Z',
            priority: 'medium',
            tags: 'drag drop columns compact sort',
            description: 'Drag cards to reorder or move between columns. Drag a column header to reorder columns. Click a column title to rename. In the ••• menu: Compact view, Sort by priority, Add left/right, Delete. Preferences are stored per column.',
            order: 0
        },
        {
            id: 3,
            title: 'Calendar and split view',
            column: 'done',
            scheduled: '2025-11-16T09:30:00.000Z',
            deadline: '2025-12-10T17:30:00.000Z',
            priority: 'low',
            tags: 'calendar split day week month',
            description: 'From the top controls choose Kanban, Calendar or Both. In split view drag the central handle to resize. In Calendar switch between Day/Week/Month, jump to Today, and open tasks from the grid.',
            order: 0
        },
        {
            id: 4,
            title: 'Undo/Redo, backup and trash',
            column: 'deleted',
            scheduled: '2025-11-17T08:30:00.000Z',
            deadline: '2025-12-12T08:30:00.000Z',
            priority: 'very_low',
            tags: 'history export import localStorage',
            description: 'Use Undo/Redo to return to a previous state. Export a JSON backup and import it to restore data. Data is auto-saved in the browser. The Deleted column can act as a trash; or delete directly from the modal. Long titles are truncated; descriptions wrap.',
            order: 0
        }
    ];

    const loadFromStorage = () => {
        if (typeof window !== 'undefined') {
            const savedTasks = localStorage.getItem('canban_tasks');
            return savedTasks ? JSON.parse(savedTasks) : defaultTasks;
        }
        return defaultTasks;
    };

    const [tasks, setTasks] = useState(loadFromStorage());

    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedViewMode = localStorage.getItem('canban_viewMode');
            return savedViewMode || 'both';
        }
        return 'both';
    });
    const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewingTask, setViewingTask] = useState(null);
    const [splitRatio, setSplitRatio] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedSplitRatio = localStorage.getItem('canban_splitRatio');
            return savedSplitRatio ? parseFloat(savedSplitRatio) : 50;
        }
        return 50;
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSnapAnimating, setIsSnapAnimating] = useState(false);
    const [savedSplitRatio, setSavedSplitRatio] = useState(50);
    const [dragMode, setDragMode] = useState<'split' | 'from-kanban' | 'from-calendar' | null>(null);
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
        const existingTask = tasks.find(t => t.id === taskId);
        let newTasks;
        
        if (existingTask) {
            // Update existing task
            newTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        } else {
            // Add new task
            newTasks = [...tasks, { id: taskId, ...updates }];
        }
        
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

        // Determina da quale vista si sta trascinando e inizializza il ratio
        if (viewMode === 'both') {
            setDragMode('split');
        } else if (viewMode === 'kanban') {
            setDragMode('from-kanban');
            // Inizializza il splitRatio a sinistra (il kanban è a sinistra)
            setSplitRatio(100);
        } else if (viewMode === 'calendar') {
            setDragMode('from-calendar');
            // Inizializza il splitRatio a destra (il calendar è a destra)
            setSplitRatio(0);
        }

        document.body.style.userSelect = 'none';
    };

    // Caricamento iniziale da localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Sincronizza viewMode da localStorage
            const savedViewMode = localStorage.getItem('canban_viewMode');
            if (savedViewMode && savedViewMode !== viewMode) {
                setViewMode(savedViewMode);
            }

            // Sincronizza splitRatio da localStorage
            const savedSplitRatio = localStorage.getItem('canban_splitRatio');
            if (savedSplitRatio) {
                setSplitRatio(parseFloat(savedSplitRatio));
            }

            // Marca il componente come caricato dopo il delay
            const timer = setTimeout(() => {
                setIsLoaded(true);
            }, INITIAL_LOAD_DELAY);

            return () => clearTimeout(timer);
        }
    }, []);

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

    // Salvataggio automatico della modalità di visualizzazione
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('canban_viewMode', viewMode);
        }
    }, [viewMode]);

    // Salvataggio automatico della posizione del divisorio
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('canban_splitRatio', splitRatio.toString());
        }
    }, [splitRatio]);

    // Salvataggio automatico delle impostazioni
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('canban_settings', JSON.stringify(settings));
        }
    }, [settings]);

    useEffect(() => {
        if (isDragging) {
            const handleMouseMoveEvent = (e) => {
                if (!containerRef.current) return;

                const container = containerRef.current;
                const rect = container.getBoundingClientRect();
                let newRatio = ((e.clientX - rect.left) / rect.width) * 100;

                // Arrotonda a step di 0.1%
                newRatio = Math.round(newRatio * 10) / 10;

                // Limita il ratio tra 0 e 100
                newRatio = Math.max(0, Math.min(100, newRatio));

                // Durante il drag, aggiorna il ratio ma non la modalità
                setSplitRatio(newRatio);
            };

            const handleMouseUpEvent = () => {
                setIsDragging(false);
                document.body.style.userSelect = '';

                // Cambia modalità solo se il rilascio avviene oltre i limiti
                setSplitRatio((ratio) => {
                    // Arrotonda al numero intero più vicino
                    const roundedRatio = Math.round(ratio);

                    if (roundedRatio < DIVIDER_RIGHT_LIMIT && roundedRatio > DIVIDER_LEFT_LIMIT) {
                        setViewMode('both');
                        setSavedSplitRatio(Math.max(SAVED_RATIO_MIN, Math.min(SAVED_RATIO_MAX, roundedRatio)));
                    }
                    if (roundedRatio < DIVIDER_LEFT_LIMIT) {
                        // Trascinato oltre il limite sinistro -> mostra solo Kanban
                        setSavedSplitRatio(Math.max(SAVED_RATIO_MIN, Math.min(SAVED_RATIO_MAX, roundedRatio)));
                        setViewMode((currentMode) => {
                            if (currentMode !== 'calendar') {
                                setIsSnapAnimating(true);
                                setTimeout(() => {
                                    setIsSnapAnimating(false);
                                }, 250);
                                return 'calendar';
                            }
                            return currentMode;
                        });
                    }
                    if (roundedRatio > DIVIDER_RIGHT_LIMIT) {
                        // Trascinato oltre il limite destro -> mostra solo Calendar
                        setSavedSplitRatio(Math.max(SAVED_RATIO_MIN, Math.min(SAVED_RATIO_MAX, roundedRatio)));
                        setViewMode((currentMode) => {
                            if (currentMode !== 'kanban') {
                                setIsSnapAnimating(true);
                                setTimeout(() => {
                                    setIsSnapAnimating(false);
                                }, 250);
                                return 'kanban';
                            }
                            return currentMode;
                        });
                    }
                    return roundedRatio;
                });

                setDragMode(null);
            };

            document.addEventListener('mousemove', handleMouseMoveEvent);
            document.addEventListener('mouseup', handleMouseUpEvent);

            return () => {
                document.removeEventListener('mousemove', handleMouseMoveEvent);
                document.removeEventListener('mouseup', handleMouseUpEvent);
            };
        }
    }, [isDragging, dragMode]);

    // Ripristina il splitRatio quando torni a "both"
    useEffect(() => {
        if (viewMode === 'both' && (splitRatio < DIVIDER_LEFT_LIMIT || splitRatio > DIVIDER_RIGHT_LIMIT)) {
            setSplitRatio(savedSplitRatio);
        }
    }, [viewMode]);

    // registra snapshot iniziale una volta
    useEffect(() => {
        if (historyRef.current.index === -1) {
            pushSnapshot(tasks, columnsState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Funzioni di importazione e esportazione
    // Helper per messaggi di conferma import
    const buildImportConfirmMessage = (tasksCount: number, columnsCount: number, format: string) => {
        return (
            `Found ${tasksCount} tasks and ${columnsCount} columns in ${format}.\n\n` +
            `OK = Import and replace current data\n` +
            `Cancel = Abort import`
        );
    };

    const exportToJSON = () => {
        // Determine splitRatio based on viewMode
        let exportSplitRatio = splitRatio;
        if (viewMode === 'calendar') {
            exportSplitRatio = 0;
        } else if (viewMode === 'kanban') {
            exportSplitRatio = 100;
        }
        
        const dataToExport = {
            tasks,
            columns: columnsState,
            settings,
            viewMode,
            splitRatio: exportSplitRatio,
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

    const importDataUnified = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (ext === 'json') {
                    const data = JSON.parse(content);
                    if (data.tasks && Array.isArray(data.tasks) && data.columns && Array.isArray(data.columns)) {
                        const tasksCount = data.tasks.length;
                        const columnsCount = data.columns.length;
                        const proceed = confirm(buildImportConfirmMessage(tasksCount, columnsCount, 'JSON'));
                        if (!proceed) {
                            return;
                        }
                        setTasks(data.tasks);
                        setColumnsState(data.columns);
                        pushSnapshot(data.tasks, data.columns);
                        if (data.settings) setSettings(data.settings);
                        if (data.viewMode) setViewMode(data.viewMode);
                        if (typeof data.splitRatio === 'number') setSplitRatio(data.splitRatio);
                        toast.success(`Imported ${tasksCount} tasks and ${columnsCount} columns from JSON`);
                    } else {
                        toast.error('Invalid JSON format. Please use a file exported from CanBan.');
                    }
                } else if (ext === 'csv') {
                    const result = parseCSVToTasks(content);
                    if (result.tasks && result.tasks.length > 0) {
                        // Determine columns to use: from metadata if available, otherwise current columns
                        const columnsToUse = result.metadata?.columns || columnsState;
                        const uniqueColumns = new Set(result.tasks.map(t => t.column));
                        const columnsCount = uniqueColumns.size;
                        
                        const proceed = confirm(buildImportConfirmMessage(result.tasks.length, columnsCount, 'CSV'));
                        if (!proceed) {
                            return;
                        }
                        
                        setTasks(result.tasks);
                        setColumnsState(columnsToUse);
                        pushSnapshot(result.tasks, columnsToUse);
                        
                        // Restore settings, viewMode and splitRatio if available in metadata
                        if (result.metadata) {
                            if (result.metadata.settings) setSettings(result.metadata.settings);
                            if (result.metadata.viewMode) setViewMode(result.metadata.viewMode);
                            if (typeof result.metadata.splitRatio === 'number') setSplitRatio(result.metadata.splitRatio);
                        }
                        
                        toast.success(`Imported ${result.tasks.length} tasks and ${columnsCount} columns from CSV`);
                    } else {
                        toast.error('No valid tasks found in CSV file.');
                    }
                } else {
                    toast.error('Unsupported file format. Please select a .json or .csv file.');
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error';
                toast.error(`Import error: ${msg}`);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const exportToCSV = () => {
        // Determine splitRatio based on viewMode
        let exportSplitRatio = splitRatio;
        if (viewMode === 'calendar') {
            exportSplitRatio = 0;
        } else if (viewMode === 'kanban') {
            exportSplitRatio = 100;
        }

        const csvContent = convertTasksToCSV(tasks, columnsState, settings, viewMode, exportSplitRatio);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `canban_tasks_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
            {!isLoaded ? (
                <div className="flex-1 flex items-center justify-center">
                    <Spinner className="size-8" />
                </div>
            ) : (
                <>
                    <HeaderControls
                        viewMode={viewMode}
                        previewMode={isDragging ? (
                            splitRatio <= DIVIDER_LEFT_LIMIT ? 'calendar' :
                            splitRatio >= DIVIDER_RIGHT_LIMIT ? 'kanban' :
                            'both'
                        ) : null}
                        setViewMode={setViewMode}
                        exportToJSON={exportToJSON}
                        importDataUnified={importDataUnified}
                        exportToCSV={exportToCSV}
                        undo={undo}
                        redo={redo}
                        historyState={historyState}
                        onSettingsClick={() => setIsSettingsOpen(true)}
                    />

                    <div className="flex-1 overflow-hidden" ref={containerRef}>
                        {viewMode === 'kanban' && (
                            <div className="flex h-full relative">
                                <div className="overflow-auto" style={{ width: isDragging && dragMode === 'from-kanban' ? `${splitRatio}%` : '100%' }}>
                                    {splitRatio < DIVIDER_LEFT_LIMIT ? (
                                        <ViewSkeleton type="kanban" />
                                    ) : (
                                        renderKanban()
                                    )}
                                </div>

                                {/* Divider hover per tornare a split view */}
                                <div
                                    className="w-8 flex items-center justify-center px-2 hover:bg-gray-100 relative group"
                                    onMouseDown={handleMouseDown}
                                >
                                    {isDragging && dragMode === 'from-kanban' ? (
                                        <div className="text-sm font-bold text-gray-700" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                                            {(splitRatio).toFixed(1)}%
                                        </div>
                                    ) : (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-3 h-7 bg-gray-400 hover:bg-black rounded-full flex items-center justify-center cursor-col-resize">
                                                <GripVertical className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Vista fantasma del calendar - skeleton finché non raggiungi il limite destro */}
                                <div className="overflow-auto" style={{ width: isDragging && dragMode === 'from-kanban' ? `${100 - splitRatio}%` : '0%' }}>
                                    {isDragging && dragMode === 'from-kanban' ? (
                                        splitRatio >= DIVIDER_RIGHT_LIMIT ? (
                                            <ViewSkeleton type="calendar" />
                                        ) : (
                                            renderCalendar()
                                        )
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {viewMode === 'calendar' && (
                            <div className="flex h-full relative">
                                {/* Vista fantasma del kanban - skeleton finché non raggiungi il limite sinistro */}
                                <div className="overflow-auto" style={{ width: isDragging && dragMode === 'from-calendar' ? `${splitRatio}%` : '0%' }}>
                                    {isDragging && dragMode === 'from-calendar' ? (
                                        splitRatio <= DIVIDER_LEFT_LIMIT ? (
                                            <ViewSkeleton type="kanban" />
                                        ) : (
                                            renderKanban()
                                        )
                                    ) : null}
                                </div>

                                {/* Divider hover per tornare a split view */}
                                <div
                                    className="w-8 flex items-center justify-center px-2 hover:bg-gray-100 relative group"
                                    onMouseDown={handleMouseDown}
                                >
                                    {isDragging && dragMode === 'from-calendar' ? (
                                        <div className="text-sm font-bold text-gray-700" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                                            {(splitRatio).toFixed(1)}%
                                        </div>
                                    ) : (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-3 h-7 bg-gray-400 hover:bg-black rounded-full flex items-center justify-center cursor-col-resize">
                                                <GripVertical className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-auto" style={{ width: isDragging && dragMode === 'from-calendar' ? `${100 - splitRatio}%` : '100%' }}>
                                    {splitRatio > DIVIDER_RIGHT_LIMIT ? (
                                        <ViewSkeleton type="calendar" />
                                    ) : (
                                        renderCalendar()
                                    )}
                                </div>
                            </div>
                        )}

                        {viewMode === 'both' && (
                            <div className="flex h-full relative">
                                <div className="overflow-auto" style={{ width: `${splitRatio}%` }}>
                                    {splitRatio < DIVIDER_LEFT_LIMIT ? (
                                        <ViewSkeleton type="kanban" />
                                    ) : (
                                        renderKanban()
                                    )}
                                </div>

                                <div
                                    className="w-8 flex items-center justify-center px-2 hover:bg-gray-100 relative group"
                                    onMouseDown={handleMouseDown}
                                >
                                    {isDragging ? (
                                        <div className="text-sm font-bold text-gray-700" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                                            {(splitRatio).toFixed(1)}%
                                        </div>
                                    ) : (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className={`w-3 h-7 bg-gray-400 hover:bg-black rounded-full flex items-center justify-center transition-colors ${isSnapAnimating ? 'divider-snap' : ''}`}
                                                style={isSnapAnimating ? {
                                                    '--snap-distance': splitRatio < 50 ? '-100px' : '100px'
                                                } as React.CSSProperties : {}}
                                            >
                                                <GripVertical className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-auto" style={{ width: `${100 - splitRatio}%` }}>
                                    {splitRatio > DIVIDER_RIGHT_LIMIT ? (
                                        <ViewSkeleton type="calendar" />
                                    ) : (
                                        renderCalendar()
                                    )}
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

                    <SettingsModal
                        settings={settings}
                        onSettingsChange={setSettings}
                        isOpen={isSettingsOpen}
                        onOpenChange={setIsSettingsOpen}
                    />
                    <Toaster richColors position="top-center" />
                </>
            )}
        </div>
    );
};

export default DevTaskManager;
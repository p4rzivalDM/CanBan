import React, { useRef } from 'react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { CalendarDays, Columns2, Dog, Download, FolderOpen, Redo, Undo, Settings, FileUp, ChevronDown } from 'lucide-react';
import '../styles/transitions.css';

const HeaderControls = ({ viewMode, previewMode, setViewMode, exportToJSON, importDataUnified, exportToCSV, undo, redo, historyState, onSettingsClick }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        importDataUnified(e);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    return (
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm header-controls">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center"><Dog size={32} />Ban Calendar</h1>
                
            </div>
            <div className="flex gap-2">
                <Button
                    onClick={() => setViewMode('calendar')}
                    variant={(previewMode || viewMode) === 'calendar' ? 'default' : 'outline'}
                    className="view-mode-button"
                    title="Calendar view"
                >
                    <CalendarDays />
                </Button>
                <Button
                    onClick={() => setViewMode('both')}
                    variant={(previewMode || viewMode) === 'both' ? 'default' : 'outline'}
                    className="view-mode-button"
                    title="Split view"
                >
                    <Columns2 />
                </Button>
                <Button
                    onClick={() => setViewMode('kanban')}
                    variant={(previewMode || viewMode) === 'kanban' ? 'default' : 'outline'}
                    className="view-mode-button"
                    title="Kanban view"
                >
                    <Dog />
                </Button>
                <div className="border-l border-slate-300 mx-2"></div>
                <Button
                    onClick={undo}
                    disabled={historyState.index <= 0}
                    variant={historyState.index <= 0 ? 'outline' : 'default'}
                    title="Undo"
                >
                    <Undo /> Undo
                </Button>
                <Button
                    onClick={redo}
                    disabled={historyState.index >= historyState.length - 1}
                    variant={historyState.index >= historyState.length - 1 ? 'outline' : 'default'}
                    title="Redo"
                >
                    <Redo /> Redo
                </Button>
                <div className="border-l border-slate-300 mx-2"></div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={'outline'}
                            title="Export data"
                        >
                            <Download /> Export <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={exportToJSON}>
                            <Download /> JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportToCSV}>
                            <Download /> CSV
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    onClick={handleImportClick}
                    variant={'outline'}
                    title="Import data from JSON or CSV file"
                >
                    <FileUp /> Import
                </Button>
                <div className="border-l border-slate-300 mx-2"></div>
                <Button
                    onClick={onSettingsClick}
                    variant={'outline'}
                    title="Settings"
                >
                    <Settings />
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default HeaderControls;

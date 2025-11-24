import React, { useRef } from 'react';
import { Button } from './ui/button';
import { CalendarDays, Columns2, Dog, Download, FolderOpen, Redo, Undo, Settings } from 'lucide-react';
import '../styles/transitions.css';

const HeaderControls = ({ viewMode, previewMode, setViewMode, exportData, importData, undo, redo, historyState, onSettingsClick }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        importData(e);
        // Reset input so the same file can be imported again
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
                <Button
                    onClick={exportData}
                    variant={'outline'}
                    title="Export data as JSON"
                >
                    <Download /> Export
                </Button>
                <Button
                    onClick={handleImportClick}
                    variant={'outline'}
                    title="Import data from JSON file"
                >
                    <FolderOpen /> Import
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
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default HeaderControls;

import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Columns2, Download, FolderOpen, Redo, Undo } from 'lucide-react';

const HeaderControls = ({ viewMode, setViewMode, exportData, importData, undo, redo, historyState }) => {
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
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">Dev Task Manager</h1>
                
            </div>
            <div className="flex gap-2">
                <Button
                    onClick={() => setViewMode('kanban')}
                    variant={viewMode === 'kanban' ? 'default' : 'outline'}
                >
                    Kanban
                </Button>
                <Button
                    onClick={() => setViewMode('calendar')}
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                >
                    Calendar
                </Button>
                <Button
                    onClick={() => setViewMode('both')}
                    variant={viewMode === 'both' ? 'default' : 'outline'}
                    title="Split view"
                >
                    <Columns2 />
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

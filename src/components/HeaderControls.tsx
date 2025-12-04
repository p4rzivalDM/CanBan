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
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ButtonGroup, ButtonGroupSeparator } from './ui/button-group';

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
                <ButtonGroup>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => setViewMode('calendar')}
                                variant={(previewMode || viewMode) === 'calendar' ? 'default' : 'outline'}
                                className="view-mode-button"
                            >
                                <CalendarDays />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Calendar view</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => setViewMode('both')}
                                variant={(previewMode || viewMode) === 'both' ? 'default' : 'outline'}
                                className="view-mode-button"
                            >
                                <Columns2 />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Split view</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => setViewMode('kanban')}
                                variant={(previewMode || viewMode) === 'kanban' ? 'default' : 'outline'}
                                className="view-mode-button"
                            >
                                <Dog />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Kanban view</TooltipContent>
                    </Tooltip>
                </ButtonGroup>
                <ButtonGroupSeparator />
                <ButtonGroup>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={undo}
                                disabled={historyState.index <= 0}
                                variant={historyState.index <= 0 ? 'outline' : 'default'}
                            >
                                <Undo /> Undo
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={redo}
                                disabled={historyState.index >= historyState.length - 1}
                                variant={historyState.index >= historyState.length - 1 ? 'outline' : 'default'}
                            >
                                <Redo /> Redo
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Redo</TooltipContent>
                    </Tooltip>
                </ButtonGroup>
                <ButtonGroupSeparator />
                <ButtonGroup>
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                    >
                                        <Download /> Export <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Export data</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={exportToJSON}>
                                <Download /> JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToCSV}>
                                <Download /> CSV
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleImportClick}
                                variant={'outline'}
                            >
                                <FileUp /> Import
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Import data from JSON or CSV file</TooltipContent>
                    </Tooltip>
                </ButtonGroup>
                <ButtonGroupSeparator />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={onSettingsClick}
                            variant={'outline'}
                        >
                            <Settings />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings</TooltipContent>
                </Tooltip>
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

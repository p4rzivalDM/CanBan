import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

interface Settings {
    dividerLeftLimit: number;
    dividerRightLimit: number;
}

const SettingsModal = ({ settings, onSettingsChange, isOpen, onOpenChange }) => {
    const [localSettings, setLocalSettings] = useState<Settings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    const handleLeftLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(5, Math.min(30, parseInt(e.target.value) || 5));
        setLocalSettings({ ...localSettings, dividerLeftLimit: value });
    };

    const handleRightLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(70, Math.min(95, parseInt(e.target.value) || 95));
        setLocalSettings({ ...localSettings, dividerRightLimit: value });
    };

    const handleSave = () => {
        onSettingsChange(localSettings);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {/* Left Limit */}
                    <div className="space-y-3">
                        <Label htmlFor="left-limit" className="text-sm font-medium">
                            Left Limit: {localSettings.dividerLeftLimit}%
                        </Label>
                        <div className="flex items-center gap-4">
                            <input
                                id="left-limit"
                                type="range"
                                min="5"
                                max="30"
                                value={localSettings.dividerLeftLimit}
                                onChange={handleLeftLimitChange}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <input
                                type="number"
                                min="5"
                                max="30"
                                value={localSettings.dividerLeftLimit}
                                onChange={handleLeftLimitChange}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Threshold to switch to Calendar-only view when dragging left</p>
                    </div>

                    {/* Right Limit */}
                    <div className="space-y-3">
                        <Label htmlFor="right-limit" className="text-sm font-medium">
                            Right Limit: {localSettings.dividerRightLimit}%
                        </Label>
                        <div className="flex items-center gap-4">
                            <input
                                id="right-limit"
                                type="range"
                                min="70"
                                max="95"
                                value={localSettings.dividerRightLimit}
                                onChange={handleRightLimitChange}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <input
                                type="number"
                                min="70"
                                max="95"
                                value={localSettings.dividerRightLimit}
                                onChange={handleRightLimitChange}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Threshold to switch to Kanban-only view when dragging right</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="default"
                    >
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SettingsModal;

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MarkdownEditor } from './ui/markdown-editor';
import { Field, FieldLabel } from './ui/field';
import TagInput from './ui/tags';
import { Info, Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { DateTime } from './ui/date-time';

const TaskModal = ({ viewingTask, setViewingTask, onSave, onDelete, suggestions, allTasks }) => {
    const [editingForm, setEditingForm] = useState(viewingTask || null);

    useEffect(() => {
        setEditingForm(viewingTask ? { ...viewingTask } : null);
    }, [viewingTask]);

    if (!viewingTask) return null;

    const handleChange = (field) => (e) => {
        const value = e.target ? e.target.value : e;
        setEditingForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!editingForm?.title?.trim()) {
            alert('Title is required');
            return;
        }
        onSave(editingForm);
        setViewingTask(null);
    };

    const handleCancel = () => {
        setViewingTask(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="max-h-[95vh] w-full max-w-5xl bg-white rounded-lg shadow-lg flex flex-col">
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-200 shrink-0">
                        <h2 className="text-xl font-semibold">Edit task</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3 px-4 pt-4 overflow-y-auto flex-1">
                        <Field>
                            <FieldLabel htmlFor="title">Title</FieldLabel>
                            <Input
                                id="title"
                                placeholder="Enter task title"
                                value={editingForm?.title || ''}
                                onChange={handleChange('title')}
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <MarkdownEditor
                                id="description"
                                value={editingForm?.description || ''}
                                onChange={(value) => handleChange('description')({ target: { value } })}
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Priority</FieldLabel>
                            <RadioGroup value={editingForm?.priority || 'medium'} onValueChange={(value) => handleChange('priority')({ target: { value } })}>
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="very_high" id="very_high" />
                                        <label htmlFor="very_high" className="cursor-pointer">Very High</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="high" id="high" />
                                        <label htmlFor="high" className="cursor-pointer">High</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="medium" id="medium" />
                                        <label htmlFor="medium" className="cursor-pointer">Medium</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="low" id="low" />
                                        <label htmlFor="low" className="cursor-pointer">Low</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="very_low" id="very_low" />
                                        <label htmlFor="very_low" className="cursor-pointer">Very Low</label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="scheduled">Scheduled</FieldLabel>
                            <DateTime
                                id="scheduled"
                                value={editingForm?.scheduled || ''}
                                onChange={handleChange('scheduled')}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
                            <DateTime
                                id="deadline"
                                value={editingForm?.deadline || ''}
                                onChange={handleChange('deadline')}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="tags" className="flex items-center gap-2">
                                <span>Tags</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span role="button" tabIndex={0} className="inline-flex">
                                                <Info className="h-4 w-4 text-gray-400" />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Clic destro sul campo Tags per vedere i suggerimenti
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </FieldLabel>
                            <TagInput
                                id="tags"
                                value={editingForm?.tags || ''}
                                onChange={(v) => handleChange('tags')({ target: { value: v } })}
                                placeholder="Add tags"
                                suggestions={(function () {
                                    // Build suggestions from allTasks but replace current task's tags with editingForm tags
                                    try {
                                        const set = new Set<string>();
                                        const currentId = viewingTask?.id;
                                        const currentTags = Array.isArray(editingForm?.tags)
                                            ? editingForm?.tags.join(' ')
                                            : (editingForm?.tags || '');
                                        (allTasks || []).forEach(t => {
                                            const raw = (t.id === currentId)
                                                ? currentTags
                                                : (Array.isArray(t.tags) ? t.tags.join(' ') : (t.tags || ''));
                                            raw.split(/\s+/).forEach(x => {
                                                const cleaned = String(x || '').trim().replace(/^#/, '');
                                                if (cleaned) set.add(cleaned);
                                            });
                                        });
                                        return Array.from(set).sort((a, b) => a.localeCompare(b));
                                    } catch {
                                        return suggestions || [];
                                    }
                                })()}
                            />
                        </Field>
                    </div>
                    <div className="mt-4 p-4 flex justify-between gap-2 border-t border-gray-200 shrink-0">
                        <div className="flex justify-start gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                    onDelete(viewingTask.id);
                                    setViewingTask(null);
                                }}
                            >
                                <Trash />
                            </Button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button type="button" variant="default" onClick={handleSave}>Save</Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;

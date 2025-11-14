import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Field, FieldLabel } from './ui/field';
import TagInput from './ui/tags';
import { Trash } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const TaskModal = ({ viewingTask, setViewingTask, onSave, onDelete }) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="w-[90%] max-w-2xl bg-white rounded-lg p-6 shadow-lg">
                <form onSubmit={(e) => e.preventDefault()}>
                    <h2 className="text-xl font-semibold mb-3">Edit task</h2>
                    <div className="grid grid-cols-1 gap-3">
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
                            <Textarea
                                id="description"
                                placeholder="Enter task description"
                                rows={4}
                                value={editingForm?.description || ''}
                                onChange={handleChange('description')}
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
                            <FieldLabel htmlFor="date">Scheduled</FieldLabel>
                            <div className="flex gap-2">
                                <Input
                                    id="date"
                                    placeholder="Select date"
                                    type="date"
                                    value={editingForm?.date || ''}
                                    onChange={handleChange('date')}
                                />
                                <Input
                                    id="time"
                                    placeholder="Select time"
                                    type="time"
                                    value={editingForm?.time || ''}
                                    onChange={handleChange('time')}
                                />
                            </div>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
                            <div className="flex gap-2">
                                <Input
                                    id="deadline"
                                    placeholder="Select date"
                                    type="date"
                                    value={editingForm?.deadline || ''}
                                    onChange={handleChange('deadline')}
                                />
                                <Input
                                    id="deadline-time"
                                    placeholder="Select time"
                                    type="time"
                                    value={editingForm?.deadline_time || ''}
                                    onChange={handleChange('deadline_time')}
                                />
                            </div>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="tags">Tags</FieldLabel>
                            <TagInput
                                id="tags"
                                value={editingForm?.tags || ''}
                                onChange={(v) => handleChange('tags')({ target: { value: v } })}
                                placeholder="Add tags"
                            />
                        </Field>
                    </div>
                    <div className="mt-4 flex justify-between gap-2">
                        <div className="mt-4 flex justify-start gap-2">
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
                        <div className="mt-4 flex justify-end gap-2">
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

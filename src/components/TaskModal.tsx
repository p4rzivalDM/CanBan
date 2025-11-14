import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Field, FieldLabel } from './ui/field';
import TagInput from './ui/tags';
import { Trash } from 'lucide-react';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from './ui/select';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent/50">
            <div className="w-[90%] max-w-2xl bg-white rounded-lg p-6 shadow-lg">
                <form>
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
                            <FieldLabel htmlFor="priority">Priority</FieldLabel>
                            <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        id="priority"
                                        placeholder="Select priority"
                                        defaultValue={editingForm?.priority || 'normal'}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="very-high">Very High</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="very-low">Very Low</SelectItem>
                                </SelectContent>
                            </Select>
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
                                    onChange={(e) => setEditingForm(prev => ({ ...prev, time: e.target.value }))}
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
                                    onChange={(e) => setEditingForm(prev => ({ ...prev, deadline_time: e.target.value }))}
                                />
                            </div>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="tags">Tags</FieldLabel>
                            <TagInput
                                id="tags"
                                value={editingForm?.tags || ''}
                                onChange={(v) => setEditingForm(prev => ({ ...prev, tags: v }))}
                                placeholder="Add tags"
                            />
                        </Field>
                    </div>
                    <div className="mt-4 flex justify-between gap-2">
                        <div className="mt-4 flex justify-start gap-2">
                            <Button
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
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button variant="default" onClick={handleSave}>Save</Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;

import React, { useState, useEffect } from 'react';

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
        onSave(editingForm);
        setViewingTask(null);
    };

    const handleCancel = () => {
        setViewingTask(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="w-[90%] max-w-2xl bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-3">Modifica Task</h2>
                <div className="grid grid-cols-1 gap-3">
                    <input className="border p-2 rounded" value={editingForm.title || ''} onChange={handleChange('title')} />
                    <textarea className="border p-2 rounded" value={editingForm.description || ''} onChange={handleChange('description')} />
                    <div className="flex gap-2">
                        <input className="border p-2 rounded" value={editingForm.date || ''} onChange={handleChange('date')} type="date" />
                        <input className="border p-2 rounded" value={editingForm.time || ''} onChange={handleChange('time')} type="time" />
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button className="px-4 py-2 bg-gray-200 rounded" onClick={handleCancel}>Annulla</button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => { onDelete(viewingTask.id); setViewingTask(null); }}>Elimina</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave}>Salva Modifiche</button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;

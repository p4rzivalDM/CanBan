import React from 'react';

const HeaderControls = ({ viewMode, setViewMode, exportData, importData, undo, redo, historyState }) => {
    return (
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">Dev Task Manager</h1>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Salvataggio automatico attivo
                </span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-4 py-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Kanban
                </button>
                <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Calendario
                </button>
                <button
                    onClick={() => setViewMode('both')}
                    className={`px-4 py-2 rounded transition-colors ${viewMode === 'both' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Entrambi
                </button>
                <div className="border-l border-gray-300 mx-2"></div>
                <button
                    onClick={undo}
                    disabled={historyState.index <= 0}
                    className={`px-3 py-2 rounded text-sm ${historyState.index <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    title="Annulla (Undo)"
                >
                    ↶ Annulla
                </button>
                <button
                    onClick={redo}
                    disabled={historyState.index >= historyState.length - 1}
                    className={`px-3 py-2 rounded text-sm ${historyState.index >= historyState.length - 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    title="Ripristina (Redo)"
                >
                    ↷ Ripristina
                </button>
                <button
                    onClick={exportData}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    title="Esporta dati in JSON"
                >
                    💾 Esporta
                </button>
                <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm cursor-pointer">
                    📂 Importa
                    <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
};

export default HeaderControls;

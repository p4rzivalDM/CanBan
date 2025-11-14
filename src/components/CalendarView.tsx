import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { truncateText, getDaysInMonth, getWeekDays, priorityColors } from '../utils';

interface CalendarViewProps {
    tasks: any[];
    columnsState: any[];
    currentDate: Date;
    calendarView: 'day' | 'week' | 'month';
    onChangeDay: (delta: number) => void;
    onChangeWeek: (delta: number) => void;
    onChangeMonth: (delta: number) => void;
    onSetCalendarView: (view: 'day' | 'week' | 'month') => void;
    onViewTask: (task: any) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
    tasks,
    columnsState,
    currentDate,
    calendarView,
    onChangeDay,
    onChangeWeek,
    onChangeMonth,
    onSetCalendarView,
    onViewTask
}) => {
    if (calendarView === 'day') {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
                    <button onClick={() => onChangeDay(-1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h3 className="font-bold text-lg">
                            {currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => onSetCalendarView('month')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Month</button>
                            <button onClick={() => onSetCalendarView('week')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Week</button>
                            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Day</button>
                        </div>
                    </div>
                    <button onClick={() => onChangeDay(1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm">
                    {hours.map(hour => {
                        const hourStr = String(hour).padStart(2, '0');
                        const hourTasks = dayTasks.filter(t => t.time.startsWith(hourStr));

                        return (
                            <div key={hour} className="flex border-b">
                                <div className="w-20 p-2 text-sm text-gray-600 font-medium border-r bg-gray-50">
                                    {hourStr}:00
                                </div>
                                <div className="flex-1 p-2 space-y-1">
                                    {hourTasks.map(task => {
                                        const column = columnsState.find(c => c.id === task.column);
                                        const isDone = column?.isDone;
                                        return (
                                            <div
                                                key={task.id}
                                                onClick={() => onViewTask(task)}
                                                className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 ${priorityColors[task.priority]} bg-white shadow-sm ${isDone ? 'opacity-40' : ''}`}
                                            >
                                                <div className="font-medium">
                                                    <span className="text-xs mr-1">{task.time} -</span>
                                                    <span className="inline-block align-middle truncate max-w-[200px]">{truncateText(task.title, 60)}</span>
                                                </div>
                                                <div className="text-gray-500">{column?.title}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (calendarView === 'week') {
        const weekDays = getWeekDays(currentDate);

        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
                    <button onClick={() => onChangeWeek(-1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h3 className="font-bold text-lg">
                            Week - {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => onSetCalendarView('month')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Month</button>
                            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Week</button>
                            <button onClick={() => onSetCalendarView('day')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Day</button>
                        </div>
                    </div>
                    <button onClick={() => onChangeWeek(1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="grid grid-cols-7 gap-3">
                        {weekDays.map(day => {
                            const dateStr = day.toISOString().split('T')[0];
                            const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
                            const isToday = dateStr === new Date().toISOString().split('T')[0];
                            const hours = Array.from({ length: 24 }, (_, i) => i);

                            return (
                                <div key={dateStr} className={`border rounded-lg p-2 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                                    <div className={`text-sm font-semibold mb-2 text-center ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                                        {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="bg-white rounded overflow-auto max-h-[60vh]">
                                        {hours.map(hour => {
                                            const hourStr = String(hour).padStart(2, '0');
                                            const hourTasks = dayTasks.filter(t => t.time.startsWith(hourStr));

                                            return (
                                                <div key={hour} className="flex border-t items-start p-1">
                                                    <div className="w-14 p-1 text-xs text-gray-500 font-medium bg-gray-50">{hourStr}:00</div>
                                                    <div className="flex-1 p-1 space-y-1">
                                                        {hourTasks.map(task => {
                                                            const column = columnsState.find(c => c.id === task.column);
                                                            const isDone = column?.isDone;
                                                            return (
                                                                <div
                                                                    key={task.id}
                                                                    onClick={() => onViewTask(task)}
                                                                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${priorityColors[task.priority]} bg-white shadow-sm ${isDone ? 'opacity-40' : ''}`}
                                                                >
                                                                    <div className="font-medium text-xs">
                                                                        <span className="mr-1">{task.time} -</span>
                                                                        <span className="inline-block truncate max-w-40">{truncateText(task.title, 50)}</span>
                                                                    </div>
                                                                    <div className="text-gray-500 text-xs">{column?.title}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Month view
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const weekDaysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-gray-50 rounded"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
        const isToday = dateStr === '2025-11-12';

        days.push(
            <div key={day} className={`min-h-[100px] border rounded-lg p-2 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                    {day}
                </div>
                <div className="space-y-1">
                    {dayTasks.map(task => {
                        const column = columnsState.find(c => c.id === task.column);
                        const isDone = column?.isDone;
                        return (
                            <div
                                key={task.id}
                                onClick={() => onViewTask(task)}
                                className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 ${priorityColors[task.priority]} bg-white shadow-sm ${isDone ? 'opacity-40' : ''}`}
                            >
                                <div className="font-medium text-xs">{task.time}</div>
                                <div className="font-medium truncate">{truncateText(task.title, 60)}</div>
                                <div className="text-gray-500 text-xs">{column?.title}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
                <button onClick={() => onChangeMonth(-1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h3 className="font-bold text-lg">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Month</button>
                        <button onClick={() => onSetCalendarView('week')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Week</button>
                        <button onClick={() => onSetCalendarView('day')} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Day</button>
                    </div>
                </div>
                <button onClick={() => onChangeMonth(1)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDaysLabels.map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1 overflow-auto">
                {days}
            </div>
        </div>
    );
};

export default CalendarView;

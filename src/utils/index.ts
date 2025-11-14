export const truncateText = (text: string, max = 60) => {
    if (!text) return '';
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
};

export const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
};

export const getWeekDays = (date: Date) => {
    const start = new Date(date);
    // week starts Monday
    const day = start.getDay();
    const diffToMonday = (day + 6) % 7;
    start.setDate(start.getDate() - diffToMonday);
    const days = [] as Date[];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
    }
    return days;
};

const prioritiesMapping = {
    very_high: { id: 'very_high', label: 'Very High', color: 'border-red-500' },
    high: { id: 'high', label: 'High', color: 'border-orange-500' },
    medium: { id: 'medium', label: 'Medium', color: 'border-yellow-500' },
    low: { id: 'low', label: 'Low', color: 'border-green-500' },
    very_low: { id: 'very_low', label: 'Very Low', color: 'border-gray-500' }
};

export const priorityColors = (priority: string) => {
    let colorClass = `border-l-4 ${prioritiesMapping[priority]?.color || 'border-yellow-500'}`;
    return colorClass;
};

export const availableColors = [
    'bg-slate-100', 'bg-blue-50', 'bg-green-50', 'bg-purple-50',
    'bg-pink-50', 'bg-yellow-50', 'bg-red-50', 'bg-orange-50',
    'bg-indigo-50', 'bg-cyan-50'
];

export const availablePriorities = (priority: string) => {
    return prioritiesMapping[priority]?.label || 'Medium';
};    
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
    if (!priority || priority === '') {
        return 'border-l-4 border-gray-200';
    }
    let colorClass = `border-l-4 ${prioritiesMapping[priority]?.color || 'border-gray-200'}`;
    return colorClass;
};

export const availableColors = [
    'bg-slate-100', 'bg-blue-50', 'bg-green-50', 'bg-purple-50',
    'bg-pink-50', 'bg-yellow-50', 'bg-red-50', 'bg-orange-50',
    'bg-indigo-50', 'bg-cyan-50'
];

export const availablePriorities = (priority: string) => {
    if (!priority || priority === '') {
        return 'None';
    }
    return prioritiesMapping[priority]?.label || 'None';
};
import Papa from 'papaparse';

// CSV Export/Import utilities
export const convertTasksToCSV = (tasks: any[], columns: any[], settings?: any, viewMode?: string, splitRatio?: number) => {
    // CSV headers - added MetaData column at the end
    const headers = [
        'ID',
        'Title',
        'Column',
        'Column Title',
        'Scheduled',
        'Deadline',
        'Priority',
        'Tags',
        'Description',
        'Order',
        'Archived',
        'MetaData'
    ];

    // Helper function to escape CSV fields (RFC4180):
    // - Wrap in double quotes if field contains comma, quote, or newline
    // - Escape internal quotes by doubling them
    const escapeCSVField = (field: any) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        const needsQuoting = /[",\n\r]/.test(str);
        if (!needsQuoting) return str;
        return '"' + str.replace(/"/g, '""') + '"';
    };

    // Build CSV rows
    const rows = tasks.map((task, index) => {
        const column = columns.find(c => c.id === task.column);
        const rowData = [
            task.id,
            escapeCSVField(task.title),
            task.column,
            escapeCSVField(column?.title || ''),
            task.scheduled || '',
            task.deadline || '',
            task.priority || '',
            escapeCSVField(task.tags),
            escapeCSVField(task.description),
            task.order ?? '',
            task.archived ? 'true' : 'false'
        ];

        // Add metadata only in the first row
        if (index === 0) {
            const metadata = {
                columns,
                settings,
                viewMode,
                splitRatio,
                exportDate: new Date().toISOString()
            };
            // Stringify and let escapeCSVField handle quotes by doubling
            rowData.push(escapeCSVField(JSON.stringify(metadata)));
        } else {
            rowData.push('');
        }

        return rowData.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
};

// Helper function to parse a single CSV line
const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let insideQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];
        const nextChar = i + 1 < line.length ? line[i + 1] : null;

        if (!insideQuotes) {
            // Outside quotes
            if (char === '"') {
                // Start of quoted field
                insideQuotes = true;
                i++;
            } else if (char === ',') {
                // Field separator
                result.push(current);
                current = '';
                i++;
            } else {
                // Regular character in unquoted field
                current += char;
                i++;
            }
        } else {
            // Inside quotes - prioritize double-quote escape
            if (char === '"' && nextChar === '"') {
                // Double quote escape: "" -> "
                current += '"';
                i += 2;
            } else if (char === '"') {
                // End of quoted field
                insideQuotes = false;
                i++;
            } else if (char === '\\' && nextChar) {
                // Backslash escape sequences
                if (nextChar === '\\') {
                    current += '\\';
                    i += 2;
                } else if (nextChar === '"') {
                    current += '"';
                    i += 2;
                } else if (nextChar === 'n') {
                    current += '\n';
                    i += 2;
                } else if (nextChar === 'r') {
                    current += '\r';
                    i += 2;
                } else {
                    // Unknown escape - keep backslash
                    current += char;
                    i++;
                }
            } else {
                // Regular character inside quotes
                current += char;
                i++;
            }
        }
    }

    // Add last field
    result.push(current);

    return result;
};

// Robust CSV parsing via PapaParse
export const parseCSVToTasks = (csvContent: string) => {
    const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        // Let PapaParse auto-detect newline and quote/escape style
    });

    if (parsed.errors && parsed.errors.length > 0) {
        const firstErr = parsed.errors[0];
        throw new Error(`CSV parse error at row ${firstErr.row}: ${firstErr.message}`);
    }

    const rows = parsed.data as any[];
    const tasks = [] as any[];
    let metadata: any = null;

    rows.forEach((row, idx) => {
        // Read metadata from first data row
        if (idx === 0 && row.MetaData) {
            try {
                metadata = JSON.parse(row.MetaData);
            } catch (e) {
                console.warn('Could not parse metadata from CSV - file may be in old format');
            }
        }

        // Build task from row
        const task: any = {
            id: row.ID ? parseInt(row.ID) : Date.now() + idx,
            title: row.Title || '',
            column: row.Column || 'todo',
            scheduled: row.Scheduled || null,
            deadline: row.Deadline || null,
            priority: row.Priority || '',
            tags: row.Tags || '',
            description: row.Description || '',
            order: row.Order ? parseInt(row.Order) : 0,
            archived: row.Archived === 'true' ? true : false,
        };

        if (task.title) {
            tasks.push(task);
        }
    });

    return { tasks, metadata };
};

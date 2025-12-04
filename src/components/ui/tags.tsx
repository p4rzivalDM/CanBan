import React, { useEffect, useState, useRef } from 'react';
// Removing shadcn Popover/Command for a simple inline suggestions menu
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from './context-menu';

type Props = {
    id: string;
    value?: string | string[];
    onChange?: (newValue: string) => void;
    placeholder?: string;
    suggestions?: string[];
};

const TagInput: React.FC<Props> = ({ id, value = '', onChange = () => {}, placeholder = 'Tags (separate with space)', suggestions }) => {
    const [input, setInput] = useState('');
    const [tags, setTags] = useState<string[]>(() => {
        if (Array.isArray(value)) return value.filter(Boolean);
        if (typeof value === 'string' && value.length > 0) return value.split(/\s+/).filter(Boolean);
        return [];
    });
    const prevEmittedRef = useRef<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    // no blur suppression needed in simple mode
    const builtin = ['#backend', '#frontend', '#devops', '#bug', '#feature'];
    const suggestionsList = (suggestions && suggestions.length > 0) ? suggestions : builtin;
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    // cleaned: no active index or focus-driven inline list

    useEffect(() => {
        let fromValue: string[] = [];
        if (Array.isArray(value)) fromValue = value.filter(Boolean);
        else if (typeof value === 'string' && value.length > 0) fromValue = value.split(/\s+/).filter(Boolean);
        const same = fromValue.length === tags.length && fromValue.every((t, i) => t === tags[i]);
        if (!same) setTags(fromValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
        const joined = tags.join(' ');
        if (prevEmittedRef.current !== joined) {
            prevEmittedRef.current = joined;
            onChange(joined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tags]);

    useEffect(() => {
        // filter suggestions based on current input (last tag being typed)
        const q = input.trim().replace(/^#/, '').toLowerCase();
        const base = suggestionsList.map(s => s.replace(/^#/, ''));
        const filtered = q.length === 0
            ? base.filter(s => !tags.includes(s))
            : base.filter(s => s.toLowerCase().startsWith(q) && !tags.includes(s));
        setFilteredSuggestions(filtered);
    }, [input, tags, suggestionsList]);

    const addTag = (raw: string) => {
        const t = raw.trim().replace(/^#/, '');
        if (!t) return;
        if (tags.includes(t)) return;
        setTags(prev => [...prev, t]);
    };

    const removeTag = (idx: number) => {
        setTags(prev => prev.filter((_, i) => i !== idx));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            return;
        }

        if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            if (input.trim()) { addTag(input); setInput(''); }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) { addTag(input); setInput(''); }
        } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
            setTags(prev => prev.slice(0, -1));
        }
    };

    const handleBlur = () => {
        if (input.trim()) { addTag(input); setInput(''); }
    };

    return (
        <div className="relative overflow-visible flex flex-wrap items-center gap-2 border rounded-md p-2 min-h-[42px]">
            {tags.map((t, i) => (
                <span key={t + i} className="flex items-center gap-2 bg-white border px-2 py-0.5 rounded-md text-sm">
                    <span className="text-gray-600">#{t}</span>
                    <button type="button" onClick={() => removeTag(i)} className="text-gray-400 hover:text-gray-700">×</button>
                </span>
            ))}
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <input
                        id={id}
                        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                        ref={(el) => { inputRef.current = el; }}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        placeholder={tags.length === 0 ? placeholder : ''}
                    />
                </ContextMenuTrigger>
                <ContextMenuContent className="min-w-[220px] max-h-60 overflow-y-auto">
                    <ContextMenuLabel>Tag suggestions</ContextMenuLabel>
                    <ContextMenuSeparator />
                    {filteredSuggestions.length === 0 ? (
                        <ContextMenuItem disabled>No tags found</ContextMenuItem>
                    ) : (
                        filteredSuggestions.map((s) => (
                            <ContextMenuItem
                                key={s}
                                onClick={() => {
                                    addTag(s);
                                    setInput('');
                                    setTimeout(() => inputRef.current?.focus(), 0);
                                }}
                            >
                                #{s}
                            </ContextMenuItem>
                        ))
                    )}
                </ContextMenuContent>
            </ContextMenu>
            {/* inline suggestions removed; use right-click context menu for suggestions */}
        </div>
    );
};

export default TagInput;

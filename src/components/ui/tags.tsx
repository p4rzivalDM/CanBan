import React, { useEffect, useState, useRef } from 'react';

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
    // suggestions can be passed as prop; fallback to built-in list
    const builtin = ['#backend', '#frontend', '#devops', '#bug', '#feature'];
    const suggestionsList = (suggestions && suggestions.length > 0) ? suggestions : builtin;
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        // compute tags from incoming prop
        let fromValue: string[] = [];
        if (Array.isArray(value)) fromValue = value.filter(Boolean);
        else if (typeof value === 'string' && value.length > 0) fromValue = value.split(/\s+/).filter(Boolean);

        // avoid updating state if identical (shallow compare)
        const same = fromValue.length === tags.length && fromValue.every((t, i) => t === tags[i]);
        if (!same) setTags(fromValue);
    }, [value]);

    useEffect(() => {
        const joined = tags.join(' ');
        if (prevEmittedRef.current !== joined) {
            prevEmittedRef.current = joined;
            onChange(joined);
        }
    }, [tags]);

    useEffect(() => {
        // update suggestions filtered by current input
        const q = input.trim().replace(/^#/, '').toLowerCase();
        if (q.length === 0) {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
            return;
        }
        const filtered = suggestionsList
            .map(s => s.replace(/^#/, ''))
            .filter(s => s.toLowerCase().startsWith(q) && !tags.includes(s));
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setActiveSuggestionIndex(filtered.length > 0 ? 0 : -1);
    }, [input, tags]);


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
        // navigate suggestions
        if (showSuggestions && filteredSuggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex(i => Math.min(filteredSuggestions.length - 1, i + 1));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex(i => Math.max(0, i - 1));
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                const sel = filteredSuggestions[activeSuggestionIndex >= 0 ? activeSuggestionIndex : 0];
                if (sel) {
                    addTag(sel);
                    setInput('');
                    setShowSuggestions(false);
                    return;
                }
            }
        }

        if (e.key === 'Escape') {
            // close suggestion box
            setShowSuggestions(false);
            return;
        }

        if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            if (input.trim()) {
                addTag(input);
                setInput('');
            }
        } else if (e.key === 'Enter') {
            // if no suggestions, Enter should add tag too
            e.preventDefault();
            if (input.trim() && !showSuggestions) {
                addTag(input);
                setInput('');
            }
        } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
            // on backspace with empty input, remove last tag
            setTags(prev => prev.slice(0, -1));
        }
    };

    const handleBlur = () => {
        if (input.trim()) {
            addTag(input);
            setInput('');
        }
        // hide suggestions on blur
        setTimeout(() => setShowSuggestions(false), 100);
    };

    return (
        <div className="flex flex-wrap items-center gap-2 border rounded-md p-2 min-h-[42px]">
            {tags.map((t, i) => (
                <span key={t + i} className="flex items-center gap-2 bg-white border px-2 py-0.5 rounded-md text-sm">
                    <span className="text-gray-600">#{t}</span>
                    <button type="button" onClick={() => removeTag(i)} className="text-gray-400 hover:text-gray-700">×</button>
                </span>
            ))}
            <input
                id={id}
                className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                ref={(el) => { inputRef.current = el; }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={() => { if (filteredSuggestions.length > 0) setShowSuggestions(true); }}
                placeholder={tags.length === 0 ? placeholder : ''}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 mt-1 w-full max-w-md bg-white border rounded-md shadow-lg z-50">
                    <ul className="max-h-40 overflow-auto">
                        {filteredSuggestions.map((s, idx) => (
                            <li
                                key={s}
                                onMouseEnter={() => setActiveSuggestionIndex(idx)}
                                onMouseDown={(e) => {
                                    // prevent blur before click
                                    e.preventDefault();
                                    addTag(s);
                                    setInput('');
                                    setShowSuggestions(false);
                                    // restore focus to input
                                    setTimeout(() => inputRef.current?.focus(), 0);
                                }}
                                className={
                                    `px-3 py-2 cursor-pointer text-sm ${idx === activeSuggestionIndex ? 'bg-sky-100' : 'hover:bg-gray-50'}`
                                }
                            >
                                <span className="text-gray-700">#{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TagInput;

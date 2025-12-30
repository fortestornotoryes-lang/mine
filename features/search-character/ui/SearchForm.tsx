import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Users, X, History, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils'; // Используем твою утилиту cn

interface SearchFormProps {
    onSearch: (names: string[]) => void;
    isLoading: boolean;
}

const STORAGE_KEY = 'chaosage_search_history';
const MAX_HISTORY = 10;

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [activeHistoryField, setActiveHistoryField] = useState<1 | 2 | null>(null);

    // Загрузка истории
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }
    }, []);

    const saveToHistory = (names: string[]) => {
        setHistory(prev => {
            const newNames = names.map(n => n.trim()).filter(Boolean);
            // Очищаем дубликаты и берем последние 10
            const combined = Array.from(new Set([...newNames, ...prev])).slice(0, MAX_HISTORY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
            return combined;
        });
    };

    const removeFromHistory = (e: React.MouseEvent, nameToRemove: string) => {
        e.stopPropagation();
        setHistory(prev => {
            const filtered = prev.filter(h => h !== nameToRemove);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return filtered;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const names = [name1.trim(), name2.trim()].filter(Boolean);
        if (names.length > 0 && !isLoading) {
            saveToHistory(names);
            onSearch(names);
            setActiveHistoryField(null);
        }
    };

    // Мемоизируем фильтрованную историю для оптимизации
    const filteredHistory1 = useMemo(() =>
            history.filter(h => h.toLowerCase().includes(name1.toLowerCase())),
        [history, name1]);

    const filteredHistory2 = useMemo(() =>
            history.filter(h => h.toLowerCase().includes(name2.toLowerCase())),
        [history, name2]);

    const renderDropdown = (field: 1 | 2, items: string[], setter: (v: string) => void) => {
        if (activeHistoryField !== field || items.length === 0) return null;

        return (
            <div className="absolute z-[100] w-full mt-2 bg-[#161a20] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800/50 bg-slate-900/30 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">История</span>
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setActiveHistoryField(null)} />
                </div>
                <div className="max-h-48 overflow-y-auto">
                    {items.map((item) => (
                        <div
                            key={item}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/50 cursor-pointer transition-colors group"
                            onMouseDown={() => {
                                setter(item);
                                setActiveHistoryField(null);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <History className="h-3.5 w-3.5 text-slate-600" />
                                <span className="text-sm text-slate-300 group-hover:text-white">{item}</span>
                            </div>
                            <Trash2
                                className="h-3 w-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                onMouseDown={(e) => removeFromHistory(e, item)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Поле 1 */}
                <div className="relative">
                    <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4", name1 ? "text-blue-500" : "text-slate-600")} />
                    <input
                        value={name1}
                        onChange={(e) => setName1(e.target.value)}
                        onFocus={() => setActiveHistoryField(1)}
                        onBlur={() => setTimeout(() => setActiveHistoryField(null), 200)}
                        placeholder="Ник персонажа..."
                        className="w-full pl-11 pr-10 py-3.5 bg-[#161a20] border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                        disabled={isLoading}
                    />
                    {renderDropdown(1, filteredHistory1, setName1)}
                </div>

                {/* Поле 2 */}
                <div className="relative">
                    <Users className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4", name2 ? "text-purple-500" : "text-slate-600")} />
                    <input
                        value={name2}
                        onChange={(e) => setName2(e.target.value)}
                        onFocus={() => setActiveHistoryField(2)}
                        onBlur={() => setTimeout(() => setActiveHistoryField(null), 200)}
                        placeholder="Сравнить с..."
                        className="w-full pl-11 pr-10 py-3.5 bg-[#161a20] border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 outline-none transition-all"
                        disabled={isLoading}
                    />
                    {renderDropdown(2, filteredHistory2, setName2)}
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading || (!name1 && !name2)}
                className={cn(
                    "w-full py-4 rounded-xl font-bold tracking-widest transition-all",
                    isLoading || (!name1 && !name2)
                        ? "bg-slate-800 text-slate-500"
                        : "bg-white text-black hover:shadow-lg"
                )}
            >
                {isLoading ? "ЗАГРУЗКА..." : "АНАЛИЗИРОВАТЬ"}
            </button>
        </form>
    );
};
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Исправил импорт (motion/react -> framer-motion)
import { LegendId } from '@/entities/mine/model/types';
import { cn } from '@/shared/lib/utils';

interface LegendItem {
    id: LegendId;
    color: string;
    label: string;
}

const LEGEND_ITEMS: LegendItem[] = [
    { id: 'L_0_9', color: 'bg-[#00D992]', label: '0-9%' },
    { id: 'L_10_24', color: 'bg-[#FFC700]', label: '10-24%' },
    { id: 'L_25_49', color: 'bg-[#FF8A00]', label: '25-49%' },
    { id: 'L_50_74', color: 'bg-[#FF0000]', label: '50-74%' },
    { id: 'L_75_PLUS', color: 'bg-[#242931]', label: '75%+' },
];

interface MineLegendProps {
    activeFilters: LegendId[];
    onToggleFilter: (id: LegendId) => void;
}

export const MineLegend: React.FC<MineLegendProps> = ({ activeFilters, onToggleFilter }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(true);

            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                // Скрываем только если нет активных фильтров
                if (activeFilters.length === 0) {
                    setIsVisible(false);
                }
            }, 3000);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [activeFilters.length]);

    const show = isVisible || activeFilters.length > 0;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 50, opacity: 0, x: '-50%' }}
                    animate={{ y: 0, opacity: 1, x: '-50%' }}
                    exit={{ y: 50, opacity: 0, x: '-50%' }}
                    className="fixed bottom-8 left-1/2 z-[500] w-auto max-w-[95vw]"
                >
                    <div className="bg-[#0a0d12]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center gap-1">
                        <div className="px-3 border-r border-white/5 mr-1">
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Legend</p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-1">
                            {LEGEND_ITEMS.map((item) => {
                                const isActive = activeFilters.includes(item.id);

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onToggleFilter(item.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300",
                                            isActive
                                                ? 'bg-blue-600 border-blue-400 shadow-lg'
                                                : 'bg-white/5 border-transparent hover:border-white/10'
                                        )}
                                    >
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            item.color,
                                            isActive && "ring-2 ring-white/50"
                                        )} />
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest",
                                            isActive ? "text-white" : "text-slate-400"
                                        )}>
                      {item.label}
                    </span>
                                    </button>
                                );
                            })}
                        </div>

                        {activeFilters.length > 0 && (
                            <div className="ml-1 px-3 py-1.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-[8px] font-black text-blue-400 uppercase">
                                Filtered
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
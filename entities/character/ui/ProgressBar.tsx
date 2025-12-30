import React, { useMemo } from 'react';
import { motion } from 'framer-motion'; // Исправил импорт для консистентности проекта
import { cn } from '@/shared/lib/utils';

interface ProgressBarProps {
    current: number;
    max: number;
    label: string;
    color: string;
    icon?: React.ReactNode;
    compareCurrent?: number;
    compareMax?: number;
    compareColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
                                                            current,
                                                            max,
                                                            label,
                                                            color,
                                                            icon,
                                                            compareCurrent,
                                                            compareMax,
                                                            compareColor = 'bg-purple-500'
                                                        }) => {
    const percentage1 = Math.min(Math.max((current / (max || 1)) * 100, 0), 100);
    const isComparing = compareCurrent !== undefined && compareMax !== undefined;
    const percentage2 = isComparing ? Math.min(Math.max((compareCurrent / (compareMax || 1)) * 100, 0), 100) : 0;

    // Генерируем 10 сегментов для сетки (визуальный эффект)
    const segments = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);

    return (
        <div className="mb-4">
            {/* Header: Label and Values */}
            <div className="flex justify-between items-end mb-1.5 px-0.5">
                <div className="flex items-center gap-2">
                    {icon && <span className="opacity-80 scale-90">{icon}</span>}
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                </div>

                <div className="flex gap-3 text-right">
                    <div className="flex gap-1">
                        <span className="text-[12px] font-unbounded font-black text-white leading-none mb-0.5">
                            {current.toLocaleString()}
                        </span>/
                        <span className="text-[12px] font-unbounded font-black text-white leading-none mb-0.5">
                            {max.toLocaleString()}
                        </span>
                    </div>

                    {isComparing && (
                        <>
                            <div className="w-px h-5 bg-slate-800 self-center" />
                            <div className="flex gap-2">
                                <span className="text-[12px] font-unbounded font-black text-purple-400 leading-none mb-0.5">
                                    {compareCurrent.toLocaleString()}
                                </span>
                                /
                                <span className="text-[12px] font-unbounded font-black text-purple-400 leading-none mb-0.5">
                                    {compareMax.toLocaleString()}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bars Container */}
            <div className="space-y-1.5">
                {/* Main Bar */}
                <div className="h-2.5 w-full bg-[#06080b] rounded-md overflow-hidden border border-white/5 relative shadow-inner">
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-10 opacity-20">
                        {segments.map((i) => (
                            <div key={i} className="w-[1px] h-full bg-black/50" />
                        ))}
                    </div>

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage1}%` }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className={cn("h-full relative shadow-[0_0_15px_-2px_currentColor]", color)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                    </motion.div>
                </div>

                {/* Comparison Bar */}
                {isComparing && (
                    <div className="h-2 w-full bg-[#06080b] rounded-md overflow-hidden border border-white/5 relative opacity-80">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage2}%` }}
                            transition={{ duration: 1.2, ease: "circOut", delay: 0.1 }}
                            className={cn("h-full relative shadow-[0_0_10px_-2px_currentColor]", compareColor)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};
import React, { useState, useCallback, memo, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Crosshair } from 'lucide-react';
import { LevelResult, getDepletionColor, getLegendIdByValue, LegendId } from '@/entities/mine/model/types';
import { cn } from '@/shared/lib/utils';

const GRID_WIDTH = 21;
const GRID_HEIGHT = 13;
interface MineMapGridProps {

    result: LevelResult;

    activeFilters: LegendId[];

    isLoading?: boolean;

}
const GridCell = memo(({ x, y, value, isDimmed, onHover, onLeave }: any) => {
    const hasValue = value !== undefined;
    return (
        <motion.div
            initial={false}
            animate={{ opacity: isDimmed ? 0.1 : 1, scale: isDimmed ? 0.9 : 1 }}
            whileHover={hasValue && !isDimmed ? {
                scale: 1.2,
                zIndex: 50,
                filter: "brightness(1.3)",
                transition: { type: "spring", stiffness: 400, damping: 15 }
            } : {}}
            onMouseEnter={() => hasValue && onHover(x, y, value)}
            onMouseLeave={onLeave}
            className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 border border-white/5 flex items-center justify-center transition-colors duration-300",
                hasValue ? getDepletionColor(value) : "bg-transparent opacity-[0.02]",
                hasValue && "relative cursor-crosshair group/cell"
            )}
        >
            {hasValue && !isDimmed && (
                <span className="relative z-10 text-[9px] font-unbounded font-black text-black/90 select-none">{value}</span>
            )}
        </motion.div>
    );
}, (prev, next) => prev.value === next.value && prev.isDimmed === next.isDimmed);

export const MineMapGrid: React.FC<MineMapGridProps> = ({ result, activeFilters }) => {
    // 1. В стейте только данные, никаких координат!
    const [activeData, setActiveData] = useState<{x: number, y: number, val: number} | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 2. Двигаем тултип через CSS переменные (напрямую в DOM, без ререндера React)
    const handleGlobalMouseMove = useCallback((e: React.MouseEvent) => {
        if (containerRef.current) {
            containerRef.current.style.setProperty('--mouse-x', `${e.clientX + 20}px`);
            containerRef.current.style.setProperty('--mouse-y', `${e.clientY + 20}px`);
        }
    }, []);

    const handleHover = useCallback((x: number, y: number, val: number) => {
        setActiveData({ x, y, val });
    }, []);

    const handleLeave = useCallback(() => setActiveData(null), []);

    const gridRows = useMemo(() => {
        return Array.from({ length: GRID_HEIGHT }, (_, rowIndex) => {
            const y = GRID_HEIGHT - rowIndex;
            return (
                <div key={y} className="flex" shadow-none="true">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[10px] font-black text-slate-700">{y}</div>
                    {Array.from({ length: GRID_WIDTH }, (_, colIndex) => {
                        const x = colIndex + 1;
                        const value = result.data[x]?.[y];
                        const isDimmed = activeFilters.length > 0 && value !== undefined && !activeFilters.includes(getLegendIdByValue(value));
                        return <GridCell key={x} x={x} y={y} value={value} isDimmed={isDimmed} onHover={handleHover} onLeave={handleLeave} />;
                    })}
                </div>
            );
        });
    }, [result.data, activeFilters, handleHover, handleLeave]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleGlobalMouseMove}
            className="relative w-full flex justify-center"
        >
            <div className="relative group/map">
                <button onClick={() => setIsFullscreen(true)} className="absolute top-4 right-4 z-40 opacity-0 group-hover/map:opacity-100 p-3 bg-blue-600 text-white rounded-xl shadow-2xl transition-all hover:scale-110">
                    <Maximize2 className="h-4 w-4" />
                </button>

                <div className="bg-[#020408] rounded-2xl border border-slate-800/60 p-4 shadow-2xl">
                    <div className="flex mb-1.5">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-blue-500/40"><Crosshair className="h-4 w-4" /></div>
                        {Array.from({ length: GRID_WIDTH }, (_, i) => (
                            <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[10px] font-black text-slate-700 font-unbounded">{i + 1}</div>
                        ))}
                    </div>
                    {gridRows}
                </div>
            </div>

            {/* Тултип теперь "летает" на CSS переменных */}
            <AnimatePresence>
                {activeData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed z-[9999] pointer-events-none p-4 bg-slate-950/90 border border-blue-500/40 rounded-2xl shadow-2xl backdrop-blur-md min-w-[180px]"
                        style={{
                            left: 'var(--mouse-x)',
                            top: 'var(--mouse-y)',
                            position: 'fixed',
                        }}
                    >
                        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase">Sector {activeData.x}:{activeData.y}</span>
                            <span className="text-[16px] font-unbounded font-black text-white">{activeData.val}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-white/5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${activeData.val}%` }} className={cn("h-full", getDepletionColor(activeData.val))} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullscreen AnimatePresence ... (оставь как было) */}
        </div>
    );
};
import React, { useState, useCallback, memo, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Crosshair, ChevronsUp, ChevronsDown } from 'lucide-react';
import {
    LevelResult, getDepletionColor, getLegendIdByValue, LegendId,
    MINE_GRID_WIDTH, MINE_GRID_HEIGHT,
} from '@/entities/mine/model/types';
import { StairMarker, StairType } from '@/entities/mine/model/stairs';
import { cn } from '@/shared/lib/utils';

interface MineMapGridProps {
    result: LevelResult;
    activeFilters: LegendId[];
    isLoading?: boolean;
    editMode?: boolean;
    stairs?: StairMarker[];
    onCellClick?: (x: number, y: number) => void;
}

interface GridCellProps {
    x: number;
    y: number;
    value?: string;
    isDimmed: boolean;
    stairType?: StairType;
    editMode: boolean;
    onHover: (x: number, y: number, value?: string) => void;
    onLeave: () => void;
    onClick?: (x: number, y: number) => void;
}

const GridCell = memo(({ x, y, value, isDimmed, stairType, editMode, onHover, onLeave, onClick }: GridCellProps) => {
    const hasValue = value !== undefined;
    const isInteractive = hasValue || editMode || !!stairType;
    return (
        <motion.div
            initial={false}
            animate={{ opacity: isDimmed ? 0.1 : 1, scale: isDimmed ? 0.9 : 1 }}
            whileHover={isInteractive && !isDimmed ? {
                scale: 1.2,
                zIndex: 50,
                filter: "brightness(1.3)",
                transition: { type: "spring", stiffness: 400, damping: 15 }
            } : {}}
            onMouseEnter={() => isInteractive && onHover(x, y, value)}
            onMouseLeave={onLeave}
            onClick={() => editMode && onClick?.(x, y)}
            className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 border border-white/5 flex items-center justify-center transition-colors duration-300",
                hasValue ? getDepletionColor(value!) : (editMode ? "bg-slate-800/20" : "bg-transparent opacity-[0.02]"),
                hasValue && "relative cursor-crosshair group/cell",
                editMode && "relative cursor-pointer hover:ring-1 hover:ring-blue-400/60",
                !editMode && stairType && "relative"
            )}
        >
            {hasValue && !isDimmed && !stairType && (
                <span className="relative z-10 text-[9px] font-unbounded font-black text-black/90 select-none">{value}</span>
            )}
            {stairType && !isDimmed && (
                <span className={cn(
                    "absolute inset-0.5 z-20 flex items-center justify-center rounded-md shadow-lg pointer-events-none",
                    stairType === 'down'
                        ? "bg-orange-500/90 ring-2 ring-orange-300"
                        : "bg-cyan-500/90 ring-2 ring-cyan-300"
                )}>
                    {stairType === 'down'
                        ? <ChevronsDown className="h-4 w-4 text-black" />
                        : <ChevronsUp className="h-4 w-4 text-black" />}
                </span>
            )}
        </motion.div>
    );
}, (prev, next) =>
    prev.value === next.value &&
    prev.isDimmed === next.isDimmed &&
    prev.stairType === next.stairType &&
    prev.editMode === next.editMode
);

export const MineMapGrid: React.FC<MineMapGridProps> = ({ result, activeFilters, editMode = false, stairs, onCellClick }) => {
    // 1. В стейте только данные, никаких координат!
    const [activeData, setActiveData] = useState<{x: number, y: number, val?: string} | null>(null);
    const [, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Быстрый доступ к маркерам лестниц по координате
    const stairsMap = useMemo(() => {
        const map = new Map<string, StairType>();
        (stairs || []).forEach(s => map.set(`${s.x}:${s.y}`, s.type));
        return map;
    }, [stairs]);

    // 2. Двигаем тултип через CSS переменные (напрямую в DOM, без ререндера React)
    const handleGlobalMouseMove = useCallback((e: React.MouseEvent) => {
        if (containerRef.current) {
            containerRef.current.style.setProperty('--mouse-x', `${e.clientX + 20}px`);
            containerRef.current.style.setProperty('--mouse-y', `${e.clientY + 20}px`);
        }
    }, []);

    const handleHover = useCallback((x: number, y: number, val?: string) => {
        setActiveData({ x, y, val });
    }, []);

    const handleLeave = useCallback(() => setActiveData(null), []);

    const gridRows = useMemo(() => {
        return Array.from({ length: MINE_GRID_HEIGHT }, (_, rowIndex) => {
            const y = MINE_GRID_HEIGHT - rowIndex;
            return (
                <div key={y} className="flex" shadow-none="true">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[10px] font-black text-slate-700">{y}</div>
                    {Array.from({ length: MINE_GRID_WIDTH }, (_, colIndex) => {
                        const x = colIndex + 1;
                        const value = result.data[x]?.[y];
                        const isDimmed = activeFilters.length > 0 && value !== undefined && !activeFilters.includes(getLegendIdByValue(value));
                        return (
                            <GridCell
                                key={x}
                                x={x}
                                y={y}
                                value={value}
                                isDimmed={isDimmed}
                                stairType={stairsMap.get(`${x}:${y}`)}
                                editMode={editMode}
                                onHover={handleHover}
                                onLeave={handleLeave}
                                onClick={onCellClick}
                            />
                        );
                    })}
                </div>
            );
        });
    }, [result.data, activeFilters, stairsMap, editMode, onCellClick, handleHover, handleLeave]);

    const activeStair = activeData ? stairsMap.get(`${activeData.x}:${activeData.y}`) : undefined;

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

                <div className={cn(
                    "bg-[#020408] rounded-2xl border p-4 shadow-2xl transition-colors",
                    editMode ? "border-blue-500/40" : "border-slate-800/60"
                )}>
                    <div className="flex mb-1.5">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-blue-500/40"><Crosshair className="h-4 w-4" /></div>
                        {Array.from({ length: MINE_GRID_WIDTH }, (_, i) => (
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
                            <span className="text-[16px] font-unbounded font-black text-white">
                                {activeData.val !== undefined ? `${activeData.val}%` : '—'}
                            </span>
                        </div>
                        {activeData.val !== undefined && (
                            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-white/5">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${activeData.val}%` }} className={cn("h-full", getDepletionColor(activeData.val))} />
                            </div>
                        )}
                        {activeStair && (
                            <div className={cn(
                                "mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                activeStair === 'down' ? "text-orange-400" : "text-cyan-400"
                            )}>
                                {activeStair === 'down' ? <ChevronsDown className="h-3.5 w-3.5" /> : <ChevronsUp className="h-3.5 w-3.5" />}
                                {activeStair === 'down'
                                    ? `Спуск → этаж ${result.level + 1}`
                                    : `Подъём → этаж ${result.level - 1}`}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullscreen AnimatePresence ... (оставь как было) */}
        </div>
    );
};

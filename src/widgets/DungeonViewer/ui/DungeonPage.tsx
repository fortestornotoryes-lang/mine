import { useDungeon } from "@/widgets/DungeonViewer/model/useDungeon.ts";
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DungeonViewer } from "@/widgets/DungeonViewer/ui/DungeonViewer.tsx";
import { Controls } from "@/widgets/Controls/ui/Controls.tsx";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery.ts";
import { MobileControlsDrawer } from "@/widgets/Controls/ui/MobileControlsDrawer.tsx";

export const DungeonPage: React.FC = () => {
    const [isDrawMode, setIsDrawMode] = useState(false);
    const {
        grid,
        setGrid,
        userStart,
        settings,
        setSettings,
        pathResult,
        isCalculating,
        handleFileUpload,
        handleFileDownload,
        handleCellClick,
        handleStepClick,
    } = useDungeon({ isDrawMode });

    const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [isSettingsExpanded, setIsSettingsExpanded] = useState<boolean>(() => {
        if (isMobile) return false;
        try {
            const saved = localStorage.getItem('dungeonSettingsExpanded');
            return saved ? JSON.parse(saved) : true;
        } catch (e) {
            return true;
        }
    });

    useEffect(() => {
        if (!isMobile) {
            localStorage.setItem('dungeonSettingsExpanded', JSON.stringify(isSettingsExpanded));
        }
    }, [isSettingsExpanded, isMobile]);

    useEffect(() => {
        if (isCalculating) {
            setHoveredStepIndex(null);
        }
    }, [isCalculating]);

    const nextTarget = pathResult?.steps?.[0]?.to;
    
    const controlsProps = {
        settings,
        setSettings,
        onFileUpload: handleFileUpload,
        onFileDownload: handleFileDownload,
        pathResult,
        currentStart: pathResult?.path[0] || userStart || null,
        onStepHover: setHoveredStepIndex,
        onStepClick: handleStepClick,
        isDrawMode,
        setIsDrawMode,
    };

    return (
        <div className="flex h-full bg-slate-900 text-slate-100 font-sans overflow-hidden md:flex-row flex-col">
            <main className="flex-1 relative flex flex-col h-full overflow-hidden">
                {grid.length > 0 ? (
                    <div className="flex-1 h-full overflow-hidden relative">
                        <DungeonViewer
                            grid={grid}
                            setGrid={setGrid}
                            pathResult={pathResult}
                            startPoint={pathResult?.path[0] || userStart || null}
                            onCellClick={handleCellClick}
                            hoveredStepIndex={hoveredStepIndex}
                            nextTarget={nextTarget}
                            isDrawMode={isDrawMode}
                            setIsDrawMode={setIsDrawMode}
                        />

                        {isCalculating && (
                            <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-300">
                                <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 flex flex-col items-center gap-4">
                                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-white">Поиск пути</h3>
                                        <p className="text-slate-400 text-sm mt-1">
                                            {pathResult?.visitedObjectives && pathResult.visitedObjectives.length > 15
                                                ? "Анализ сложной карты..."
                                                : "Вычисление маршрута..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-4">
                        <h2 className="text-xl font-semibold mb-2">Карта не загружена</h2>
                        <p>Загрузите JSON файл подземелья, чтобы начать.</p>
                    </div>
                )}
            </main>

            <div className={`transition-opacity duration-300 ${isCalculating ? 'opacity-50 pointer-events-none' : ''}`}>
                {isMobile ? (
                    <MobileControlsDrawer {...controlsProps} />
                ) : (
                    <aside className="h-full z-10 shadow-2xl w-80 border-l border-slate-700">
                        <Controls
                            {...controlsProps}
                            isSettingsExpanded={isSettingsExpanded}
                            setIsSettingsExpanded={setIsSettingsExpanded}
                        />
                    </aside>
                )}
            </div>
        </div>
    );
};

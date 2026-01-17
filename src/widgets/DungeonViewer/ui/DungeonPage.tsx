import { useDungeon }                 from "@/widgets/DungeonViewer/model/useDungeon.ts";
import React, { useState, useEffect } from 'react';
import { Loader2 }                    from 'lucide-react';
import { DungeonViewer }              from "@/widgets/DungeonViewer/ui/DungeonViewer.tsx";
import { Controls }                   from "@/widgets/Controls/ui/Controls.tsx";

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

    const [isSettingsExpanded, setIsSettingsExpanded] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('dungeonSettingsExpanded');
            return saved ? JSON.parse(saved) : true;
        } catch (e) {
            return true;
        }
    });

    useEffect(() => {
        localStorage.setItem('dungeonSettingsExpanded', JSON.stringify(isSettingsExpanded));
    }, [isSettingsExpanded]);

    useEffect(() => {
        if (isCalculating) {
            setHoveredStepIndex(null);
        }
    }, [isCalculating]);

    const nextTarget = pathResult?.steps?.[0]?.to;

    return (
        <div className="flex h-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
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
                                        <h3 className="text-lg font-bold text-white">Поиск оптимального пути</h3>
                                        <p className="text-slate-400 text-sm mt-1">
                                            {pathResult?.visitedObjectives && pathResult.visitedObjectives.length > 50
                                                ? "Анализ сложной карты..."
                                                : "Вычисление маршрута..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <h2 className="text-xl font-semibold mb-2">Карта не загружена</h2>
                        <p>Загрузите JSON файл подземелья через меню слева, чтобы начать.</p>
                    </div>
                )}
            </main>

            <aside className={`h-full z-10 shadow-2xl transition-opacity duration-300 ${isCalculating ? 'opacity-50 pointer-events-none' : ''}`}>
                <Controls
                    settings={settings}
                    setSettings={setSettings}
                    isSettingsExpanded={isSettingsExpanded}
                    setIsSettingsExpanded={setIsSettingsExpanded}
                    onFileUpload={handleFileUpload}
                    onFileDownload={handleFileDownload}
                    pathResult={pathResult}
                    currentStart={pathResult?.path[0] || userStart || null}
                    onStepHover={setHoveredStepIndex}
                    onStepClick={handleStepClick}
                    isDrawMode={isDrawMode}
                    setIsDrawMode={setIsDrawMode}
                />
            </aside>
        </div>
    );
};

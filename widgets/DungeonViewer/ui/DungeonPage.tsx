import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 }                        from 'lucide-react';
import { Point }                          from "@/shared/types";
import { RawDungeonCell, CellType }       from "@/entities/dungeon/model/types.ts";
import { PathfinderSettings, PathResult } from "@/entities/path/model/types.ts";
import { solveDungeon }                   from "@/entities/path/lib/solver.ts";
import { DungeonViewer }                  from "@/widgets/DungeonViewer/ui/DungeonViewer.tsx";
import { Controls }                       from "@/widgets/Controls/ui/Controls.tsx";

// Хелпер для инициализации пустой карты
const INITIAL_GRID: RawDungeonCell[][] = [];

const DEFAULT_SETTINGS: PathfinderSettings = {
  avoidTraps: true,
  avoidGuards: true,
  algorithm: 'greedy',
  exitMode: 'stairs_down',
  objectivePriority: 'mixed' // По умолчанию без приоритета
};

export const DungeonPage: React.FC = () => {
  // Загружаем сетку из LS или используем пустую
  const [grid, setGrid] = useState<RawDungeonCell[][]>(() => {
    try {
        const savedGrid = localStorage.getItem('dungeonGrid');
        return savedGrid ? JSON.parse(savedGrid) : INITIAL_GRID;
    } catch (e) {
        return INITIAL_GRID;
    }
  });

  // Загружаем старт пользователя из LS
  const [userStart, setUserStart] = useState<Point | null>(() => {
      try {
          const savedStart = localStorage.getItem('dungeonUserStart');
          return savedStart ? JSON.parse(savedStart) : null;
      } catch (e) {
          return null;
      }
  });

  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Состояние развернутости настроек (с восстановлением из LS)
  const [isSettingsExpanded, setIsSettingsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dungeonSettingsExpanded');
      return saved ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  // Инициализация настроек из localStorage или дефолт
  const [settings, setSettings] = useState<PathfinderSettings>(() => {
    try {
      const saved = localStorage.getItem('dungeonPathfinderSettings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.warn('Failed to parse settings from local storage', e);
      return DEFAULT_SETTINGS;
    }
  });

  const [pathResult, setPathResult] = useState<PathResult | null>(null);

  // Сохранение настроек при изменении
  useEffect(() => {
    localStorage.setItem('dungeonPathfinderSettings', JSON.stringify(settings));
  }, [settings]);

  // Сохранение состояния развернутости настроек
  useEffect(() => {
    localStorage.setItem('dungeonSettingsExpanded', JSON.stringify(isSettingsExpanded));
  }, [isSettingsExpanded]);

  // Сохранение сетки при изменении (не сохраняем, если пустая, чтобы не забивать LS зря, хотя пустой массив тоже ок)
  useEffect(() => {
    if (grid.length > 0) {
        localStorage.setItem('dungeonGrid', JSON.stringify(grid));
    }
  }, [grid]);

  // Сохранение точки старта
  useEffect(() => {
      if (userStart) {
          localStorage.setItem('dungeonUserStart', JSON.stringify(userStart));
      } else {
          localStorage.removeItem('dungeonUserStart');
      }
  }, [userStart]);

  // Обработка загрузки файла
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && Array.isArray(json[0])) {
          setGrid(json);
          setUserStart(null); // Сброс ручного старта при загрузке новой карты
          setHoveredStepIndex(null);
        } else {
          alert('Неверная структура JSON. Ожидается двумерный массив.');
        }
      } catch (err) {
        alert('Не удалось прочитать JSON файл.');
      }
    };
    reader.readAsText(file);
    // Сбрасываем value инпута, чтобы можно было загрузить тот же файл повторно
    e.target.value = '';
  };

  // Обработка сохранения файла
  const handleFileDownload = () => {
    if (grid.length === 0) {
        alert("Нет данных карты для сохранения.");
        return;
    }
    const jsonString = JSON.stringify(grid, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dungeon_map.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Пересчет пути при изменении сетки, старта или настроек (Async)
  useEffect(() => {
    if (grid.length === 0) return;

    const calculatePath = async () => {
      setIsCalculating(true);
      // Небольшая задержка, чтобы React успел отрисовать лоадер
      await new Promise(r => setTimeout(r, 10)); 
      
      try {
        const result = await solveDungeon(grid, userStart, settings);
        setPathResult(result);
      } catch (e) {
        console.error("Ошибка при поиске пути:", e);
      } finally {
        setIsCalculating(false);
      }
    };

    calculatePath();
  }, [grid, userStart, settings]);

  const handleCellClick = useCallback((p: Point) => {
    if (!isCalculating) {
        setUserStart(p);
    }
  }, [isCalculating]);

  // Оптимизированное обновление ячейки
  const handleCellUpdate = useCallback((p: Point, newType: number) => {
    if (!isCalculating) {
        setGrid(prev => {
            // Оптимизация: Если значение не изменилось, не меняем стейт
            if (prev[p.y] && prev[p.y][p.x] && prev[p.y][p.x].f === newType) {
                return prev;
            }

            // Поверхностная копия массива строк для скорости (Immutable update pattern optimization)
            const newGrid = [...prev];
            // Копируем только измененную строку
            newGrid[p.y] = [...prev[p.y]];
            // Обновляем ячейку
            newGrid[p.y][p.x] = { ...prev[p.y][p.x], f: newType };
            return newGrid;
        });
    }
  }, [isCalculating]);

  const handleStepClick = (stepIndex: number) => {
    if (!pathResult || !pathResult.steps[stepIndex] || isCalculating) return;

    // Создаем копию сетки для мутации состояния (симуляция прогресса)
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    
    // Помечаем предыдущие шаги как выполненные
    for (let i = 0; i < stepIndex; i++) {
      const step = pathResult.steps[i];
      const { to, action } = step;
      
      if (newGrid[to.y] && newGrid[to.y][to.x]) {
          const cell = newGrid[to.y][to.x];

          if (action === 'press') {
            cell.f = CellType.ButtonPressed;
          } else if (action === 'explore') {
            cell.f = CellType.ExploredDeadlock;
          } else if (action === 'loot') {
            // Заменяем сундук на дорогу, чтобы не идти к нему снова
            cell.f = CellType.Road; 
          }
      }
    }

    setGrid(newGrid);
    setUserStart(pathResult.steps[stepIndex].from);
  };

  return (
    <div className="flex h-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Основная область карты */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {grid.length > 0 ? (
          <div className="flex-1 h-full overflow-hidden relative">
             <DungeonViewer 
                grid={grid} 
                pathResult={pathResult} 
                startPoint={pathResult?.path[0] || userStart || null}
                onCellClick={handleCellClick}
                onCellUpdate={handleCellUpdate}
                hoveredStepIndex={hoveredStepIndex}
             />
             
             {/* Лоадер оверлей */}
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

      {/* Боковая панель управления */}
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
        />
      </aside>
    </div>
  );
};

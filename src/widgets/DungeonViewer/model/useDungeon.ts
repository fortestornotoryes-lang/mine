import { DEFAULT_SETTINGS, INITIAL_GRID } from "@/entities/path/model/constants.ts";
import { useState, useEffect, useCallback } from 'react';
import { Point }                            from "@/shared/types";
import { RawDungeonCell, CellType }         from "@/entities/dungeon/model/types.ts";
import { PathResult, PathfinderSettings }   from "@/entities/path/model/types.ts";
import { solveDungeon }                     from "@/entities/path/lib/solver.ts";

export interface UseDungeonOptions {
  isDrawMode?: boolean;
}

export const useDungeon = (options?: UseDungeonOptions) => {
  const { isDrawMode = false } = options ?? {};

  const [grid, setGrid] = useState<RawDungeonCell[][]>(() => {
    try {
        const savedGrid = localStorage.getItem('dungeonGrid');
        return savedGrid ? JSON.parse(savedGrid) : INITIAL_GRID;
    } catch (e) {
        console.error("Failed to parse grid from local storage", e);
        return INITIAL_GRID;
    }
  });

  const [userStart, setUserStart] = useState<Point | null>(() => {
      try {
          const savedStart = localStorage.getItem('dungeonUserStart');
          return savedStart ? JSON.parse(savedStart) : null;
      } catch (e) {
          console.error("Failed to parse user start from local storage", e);
          return null;
      }
  });

  const [isCalculating, setIsCalculating] = useState(false);

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

  useEffect(() => {
    try {
      localStorage.setItem('dungeonPathfinderSettings', JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings to local storage", e);
    }
  }, [settings]);

  useEffect(() => {
    if (grid.length > 0) {
        try {
            localStorage.setItem('dungeonGrid', JSON.stringify(grid));
        } catch (e) {
            console.error("Failed to save grid to local storage", e);
        }
    }
  }, [grid]);

  useEffect(() => {
      try {
          if (userStart) {
              localStorage.setItem('dungeonUserStart', JSON.stringify(userStart));
          } else {
              localStorage.removeItem('dungeonUserStart');
          }
      } catch (e) {
          console.error("Failed to save user start to local storage", e);
      }
  }, [userStart]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && Array.isArray(json[0])) {
          setGrid(json);
          setUserStart(null);
          setPathResult(null);
        } else {
          console.error('Invalid JSON structure. Expected a 2D array.');
          alert('Неверная структура JSON. Ожидается двумерный массив.');
        }
      } catch (err) {
        console.error('Failed to read or parse JSON file.', err);
        alert('Не удалось прочитать JSON файл.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleFileDownload = () => {
    if (grid.length === 0) {
        alert("Нет данных карты для сохранения.");
        return;
    }
    try {
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
    } catch (e) {
        console.error("Failed to create download file.", e);
        alert("Не удалось создать файл для скачивания.");
    }
  };

  useEffect(() => {
    if (grid.length === 0) {
      if (pathResult) setPathResult(null);
      return;
    }

    if (isDrawMode) {
      return;
    }

    const calculatePath = async () => {
      setIsCalculating(true);
      await new Promise(r => setTimeout(r, 10)); 
      
      try {
        const result = await solveDungeon(grid, userStart, settings);
        setPathResult(result);
      } catch (e) {
        console.error("Pathfinding error:", e);
        setPathResult(null);
      } finally {
        setIsCalculating(false);
      }
    };

    calculatePath();
  }, [grid, userStart, settings, isDrawMode]);

  const handleCellClick = useCallback((p: Point) => {
    if (isCalculating || isDrawMode) return;
    setUserStart(p);
  }, [isCalculating, isDrawMode]);

  const handleStepClick = (stepIndex: number) => {
    if (!pathResult || !pathResult.steps[stepIndex] || isCalculating || isDrawMode) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    
    for (let i = 0; i < stepIndex; i++) {
      const step = pathResult.steps[i];
      const { to, action } = step;
      
      if (newGrid[to.y]?.[to.x]) {
          const cell = newGrid[to.y][to.x];
          if (action === 'press') cell.f = CellType.ButtonPressed;
          else if (action === 'explore') cell.f = CellType.ExploredDeadlock;
          else if (action === 'loot') cell.f = CellType.Road;
      }
    }
    setGrid(newGrid);
    setUserStart(pathResult.steps[stepIndex].from);
  };

  return {
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
  };
};

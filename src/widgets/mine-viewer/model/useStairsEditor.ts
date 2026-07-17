import { useState, useEffect, useCallback, useRef } from 'react';
import { MineInfo, MINES_DICT, MineDepletionData, LevelResult } from '@/entities/mine/model/types';
import {
    MAX_MINE_LEVEL,
    MineStairsData,
    StairMarker,
    StairType,
    StairsFloorFile,
    parseStairsFloorFile,
    stairsFileName,
    stairsStorageKey,
} from '@/entities/mine/model/stairs';
import { storage } from '@/shared/lib/storage';

export type StairTool = StairType | 'erase';

export interface ImportResult {
    /** Шахта, к которой относятся загруженные файлы (первый файл) */
    targetMineId: number | null;
    /** Этажи целевой шахты с данными клеток из файлов (если были сохранены) */
    floors: { level: number; cells?: MineDepletionData }[];
    /** Имена файлов, которые не удалось прочитать */
    failed: string[];
}

export const useStairsEditor = (mine: MineInfo) => {
    const [editorMode, setEditorMode] = useState(false);
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [tool, setTool] = useState<StairTool>('down');
    const [stairs, setStairs] = useState<MineStairsData>({});
    const [importError, setImportError] = useState<string | null>(null);

    const storageKey = stairsStorageKey(mine.id);

    const toolRef = useRef(tool);
    toolRef.current = tool;
    const storageKeyRef = useRef(storageKey);
    storageKeyRef.current = storageKey;
    const maxLevelRef = useRef(mine.maxLevel || MAX_MINE_LEVEL);
    maxLevelRef.current = mine.maxLevel || MAX_MINE_LEVEL;

    // Подгружаем маркеры выбранной шахты
    useEffect(() => {
        setStairs(storage.get<MineStairsData>(storageKey) || {});
    }, [storageKey]);

    /**
     * Клик по клетке в режиме редактора: ставит/меняет/стирает маркер текущим инструментом.
     * Этажи связаны: спуск на этаже N автоматически создаёт подъём на этаже N+1
     * в тех же координатах (и наоборот). Удаление и смена типа каскадно обновляют пару.
     */
    const applyTool = useCallback((level: number, x: number, y: number) => {
        setStairs(prev => {
            const activeTool = toolRef.current;
            const maxLevel = maxLevelRef.current;
            const existing = (prev[level] || []).find(s => s.x === x && s.y === y);

            const next = { ...prev };
            const write = (lvl: number, updater: (list: StairMarker[]) => StairMarker[]) => {
                const updated = updater(next[lvl] || []);
                if (updated.length > 0) next[lvl] = updated;
                else delete next[lvl];
            };
            const removeAt = (lvl: number, type?: StairType) =>
                write(lvl, list => list.filter(s => !(s.x === x && s.y === y && (!type || s.type === type))));
            const setAt = (lvl: number, type: StairType) =>
                write(lvl, list => [...list.filter(s => !(s.x === x && s.y === y)), { x, y, type }]);

            const pairLevel = (type: StairType, lvl: number) => (type === 'down' ? lvl + 1 : lvl - 1);
            const pairType = (type: StairType): StairType => (type === 'down' ? 'up' : 'down');
            const inBounds = (lvl: number) => lvl >= 1 && lvl <= maxLevel;

            // Убирает парную метку соседнего этажа (только если она зеркальная, чужие не трогаем)
            const removePair = (marker: StairMarker) => {
                const pl = pairLevel(marker.type, level);
                if (inBounds(pl)) removeAt(pl, pairType(marker.type));
            };

            if (activeTool === 'erase' || (existing && existing.type === activeTool)) {
                if (!existing) return prev;
                removeAt(level);
                removePair(existing);
            } else {
                if (existing) removePair(existing);
                setAt(level, activeTool);
                const pl = pairLevel(activeTool, level);
                if (inBounds(pl)) setAt(pl, pairType(activeTool));
            }

            storage.set(storageKeyRef.current, next);
            return next;
        });
    }, []);

    const clearLevel = useCallback((level: number) => {
        setStairs(prev => {
            if (!prev[level]) return prev;
            const next = { ...prev };
            delete next[level];
            storage.set(storageKeyRef.current, next);
            return next;
        });
    }, []);

    /**
     * Скачивает карты этажей отдельными файлами: "Название шахты(этаж).json".
     * В файл попадают и метки переходов, и снимок клеток этажа (если этаж отсканирован).
     */
    const exportFloors = useCallback((results: LevelResult[] = []) => {
        const cellsByLevel = new Map<number, MineDepletionData>();
        for (const res of results) {
            if (Object.keys(res.data).length > 0) cellsByLevel.set(res.level, res.data);
        }

        // Сохраняем этажи, где есть хоть что-то: метки переходов или данные клеток
        const targetLevels = [...new Set([
            ...Object.keys(stairs).map(Number).filter(lvl => (stairs[lvl] || []).length > 0),
            ...cellsByLevel.keys(),
        ])].sort((a, b) => a - b);

        targetLevels.forEach((level, index) => {
            const file: StairsFloorFile = {
                version: 1,
                mineId: mine.id,
                mineName: mine.name,
                level,
                stairs: stairs[level] || [],
                cells: cellsByLevel.get(level),
            };
            const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Небольшая задержка между скачиваниями, чтобы браузер не заблокировал серию файлов
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = url;
                a.download = stairsFileName(mine.name, level);
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }, index * 250);
        });

        return targetLevels.length;
    }, [stairs, mine.id, mine.name]);

    /** Массовая загрузка карт этажей из файлов (можно выбрать несколько) */
    const importFiles = useCallback(async (files: File[]): Promise<ImportResult> => {
        setImportError(null);
        const parsed: StairsFloorFile[] = [];
        const failed: string[] = [];

        for (const file of files) {
            try {
                const json = JSON.parse(await file.text());
                const floor = parseStairsFloorFile(json);
                if (!floor || !MINES_DICT.some(m => m.id === floor.mineId)) {
                    failed.push(file.name);
                } else {
                    parsed.push(floor);
                }
            } catch {
                failed.push(file.name);
            }
        }

        if (parsed.length === 0) {
            setImportError('Не удалось прочитать ни один файл карты');
            return { targetMineId: null, floors: [], failed };
        }

        // Сливаем файлы в хранилище каждой шахты
        const byMine = new Map<number, MineStairsData>();
        for (const floor of parsed) {
            const data = byMine.get(floor.mineId)
                ?? (storage.get<MineStairsData>(stairsStorageKey(floor.mineId)) || {});
            data[floor.level] = floor.stairs;
            byMine.set(floor.mineId, data);
        }
        for (const [mineId, data] of byMine) {
            storage.set(stairsStorageKey(mineId), data);
        }

        const targetMineId = parsed[0].mineId;
        if (byMine.has(mine.id)) {
            setStairs({ ...byMine.get(mine.id)! });
        }
        if (failed.length > 0) {
            setImportError(`Не прочитаны: ${failed.join(', ')}`);
        }

        const floors = parsed
            .filter(f => f.mineId === targetMineId)
            .map(f => ({ level: f.level, cells: f.cells }))
            .sort((a, b) => a.level - b.level);

        return { targetMineId, floors, failed };
    }, [mine.id]);

    const totalMarkers = Object.values(stairs).reduce((sum, list) => sum + list.length, 0);

    return {
        editorMode,
        setEditorMode,
        showSourceModal,
        setShowSourceModal,
        tool,
        setTool,
        stairs,
        totalMarkers,
        importError,
        setImportError,
        applyTool,
        clearLevel,
        exportFloors,
        importFiles,
    };
};

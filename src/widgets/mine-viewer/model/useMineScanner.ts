import { useState, useEffect, useCallback } from 'react';
import { ChaosApiService } from "@/shared/api/chaosApi.ts";
import { MINES_DICT, MineInfo, LevelResult, LegendId } from "@/entities/mine/model/types.ts";
import { storage } from "@/shared/lib/storage.ts";

const STORAGE_KEY = 'chaosage_mine_scanner_cache';

// То, что мы сохраняем (Настройки)
interface ScannerConfig {
    selectedMine: MineInfo;
    selectedFloors: number[];
    collapsedFloors: number[];
}

const initialConfig: ScannerConfig = {
    selectedMine: MINES_DICT[0],
    selectedFloors: [],
    collapsedFloors: []
};

export const useMineScanner = () => {
    // 1. Постоянный стейт (синхронизируется с хранилищем)
    const [config, setConfig] = useState<ScannerConfig>(initialConfig);
    const [isInitialized, setIsInitialized] = useState(false);

    // 2. Временный стейт (только для текущей сессии)
    const [results, setResults] = useState<LevelResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<LegendId[]>([]);

    // Загрузка конфига при монтировании
    useEffect(() => {
        const saved = storage.get<Partial<ScannerConfig>>(STORAGE_KEY);
        if (saved) {
            const mine = MINES_DICT.find(m => m.id === saved.selectedMine?.id) || MINES_DICT[0];
            setConfig({
                ...initialConfig,
                ...saved,
                selectedMine: mine
            });
        }
        setIsInitialized(true);
    }, []);

    // Автосохранение только конфига
    useEffect(() => {
        if (isInitialized) {
            storage.set(STORAGE_KEY, config);
        }
    }, [config, isInitialized]);

    const updateConfig = (patch: Partial<ScannerConfig>) => {
        setConfig(prev => ({ ...prev, ...patch }));
    };

    const toggleArrayItem = <T,>(array: T[], item: T): T[] =>
        array.includes(item) ? array.filter(i => i !== item) : [...array, item];

    // Обработчики
    const toggleFloor = (floor: number) =>
        updateConfig({ selectedFloors: toggleArrayItem(config.selectedFloors, floor) });

    const toggleCollapse = (floor: number) =>
        updateConfig({ collapsedFloors: toggleArrayItem(config.collapsedFloors, floor) });

    const toggleFilter = (id: LegendId) =>
        setActiveFilters(prev => toggleArrayItem(prev, id));

    const removeLevel = (lvl: number) =>
        setResults(prev => prev.filter(r => r.level !== lvl));

    // Открывает карточки этажей с данными из файлов (карты, загруженные с компьютера)
    const loadLevels = useCallback((floors: { level: number; data?: LevelResult['data'] }[], replace = false) => {
        setResults(prev => {
            const base = replace ? [] : [...prev];
            for (const floor of floors) {
                const idx = base.findIndex(r => r.level === floor.level);
                if (idx >= 0) {
                    base[idx] = { level: floor.level, data: floor.data ?? base[idx].data };
                } else {
                    base.push({ level: floor.level, data: floor.data ?? ({} as LevelResult['data']) });
                }
            }
            return base.sort((a, b) => a.level - b.level);
        });
    }, []);

    const reset = useCallback(() => {
        setConfig(initialConfig);
        setResults([]);
        setError(null);
        storage.remove(STORAGE_KEY);
    }, []);

    const startScan = async (floorsOverride?: number[]) => {
        const floors = Array.isArray(floorsOverride) ? floorsOverride : config.selectedFloors;
        if (floors.length === 0) {
            setError("Выберите хотя бы один этаж");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const promises = floors.map(async (level) => {
                try {
                    const data = await ChaosApiService.getMineDepletion(config.selectedMine.id, level);
                    return { level, data } as LevelResult;
                } catch {
                    return null;
                }
            });

            const allResults = await Promise.all(promises);
            const validResults = allResults.filter((r): r is LevelResult => r !== null);

            if (validResults.length === 0) {
                setError("Ошибка связи с сервером");
            } else {
                // Результаты сохраняются только в useState, но не в localStorage
                setResults(validResults.sort((a, b) => a.level - b.level));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Сканирует все возможные этажи выбранной шахты
    const scanAllFloors = () => {
        const allFloors = Array.from(
            { length: config.selectedMine.maxLevel || 40 },
            (_, i) => i + 1
        );
        updateConfig({ selectedFloors: allFloors });
        return startScan(allFloors);
    };

    return {
        ...config,
        results,
        isLoading,
        error,
        activeFilters,
        setSelectedMine: (mine: MineInfo) => updateConfig({ selectedMine: mine }),
        toggleFloor,
        removeLevel,
        loadLevels,
        toggleFilter,
        toggleCollapse,
        startScan,
        scanAllFloors,
        reset
    };
};
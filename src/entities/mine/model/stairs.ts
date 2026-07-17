import { MINE_GRID_WIDTH, MINE_GRID_HEIGHT, MineDepletionData } from './types';

export type StairType = 'up' | 'down';

export interface StairMarker {
    x: number;
    y: number;
    type: StairType;
}

/** Переходы по этажам шахты: номер этажа -> список лестниц */
export type MineStairsData = Record<number, StairMarker[]>;

/**
 * Формат файла карты одного этажа.
 * Имя файла: "Название шахты(этаж).json"
 */
export interface StairsFloorFile {
    version: 1;
    mineId: number;
    mineName?: string;
    level: number;
    stairs: StairMarker[];
    /** Снимок клеток этажа (выкопанность с сервера) — чтобы карта отображалась без повторного сканирования */
    cells?: MineDepletionData;
}

export const MAX_MINE_LEVEL = 40;

export const stairsStorageKey = (mineId: number) => `chaosage_mine_stairs_${mineId}`;

export const stairsFileName = (mineName: string, level: number) => `${mineName}(${level}).json`;

const isValidMarker = (m: any): m is StairMarker =>
    !!m &&
    Number.isInteger(m.x) && m.x >= 1 && m.x <= MINE_GRID_WIDTH &&
    Number.isInteger(m.y) && m.y >= 1 && m.y <= MINE_GRID_HEIGHT &&
    (m.type === 'up' || m.type === 'down');

/** Отбирает из cells только корректные координаты в пределах сетки */
const sanitizeCells = (raw: any): MineDepletionData | undefined => {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw !== 'object') return undefined;

    const cells: MineDepletionData = {};
    for (const xKey of Object.keys(raw)) {
        const x = Number(xKey);
        if (!Number.isInteger(x) || x < 1 || x > MINE_GRID_WIDTH) continue;
        const column = raw[xKey];
        if (!column || typeof column !== 'object') continue;

        for (const yKey of Object.keys(column)) {
            const y = Number(yKey);
            if (!Number.isInteger(y) || y < 1 || y > MINE_GRID_HEIGHT) continue;
            const value = column[yKey];
            if (typeof value !== 'string' && typeof value !== 'number') continue;
            (cells[x] ??= {})[y] = String(value);
        }
    }
    return Object.keys(cells).length > 0 ? cells : undefined;
};

/**
 * Валидирует и нормализует содержимое JSON-файла карты этажа.
 * Возвращает null, если структура файла некорректна.
 */
export const parseStairsFloorFile = (raw: any): StairsFloorFile | null => {
    if (!raw || typeof raw !== 'object') return null;
    if (!Number.isInteger(raw.mineId)) return null;
    if (!Number.isInteger(raw.level) || raw.level < 1 || raw.level > MAX_MINE_LEVEL) return null;
    if (!Array.isArray(raw.stairs) || !raw.stairs.every(isValidMarker)) return null;

    return {
        version: 1,
        mineId: raw.mineId,
        mineName: typeof raw.mineName === 'string' ? raw.mineName : undefined,
        level: raw.level,
        stairs: raw.stairs.map((m: StairMarker) => ({ x: m.x, y: m.y, type: m.type })),
        cells: sanitizeCells(raw.cells),
    };
};

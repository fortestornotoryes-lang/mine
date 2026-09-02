
import { MineInfo, MineData } from './types';
import { CellType } from './types';
export const MINES_DICT: MineInfo[] = [
    { name: 'Предгорная шахта', id: 1 },
    { name: 'Кимберлитовая шахта', id: 2 },
    { name: 'Корундовая шахта', id: 3 },
    { name: 'Шахта кобольдов', id: 4, maxLevel: 20 },
    { name: 'Шахта призраков', id: 5, maxLevel: 20 },
    { name: 'Титанитовая шахта', id: 6 }
];

export const DEFAULT_MAX_LEVEL = 40;

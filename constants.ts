
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
export const MIN_LEVEL = 1;

// Данные из вашего примера для использования в качестве fallback
export const MOCK_DATA: MineData = {
    "13":{"2":"8","4":"1","3":"12","1":"2","13":"0","7":"0"},
    "14":{"1":"6","13":"0","7":"0"},
    "15":{"1":"3","12":"0","11":"0","13":"0","7":"0"},
    "17":{"1":"7","13":"0","7":"0"},
    "18":{"1":"8","12":"0","13":"0","7":"2"},
    "16":{"1":"8","13":"0","2":"0","7":"0","3":"0"},
    "12":{"1":"0","13":"0","7":"0"},
    "19":{"13":"0","1":"2","7":"1"},
    "11":{"12":"0","11":"0","10":"0","13":"0","1":"2","7":"0","9":"0"},
    "8":{"12":"0","13":"0","7":"26","1":"3"},
    "7":{"13":"0","7":"48","1":"0"},
    "5":{"12":"0","13":"0","7":"21","1":"1"},
    "4":{"13":"0","7":"29","1":"0"},
    "6":{"13":"0","7":"28","2":"0","1":"0"},
    "20":{"1":"0"},
    "10":{"7":"3","13":"0","1":"0"},
    "9":{"7":"5","1":"1","2":"4","3":"0","13":"0"},
    "2":{"8":"26","9":"20","10":"25","11":"17","12":"3","13":"0","5":"6","2":"0","1":"0","4":"3","3":"0","6":"13","7":"15"},
    "21":{"1":"4","2":"1","3":"4","4":"0"},
    "3":{"7":"37"}
};


export const CELL_CONFIG: Record<number, { label: string; color: string; icon?: string }> = {
    [CellType.Empty]: { label: 'Wall', color: 'bg-slate-900' },
    [CellType.Road]: { label: 'Road', color: 'bg-slate-700' },
    [CellType.UnexploredDeadlock]: { label: 'Deadlock (Target)', color: 'bg-purple-900' },
    [CellType.ExploredDeadlock]: { label: 'Deadlock (Visited)', color: 'bg-purple-900/50' },
    [CellType.Enter]: { label: 'Entrance (Start)', color: 'bg-green-700' },
    [CellType.Button]: { label: 'Button (Target)', color: 'bg-red-600' },
    [CellType.stairsDown]: { label: 'Stairs Down (Exit)', color: 'bg-emerald-600' },
    [CellType.stairsUp]: { label: 'Stairs Up (Start)', color: 'bg-blue-500' },
    [CellType.Chest]: { label: 'Chest', color: 'bg-yellow-500' },
    [CellType.Trap]: { label: 'Trap', color: 'bg-orange-600' },
    [CellType.Guard]: { label: 'Guard', color: 'bg-rose-900' },
    [CellType.ButtonPressed]: { label: 'Button (Pressed)', color: 'bg-red-900' },
};

export const MAX_MAP_SIZE_DISPLAY = 2000; // px constraint if needed

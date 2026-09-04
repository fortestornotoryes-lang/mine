
export const MINE_GRID_WIDTH = 21;
export const MINE_GRID_HEIGHT = 13;

export interface MineInfo {
  name: string;
  id: number;
  maxLevel?: number;
}

export const MINES_DICT: MineInfo[] = [
  { name: 'Предгорная шахта', id: 1 },
  { name: 'Кимберлитовая шахта', id: 2 },
  { name: 'Корундовая шахта', id: 3 },
  { name: 'Шахта кобольдов', id: 4, maxLevel: 20 },
  { name: 'Шахта призраков', id: 5, maxLevel: 20 },
  { name: 'Титанитовая шахта', id: 6 }
];

export interface MineDepletionData {
  [sector: string]: {
    [resource: string]: string;
  };
}

export interface LevelResult {
  level: number;
  data: MineDepletionData;
}

/**
 * Идентификаторы категорий выработки для фильтрации
 */
export type LegendId = 'L_0_9' | 'L_10_24' | 'L_25_49' | 'L_50_74' | 'L_75_PLUS' | 'L_ERROR';

/**
 * Определяет категорию выработки на основе процента
 */
export const getLegendIdByValue = (value: string | number): LegendId => {
  const val = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(val)) return 'L_ERROR';
  if (val <= 9) return 'L_0_9';
  if (val <= 24) return 'L_10_24';
  if (val <= 49) return 'L_25_49';
  if (val <= 74) return 'L_50_74';
  return 'L_75_PLUS';
};

/**
 * Возвращает цвет ячейки на основе процента выработки
 */
export const getDepletionColor = (value: string | number): string => {
  const id = getLegendIdByValue(value);
  switch (id) {
    case 'L_0_9': return 'bg-[#00D992]';
    case 'L_10_24': return 'bg-[#FFC700]';
    case 'L_25_49': return 'bg-[#FF8A00]';
    case 'L_50_74': return 'bg-[#FF0000]';
    case 'L_75_PLUS': return 'bg-[#242931]';
    case 'L_ERROR': return 'bg-[#B300FF]';
    default: return 'bg-[#242931]';
  }
};

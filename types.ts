
export interface MineData {
  [row: string]: {
    [col: string]: string;
  };
}

export interface MineInfo {
  name: string;
  id: number;
  maxLevel?: number; // Опциональное поле для ограничения этажей
}

export interface GridCell {
  x: number;
  y: number;
  value: number;
}

export interface MultiLevelData {
  [level: number]: MineData | null;
}

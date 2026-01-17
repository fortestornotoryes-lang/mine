import { RawDungeonCell } from "@/entities/dungeon/model/types.ts";
import { PathfinderSettings } from "@/entities/path/model/types.ts";

// Хелпер для инициализации пустой карты
export const INITIAL_GRID: RawDungeonCell[][] = [];

// Настройки по умолчанию для поиска пути
export const DEFAULT_SETTINGS: PathfinderSettings = {
  avoidTraps: true,
  avoidGuards: true,
  algorithm: 'greedy',
  exitMode: 'stairs_down',
  objectivePriority: 'mixed',
  maxDeadlockOffset: undefined
};

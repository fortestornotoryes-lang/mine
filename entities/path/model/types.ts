import { Point } from '../../../shared/types';

/**
 * Настройки для поисковика пути.
 */
export interface PathfinderSettings {
  avoidTraps: boolean; // Избегать ловушек
  avoidGuards: boolean; // Избегать охраны
  algorithm: 'greedy' | 'optimal' | 'genetic' | 'simulated_annealing'; // Алгоритм поиска
  exitMode: 'stairs_up' | 'stairs_down'; // Какую лестницу считать выходом
  objectivePriority: 'mixed' | 'buttons_first' | 'deadlocks_first'; // Приоритет целей
}

/**
 * Сегмент пути (например, Старт -> Кнопка 1).
 */
export interface PathStep {
  from: Point;
  to: Point;
  pathSegment: Point[];
  action: 'move' | 'press' | 'explore' | 'loot' | 'exit';
}

/**
 * Результат работы алгоритма поиска.
 */
export interface PathResult {
  path: Point[];
  totalDistance: number;
  visitedObjectives: Point[];
  unreachableObjectives: Point[]; // Цели, до которых не удалось добраться
  isSolvable: boolean;
  steps: PathStep[]; // Сегментированный путь для визуализации
}

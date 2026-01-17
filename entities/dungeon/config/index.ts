import { CellType } from '../model/types';

// Сопоставление типов ячеек с читаемыми названиями и цветами
export const CELL_CONFIG: Record<number, { label: string; color: string; icon?: string }> = {
  [CellType.Empty]: { label: 'Стена', color: 'bg-slate-900' },
  [CellType.Road]: { label: 'Дорога', color: 'bg-slate-700' },
  [CellType.UnexploredDeadlock]: { label: 'Тупик (Цель)', color: 'bg-purple-900' },
  [CellType.ExploredDeadlock]: { label: 'Тупик (Посещен)', color: 'bg-purple-900/50' },
  [CellType.Enter]: { label: 'Вход (Старт)', color: 'bg-green-700' },
  [CellType.Button]: { label: 'Кнопка (Цель)', color: 'bg-red-600' },
  [CellType.stairsDown]: { label: 'Лестница вниз (Старт)', color: 'bg-emerald-600' },
  [CellType.stairsUp]: { label: 'Лестница вверх (Выход)', color: 'bg-blue-500' },
  [CellType.Chest]: { label: 'Сундук', color: 'bg-yellow-500' },
  [CellType.Trap]: { label: 'Ловушка', color: 'bg-orange-600' },
  [CellType.Guard]: { label: 'Охранник', color: 'bg-rose-900' },
  [CellType.ButtonPressed]: { label: 'Кнопка (Нажата)', color: 'bg-red-900' },
};

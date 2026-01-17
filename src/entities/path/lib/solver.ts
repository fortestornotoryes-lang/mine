import { Point } from '@/shared/types';
import { CellType, RawDungeonCell } from '../../dungeon/model/types';
import { PathfinderSettings, PathResult, PathStep } from '../model/types';

/**
 * Вспомогательная функция для разблокировки UI.
 * Позволяет браузеру отрисовать кадр во время тяжелых вычислений.
 */
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Проверяет проходимость клетки.
 */
const isWalkable = (
  cellType: number,
  settings: PathfinderSettings,
  isGrateOpen: boolean = true
): boolean => {
  if (cellType === CellType.Empty) return false;
  if (settings.avoidTraps && cellType === CellType.Trap) return false;
  if (settings.avoidGuards && cellType === CellType.Guard) return false;
  if (cellType === CellType.Grate && !isGrateOpen) return false;
  return true;
};

/**
 * Получить соседей для BFS.
 */
const getNeighbors = (p: Point, rows: number, cols: number): Point[] => {
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  const res: Point[] = [];
  for (const [dx, dy] of dirs) {
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
      res.push({ x: nx, y: ny });
    }
  }
  return res;
};

/**
 * BFS для поиска пути между двумя точками.
 */
const getPath = (
  grid: RawDungeonCell[][],
  start: Point,
  target: Point,
  settings: PathfinderSettings,
  isGrateOpen: boolean = true
): Point[] | null => {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue: Point[] = [start];
  const cameFrom = new Map<string, Point>();
  const visited = new Set<string>();
  const startKey = `${start.x},${start.y}`;
  const targetKey = `${target.x},${target.y}`;
  
  visited.add(startKey);

  if (start.x === target.x && start.y === target.y) return [start];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x === target.x && current.y === target.y) break;

    for (const next of getNeighbors(current, rows, cols)) {
      const key = `${next.x},${next.y}`;
      if (!visited.has(key)) {
        const cell = grid[next.y][next.x];
        const isTarget = next.x === target.x && next.y === target.y;
        if (isWalkable(cell.f, settings, isGrateOpen) || isTarget) {
          visited.add(key);
          cameFrom.set(key, current);
          queue.push(next);
        }
      }
    }
  }

  if (!cameFrom.has(targetKey)) return null;

  const path: Point[] = [];
  let curr: Point | undefined = target;
  while (curr) {
    path.push(curr);
    curr = cameFrom.get(`${curr.x},${curr.y}`);
  }
  return path.reverse();
};

/**
 * BFS "Один ко многим".
 */
const getDistancesToTargets = (
    grid: RawDungeonCell[][],
    start: Point,
    targets: Point[],
    settings: PathfinderSettings,
    isGrateOpen: boolean = true
): number[] => {
    const rows = grid.length;
    const cols = grid[0].length;
    const dists = new Map<string, number>();
    const queue: Point[] = [start];
    
    dists.set(`${start.x},${start.y}`, 0);
    
    const targetMap = new Map<string, number>();
    targets.forEach((t, i) => targetMap.set(`${t.x},${t.y}`, i));
    
    const results = new Array(targets.length).fill(Infinity);
    let targetsFound = 0;

    const startIdx = targetMap.get(`${start.x},${start.y}`);
    if (startIdx !== undefined) {
        results[startIdx] = 0;
        targetsFound++;
    }

    while (queue.length > 0) {
        const u = queue.shift()!;
        const d = dists.get(`${u.x},${u.y}`)!;

        if (targetsFound === targets.length) break;

        for (const v of getNeighbors(u, rows, cols)) {
            const key = `${v.x},${v.y}`;
            if (!dists.has(key)) {
                const cell = grid[v.y][v.x];
                const isTarget = targetMap.has(key);
                
                if (isWalkable(cell.f, settings, isGrateOpen) || isTarget) {
                    dists.set(key, d + 1);
                    queue.push(v);
                    
                    const tIdx = targetMap.get(key);
                    if (tIdx !== undefined) {
                        results[tIdx] = d + 1;
                        targetsFound++;
                    }
                }
            }
        }
    }
    
    return results;
};

/**
 * Вспомогательная: Подсчет стоимости пути.
 */
const calculatePathCost = (path: number[], distMatrix: number[][], startToObjs: number[], objsToChest: number[]): number => {
    if (path.length === 0) return Infinity;
    let cost = startToObjs[path[0]];
    for (let i = 0; i < path.length - 1; i++) {
        cost += distMatrix[path[i]][path[i+1]];
    }
    cost += objsToChest[path[path.length - 1]];
    return cost;
};

// --- АЛГОРИТМЫ TSP ---

/**
 * 2-Opt оптимизатор (ASYNC).
 */
const optimize2OptAsync = async (path: number[], distMatrix: number[][], startToObjs: number[], objsToChest: number[]) => {
    let currentPath = [...path];
    const n = path.length;
    let improved = true;
    let iterations = 0;
    const MAX_ITERATIONS = 2000; 

    // Yield каждые N итераций, чтобы UI не вис
    const YIELD_EVERY = 50;

    while (improved && iterations < MAX_ITERATIONS) {
        if (iterations % YIELD_EVERY === 0) await yieldToMain();

        improved = false;
        const currentCost = calculatePathCost(currentPath, distMatrix, startToObjs, objsToChest);
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = i + 1; j < n; j++) {
                const newPath = [...currentPath];
                let left = i;
                let right = j;
                while (left < right) {
                    const temp = newPath[left];
                    newPath[left] = newPath[right];
                    newPath[right] = temp;
                    left++;
                    right--;
                }
                
                const newCost = calculatePathCost(newPath, distMatrix, startToObjs, objsToChest);
                
                if (newCost < currentCost) {
                    currentPath = newPath;
                    improved = true;
                    break;
                }
            }
            if (improved) break;
        }
        iterations++;
    }
    return currentPath;
}

/**
 * Оптимальный DP (Held-Karp). SYNC.
 */
const solveTspDp = (
    distMatrix: number[][], 
    startToObjs: number[],  
    objsToChest: number[]   
): number[] => {
    const n = distMatrix.length;
    const limit = 1 << n;
    
    const dp = Array(limit).fill(null).map(() => Array(n).fill(Infinity));
    const parent = Array(limit).fill(null).map(() => Array(n).fill(-1));

    for (let i = 0; i < n; i++) {
        dp[1 << i][i] = startToObjs[i];
    }

    for (let mask = 1; mask < limit; mask++) {
        for (let last = 0; last < n; last++) {
            if ((mask & (1 << last)) && dp[mask][last] !== Infinity) {
                for (let next = 0; next < n; next++) {
                    if (!(mask & (1 << next))) {
                        const newMask = mask | (1 << next);
                        const newDist = dp[mask][last] + distMatrix[last][next];
                        if (newDist < dp[newMask][next]) {
                            dp[newMask][next] = newDist;
                            parent[newMask][next] = last;
                        }
                    }
                }
            }
        }
    }

    const fullMask = limit - 1;
    let minTotal = Infinity;
    let lastNode = -1;

    for (let i = 0; i < n; i++) {
        const total = dp[fullMask][i] + objsToChest[i];
        if (total < minTotal) {
            minTotal = total;
            lastNode = i;
        }
    }

    if (lastNode === -1) return [];

    const pathIndices: number[] = [];
    let currMask = fullMask;
    let curr = lastNode;
    
    while (curr !== -1) {
        pathIndices.push(curr);
        const prev = parent[currMask][curr];
        currMask = currMask ^ (1 << curr);
        curr = prev;
    }

    return pathIndices.reverse();
};

/**
 * Простой жадный. SYNC.
 */
const solveTspGreedy = (
    distMatrix: number[][],
    startToObjs: number[],
    objsToChest: number[]
): number[] => {
    const n = distMatrix.length;
    let visited = new Set<number>();
    let currentPath: number[] = [];
    
    let bestStartIdx = -1;
    let minStartDist = Infinity;
    for(let i=0; i<n; i++) {
        if(startToObjs[i] < minStartDist) {
            minStartDist = startToObjs[i];
            bestStartIdx = i;
        }
    }
    
    if (bestStartIdx === -1) return [];
    
    currentPath.push(bestStartIdx);
    visited.add(bestStartIdx);
    
    let curr = bestStartIdx;
    while(visited.size < n) {
        let bestNext = -1;
        let minDist = Infinity;
        for(let i=0; i<n; i++) {
            if (!visited.has(i)) {
                if (distMatrix[curr][i] < minDist) {
                    minDist = distMatrix[curr][i];
                    bestNext = i;
                }
            }
        }
        if (bestNext !== -1) {
            currentPath.push(bestNext);
            visited.add(bestNext);
            curr = bestNext;
        } else {
            break; 
        }
    }
    return currentPath;
};


/**
 * Имитация отжига (ASYNC).
 */
const solveTspSimulatedAnnealingAsync = async (
    distMatrix: number[][],
    startToObjs: number[],
    objsToChest: number[]
): Promise<number[]> => {
    const n = distMatrix.length;
    
    let currentPath = solveTspGreedy(distMatrix, startToObjs, objsToChest);
    if (currentPath.length === 0) currentPath = Array.from({length: n}, (_, i) => i);
    
    let currentCost = calculatePathCost(currentPath, distMatrix, startToObjs, objsToChest);
    
    let bestPath = [...currentPath];
    let bestCost = currentCost;

    let temp = 2000;
    const coolingRate = 0.995; 
    const minTemp = 0.1;

    let iteration = 0;
    const YIELD_EVERY = 200; 

    while (temp > minTemp) {
        if (iteration % YIELD_EVERY === 0) await yieldToMain();
        iteration++;

        const newPath = [...currentPath];
        const i = Math.floor(Math.random() * n);
        const j = Math.floor(Math.random() * n);

        const mutationType = Math.random();
        if (mutationType < 0.5) {
            [newPath[i], newPath[j]] = [newPath[j], newPath[i]];
        } else if (mutationType < 0.9) {
            const start = Math.min(i, j);
            const end = Math.max(i, j);
            let l = start, r = end;
            while (l < r) {
                const t = newPath[l];
                newPath[l] = newPath[r];
                newPath[r] = t;
                l++; r--;
            }
        } else {
             const el = newPath.splice(i, 1)[0];
             newPath.splice(j, 0, el);
        }

        const newCost = calculatePathCost(newPath, distMatrix, startToObjs, objsToChest);

        if (newCost < currentCost || Math.exp((currentCost - newCost) / temp) > Math.random()) {
            currentPath = newPath;
            currentCost = newCost;
            
            if (currentCost < bestCost) {
                bestCost = currentCost;
                bestPath = [...currentPath];
            }
        }

        temp *= coolingRate;
    }

    return bestPath;
};

/**
 * Генетический алгоритм (ASYNC).
 */
const solveTspGeneticAsync = async (
    distMatrix: number[][],
    startToObjs: number[],
    objsToChest: number[]
): Promise<number[]> => {
    const n = distMatrix.length;
    const populationSize = n > 50 ? 200 : 100;
    const generations = n > 50 ? 1000 : 500;
    const mutationRate = 0.15;
    const eliteSize = 5;

    let population: number[][] = [];
    
    const greedy = solveTspGreedy(distMatrix, startToObjs, objsToChest);
    if(greedy.length > 0) population.push(greedy);

    const baseIndices = Array.from({length: n}, (_, i) => i);
    while (population.length < populationSize) {
        const shuffled = [...baseIndices].sort(() => Math.random() - 0.5);
        population.push(shuffled);
    }

    const evaluate = (ind: number[]) => calculatePathCost(ind, distMatrix, startToObjs, objsToChest);
    const YIELD_EVERY = 10;

    for (let gen = 0; gen < generations; gen++) {
        if (gen % YIELD_EVERY === 0) await yieldToMain();

        population.sort((a, b) => evaluate(a) - evaluate(b));
        
        const nextGen = population.slice(0, eliteSize); 

        while (nextGen.length < populationSize) {
            const tournamentSize = 5;
            let p1 = population[Math.floor(Math.random() * population.length)];
            for(let t=0; t<tournamentSize; t++) {
                const cand = population[Math.floor(Math.random() * population.length)];
                if (evaluate(cand) < evaluate(p1)) p1 = cand;
            }
            let p2 = population[Math.floor(Math.random() * population.length)];
             for(let t=0; t<tournamentSize; t++) {
                const cand = population[Math.floor(Math.random() * population.length)];
                if (evaluate(cand) < evaluate(p2)) p2 = cand;
            }

            const start = Math.floor(Math.random() * n);
            const end = Math.floor(Math.random() * (n - start)) + start;
            
            const child = Array(n).fill(-1);
            const childSet = new Set<number>();

            for(let i=start; i<=end; i++) {
                child[i] = p1[i];
                childSet.add(p1[i]);
            }

            let p2Idx = 0;
            for(let i=0; i<n; i++) {
                if (i >= start && i <= end) continue;
                while(p2Idx < n && childSet.has(p2[p2Idx])) {
                    p2Idx++;
                }
                if(p2Idx < n) {
                    child[i] = p2[p2Idx];
                    childSet.add(p2[p2Idx]);
                }
            }

            if (Math.random() < mutationRate) {
                const type = Math.random();
                if (type < 0.5) {
                    const i = Math.floor(Math.random() * n);
                    const j = Math.floor(Math.random() * n);
                    [child[i], child[j]] = [child[j], child[i]];
                } else {
                     const i = Math.floor(Math.random() * n);
                     const j = Math.floor(Math.random() * n);
                     const s = Math.min(i, j);
                     const e = Math.max(i, j);
                     const seg = child.slice(s, e + 1).reverse();
                     for(let k=0; k<seg.length; k++) child[s+k] = seg[k];
                }
            }

            nextGen.push(child);
        }
        population = nextGen;
    }

    population.sort((a, b) => evaluate(a) - evaluate(b));
    return population[0];
};


/**
 * Основная функция решения (Теперь ASYNC).
 */
export const solveDungeon = async (
  grid: RawDungeonCell[][],
  userStart: Point | null,
  settings: PathfinderSettings
): Promise<PathResult> => {
  await yieldToMain();

  const rows = grid.length;
  const cols = grid[0].length;

  let startPoint: Point | null = userStart;
  let exitPoint: Point | null = null;
  let chestPoint: Point | null = null;
  
  // Разделяем цели по типу
  const buttonObjectives: Point[] = [];
  const deadlockObjectives: Point[] = [];

  // Определяем тип целевого выхода на основе настроек
  const targetExitType = settings.exitMode === 'stairs_down' ? CellType.stairsDown : CellType.stairsUp;

  // 1. Сбор точек интереса
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const type = grid[y][x].f;
      const p = { x, y };

      if (type === CellType.Button) {
        buttonObjectives.push(p);
      } else if (type === CellType.UnexploredDeadlock) {
        deadlockObjectives.push(p);
      } else if (type === CellType.Chest) {
        chestPoint = p;
      } 
      
      // Логика Старт/Финиш на основе настроек
      if (type === targetExitType) {
          exitPoint = p;
      } else if (type === CellType.Enter) {
          // Enter всегда отличный кандидат на старт, если не задан ручной
          if (!userStart && !startPoint) startPoint = p; 
      } else if (type === CellType.stairsDown || type === CellType.stairsUp) {
          // Если это лестница, и она НЕ является целью выхода, то это потенциальный старт
          if (type !== targetExitType) {
              if (!userStart && !startPoint) startPoint = p;
          }
      }
    }
  }

  // Фолбеки для старта
  if (!startPoint) {
      outer: for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
              if (isWalkable(grid[y][x].f, settings, false)) {
                  startPoint = { x, y };
                  break outer;
              }
          }
      }
  }

  if (!startPoint) {
      return { isSolvable: false, path: [], totalDistance: 0, visitedObjectives: [], unreachableObjectives: [], steps: [] };
  }

  // Проверка: есть ли решетки и нужны ли кнопки?
  // По требованию: считаем, что сундук ВСЕГДА за решеткой, если на карте есть кнопки.
  const hasButtons = buttonObjectives.length > 0;
  const hasGrates = grid.some(row => row.some(cell => cell.f === CellType.Grate)) || hasButtons;

  // 1.1 Фильтрация тупиков по отступу от пути
  if (settings.maxDeadlockOffset !== undefined) {
      // Кнопки всегда являются частью "базового пути", но если мы хотим 
      // чтобы они исследовались ВМЕСТЕ с тупиками, они должны быть в одной группе TSP.
      
      // Сначала определим опорные точки (кнопки, сундук и выход), от которых строится основной маршрут
      const anchorPoints: Point[] = [...buttonObjectives];
      if (chestPoint) anchorPoints.push(chestPoint);
      if (exitPoint) anchorPoints.push(exitPoint);

      // Генерируем "базовый путь", который обязательно проходит через все кнопки, сундук и выход.
      // Используем более надежный способ: строим пути ко всем ключевым точкам.
      const refPathPoints = new Set<string>();
      
      const buildPathToAnchors = (start: Point, anchors: Point[]) => {
          let curr = start;
          refPathPoints.add(`${curr.x},${curr.y}`);
          const remaining = [...anchors];
          
          while (remaining.length > 0) {
              const dists = getDistancesToTargets(grid, curr, remaining, settings, true);
              let minDist = Infinity;
              let minIdx = -1;
              for (let i = 0; i < dists.length; i++) {
                  if (dists[i] < minDist) {
                      minDist = dists[i];
                      minIdx = i;
                  }
              }
              if (minIdx === -1) break;
              
              const target = remaining[minIdx];
              const path = getPath(grid, curr, target, settings, true);
              if (path) {
                  path.forEach(p => refPathPoints.add(`${p.x},${p.y}`));
                  curr = target;
              }
              remaining.splice(minIdx, 1);
          }
          return curr;
      };

      // 1. Путь через все кнопки
      let lastPos = buildPathToAnchors(startPoint, buttonObjectives);
      
      // 2. От последней кнопки (или старта) к сундуку
      if (chestPoint) {
          const pathToChest = getPath(grid, lastPos, chestPoint, settings, true);
          if (pathToChest) {
              pathToChest.forEach(p => refPathPoints.add(`${p.x},${p.y}`));
              lastPos = chestPoint;
          }
      }
      
      // 3. От сундука (или того, где остановились) к выходу
      if (exitPoint) {
          const pathToExit = getPath(grid, lastPos, exitPoint, settings, true);
          if (pathToExit) {
              pathToExit.forEach(p => refPathPoints.add(`${p.x},${p.y}`));
          }
      }
      
      const parsedRefPoints = Array.from(refPathPoints).map(s => {
          const [x, y] = s.split(',').map(Number);
          return { x, y };
      });

      // Теперь фильтруем тупики по расстоянию до этого базового пути
      const filterByOffset = (objectives: Point[]) => {
          const filtered: Point[] = [];
          for (const obj of objectives) {
              const distsToRef = getDistancesToTargets(grid, obj, parsedRefPoints, settings, true);
              const minDist = Math.min(...distsToRef);
              if (minDist <= settings.maxDeadlockOffset!) {
                  filtered.push(obj);
              }
          }
          return filtered;
      };

      const filteredDeadlocks = filterByOffset(deadlockObjectives);

      deadlockObjectives.length = 0;
      deadlockObjectives.push(...filteredDeadlocks);
  }

  // 1.2 Определение "поздних" тупиков (те, что на пути от сундука к выходу)
  const lateDeadlockObjectives: Point[] = [];
  const earlyDeadlockObjectives: Point[] = [];
  const buttonPriorityObjectives: Point[] = [];
  
  if (chestPoint && exitPoint) {
      // Строим путь от сундука к выходу
      const exitPath = getPath(grid, chestPoint, exitPoint, settings, true);
      if (exitPath) {
          const exitPathSet = new Set(exitPath.map(p => `${p.x},${p.y}`));
          
          for (const dl of deadlockObjectives) {
              // Если тупик находится непосредственно на пути к выходу или ОЧЕНЬ близко (1 шаг)
              // Мы можем использовать более широкий радиус, если нужно, но пока возьмем 1 шаг.
              // Или даже просто проверим расстояние до любой точки этого пути.
              const distsToExitPath = getDistancesToTargets(grid, dl, exitPath, settings, true);
              const minDistToExitPath = Math.min(...distsToExitPath);
              
              // Проверяем также расстояние до сундука
              const distToChest = getDistancesToTargets(grid, dl, [chestPoint], settings, true)[0];
              
              // Если тупик находится в пределах 2 шагов от пути сундук -> выход,
              // НО при этом он находится ДАЛЬШЕ от сундука, чем от какой-то точки пути к выходу (чтобы не забирать его ДО сундука)
              // На самом деле, если он рядом с сундуком, лучше его забрать ДО сундука, если мы идем К сундуку.
              // А если он дальше по коридору к выходу, то ПОСЛЕ.
              
              if (minDistToExitPath <= 2 && distToChest > 2) { 
                  lateDeadlockObjectives.push(dl);
              } else {
                  earlyDeadlockObjectives.push(dl);
              }
          }
      } else {
          earlyDeadlockObjectives.push(...deadlockObjectives);
      }
  } else {
      earlyDeadlockObjectives.push(...deadlockObjectives);
  }

  // 1.3 Поиск тупиков, которые ОЧЕНЬ близко к кнопкам
  if (buttonObjectives.length > 0 && earlyDeadlockObjectives.length > 0) {
      const earlyDLs = [...earlyDeadlockObjectives];
      earlyDeadlockObjectives.length = 0;
      
      for (const dl of earlyDLs) {
          const distsToButtons = getDistancesToTargets(grid, dl, buttonObjectives, settings, true);
          const minDist = Math.min(...distsToButtons);
          // Если тупик находится в пределах 2 шагов от любой кнопки, 
          // он пойдет в группу к кнопкам даже если приоритет раздельный (если решеток нет).
          // А если решетки есть, они и так в одной группе.
          if (minDist <= 2) {
              buttonPriorityObjectives.push(dl);
          } else {
              earlyDeadlockObjectives.push(dl);
          }
      }
  }
  
  // 2. Группировка целей в зависимости от приоритета
  let objectiveGroups: Point[][] = [];

  // Фаза 1: Кнопки и связанные с ними тупики
  if (hasButtons) {
      // Если есть кнопки, мы ДОЛЖНЫ их нажать (так как сундук заблокирован).
      // Исследуем их вместе со ВСЕМИ ранними тупиками.
      const combined = [...buttonObjectives, ...buttonPriorityObjectives, ...earlyDeadlockObjectives];
      if (combined.length > 0) objectiveGroups.push(combined);
  } else {
      // Решеток нет, обычная логика приоритетов
      const buttonGroup = [...buttonObjectives, ...buttonPriorityObjectives];

      if (settings.objectivePriority === 'buttons_first') {
          if (buttonGroup.length > 0) objectiveGroups.push(buttonGroup);
          if (earlyDeadlockObjectives.length > 0) objectiveGroups.push(earlyDeadlockObjectives);
      } else if (settings.objectivePriority === 'deadlocks_first') {
          if (earlyDeadlockObjectives.length > 0) objectiveGroups.push(earlyDeadlockObjectives);
          if (buttonGroup.length > 0) objectiveGroups.push(buttonGroup);
      } else {
          const combined = [...buttonGroup, ...earlyDeadlockObjectives];
          if (combined.length > 0) objectiveGroups.push(combined);
      }
  }

  // Фаза 2: Сундук (будет добавлен отдельно в цикле или как спец. группа)
  // В текущей реализации сундук идет после всех групп из objectiveGroups.
  // Нам нужно вставить поздние тупики МЕЖДУ сундуком и выходом.

  const fullPath: Point[] = [];
  const steps: PathStep[] = [];
  const allVisitedObjectives: Point[] = [];
  const allUnreachableObjectives: Point[] = [];
  
  let currentPos = startPoint;
  let gratesOpened = !hasButtons; // Решетки открыты, если кнопок нет изначально

  // 3. Последовательное решение для каждой группы целей (Кнопки + Ранние тупики)
  for (let gIdx = 0; gIdx < objectiveGroups.length; gIdx++) {
      const group = objectiveGroups[gIdx];
      
      // Проверяем, есть ли в этой группе кнопки. 
      // Если мы закончим группу, в которой были кнопки, нужно открыть решетки.
      const groupHasButtons = group.some(p => grid[p.y][p.x].f === CellType.Button);

      // 3.1 Фильтрация достижимых целей в текущей группе
      const reachableInGroup: Point[] = [];
      const distsFromCurrent = getDistancesToTargets(grid, currentPos, group, settings, gratesOpened);
      
      const groupIndices: number[] = [];
      
      distsFromCurrent.forEach((d, i) => {
        if (d === Infinity) {
            allUnreachableObjectives.push(group[i]);
        } else {
            reachableInGroup.push(group[i]);
            groupIndices.push(i);
        }
      });

      const n = reachableInGroup.length;
      if (n === 0) continue;

      // 3.2 Строим матрицу расстояний внутри группы
      const distMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
      // Расстояния от текущей позиции до целей
      const startToObjs = groupIndices.map(i => distsFromCurrent[i]);
      
      const objsToNext = Array(n).fill(0);
      let nextTarget = chestPoint || exitPoint;
      
      // Проверяем достижимость следующей глобальной цели (сундук или выход)
      let nextTargetReachable = false;
      if (nextTarget) {
           const d = getDistancesToTargets(grid, currentPos, [nextTarget], settings, gratesOpened)[0];
           if (d !== Infinity) nextTargetReachable = true;
      }
      
      for (let i = 0; i < n; i++) {
        if (i % 20 === 0) await yieldToMain();

        const dists = getDistancesToTargets(grid, reachableInGroup[i], reachableInGroup, settings, gratesOpened);
        for (let j = 0; j < n; j++) {
            distMatrix[i][j] = dists[j];
        }

        if (nextTarget && nextTargetReachable) {
             const d = getDistancesToTargets(grid, reachableInGroup[i], [nextTarget], settings, gratesOpened)[0];
             objsToNext[i] = d;
        } else {
             objsToNext[i] = 0;
        }
      }

      // 3.3 Решаем TSP для группы
      let orderIndices: number[] = [];
      switch (settings.algorithm) {
          case 'optimal':
              if (n <= 15) { // Уменьшим порог для DP, так как может вызываться несколько раз
                  orderIndices = solveTspDp(distMatrix, startToObjs, objsToNext);
              } else {
                  const rawPath = await solveTspSimulatedAnnealingAsync(distMatrix, startToObjs, objsToNext);
                  orderIndices = await optimize2OptAsync(rawPath, distMatrix, startToObjs, objsToNext);
              }
              break;
          case 'genetic':
              const geneticPath = await solveTspGeneticAsync(distMatrix, startToObjs, objsToNext);
              orderIndices = await optimize2OptAsync(geneticPath, distMatrix, startToObjs, objsToNext);
              break;
          case 'simulated_annealing':
              const saPath = await solveTspSimulatedAnnealingAsync(distMatrix, startToObjs, objsToNext);
              orderIndices = await optimize2OptAsync(saPath, distMatrix, startToObjs, objsToNext);
              break;
          case 'greedy':
          default:
               const greedyPath = solveTspGreedy(distMatrix, startToObjs, objsToNext);
               orderIndices = await optimize2OptAsync(greedyPath, distMatrix, startToObjs, objsToNext);
               break;
      }

      // 3.4 Реконструкция пути для группы
      for (const idx of orderIndices) {
          const target = reachableInGroup[idx];
          const path = getPath(grid, currentPos, target, settings, gratesOpened);
          if (path) {
              const seg = fullPath.length === 0 ? path : path.slice(1);
              fullPath.push(...seg);
              const action = grid[target.y][target.x].f === CellType.Button ? 'press' : 'explore';
              steps.push({ from: currentPos, to: target, pathSegment: path, action });
              currentPos = target;
              allVisitedObjectives.push(target);
          }
      }

      // Если в этой группе были кнопки, проверяем, не пора ли открыть решетки.
      // Мы открываем их, если ВСЕ кнопки нажаты.
      if (groupHasButtons) {
          const remainingButtons = buttonObjectives.filter(b => 
              !allVisitedObjectives.some(v => v.x === b.x && v.y === b.y) &&
              !allUnreachableObjectives.some(u => u.x === b.x && u.y === b.y)
          );
          if (remainingButtons.length === 0) {
              gratesOpened = true;
          }
      }
  }

  // 4. Сундук
  if (chestPoint) {
      const path = getPath(grid, currentPos, chestPoint, settings, gratesOpened);
      if (path) {
          const seg = fullPath.length === 0 ? path : path.slice(1);
          fullPath.push(...seg);
          steps.push({ from: currentPos, to: chestPoint, pathSegment: path, action: 'loot' });
          currentPos = chestPoint;
      } else {
          allUnreachableObjectives.push(chestPoint);
      }
  }

  // 5. Поздние тупики (те, что у выхода)
  if (lateDeadlockObjectives.length > 0) {
      const reachableLate: Point[] = [];
      const distsFromCurrent = getDistancesToTargets(grid, currentPos, lateDeadlockObjectives, settings, gratesOpened);
      const lateIndices: number[] = [];
      
      distsFromCurrent.forEach((d, i) => {
          if (d === Infinity) {
              allUnreachableObjectives.push(lateDeadlockObjectives[i]);
          } else {
              reachableLate.push(lateDeadlockObjectives[i]);
              lateIndices.push(i);
          }
      });
      
      const nLate = reachableLate.length;
      if (nLate > 0) {
          const distMatrixLate = Array(nLate).fill(0).map(() => Array(nLate).fill(0));
          const startToObjsLate = lateIndices.map(i => distsFromCurrent[i]);
          const objsToExitLate = Array(nLate).fill(0);
          
          let exitReachable = false;
          if (exitPoint) {
              const d = getDistancesToTargets(grid, currentPos, [exitPoint], settings, gratesOpened)[0];
              if (d !== Infinity) exitReachable = true;
          }
          
          for (let i = 0; i < nLate; i++) {
              if (i % 20 === 0) await yieldToMain();
              const dists = getDistancesToTargets(grid, reachableLate[i], reachableLate, settings, gratesOpened);
              for (let j = 0; j < nLate; j++) distMatrixLate[i][j] = dists[j];
              
              if (exitPoint && exitReachable) {
                  objsToExitLate[i] = getDistancesToTargets(grid, reachableLate[i], [exitPoint], settings, gratesOpened)[0];
              }
          }
          
          let orderLate: number[] = [];
          // Используем жадный алгоритм для поздних тупиков (обычно их мало)
          const rawLate = solveTspGreedy(distMatrixLate, startToObjsLate, objsToExitLate);
          orderLate = await optimize2OptAsync(rawLate, distMatrixLate, startToObjsLate, objsToExitLate);
          
          for (const idx of orderLate) {
              const target = reachableLate[idx];
              const path = getPath(grid, currentPos, target, settings, gratesOpened);
              if (path) {
                  const seg = fullPath.length === 0 ? path : path.slice(1);
                  fullPath.push(...seg);
                  steps.push({ from: currentPos, to: target, pathSegment: path, action: 'explore' });
                  currentPos = target;
                  allVisitedObjectives.push(target);
              }
          }
      }
  }

  // 5. Выход
  if (exitPoint) {
      const path = getPath(grid, currentPos, exitPoint, settings, gratesOpened);
      if (path) {
          const seg = fullPath.length === 0 ? path : path.slice(1);
          fullPath.push(...seg);
          steps.push({ from: currentPos, to: exitPoint, pathSegment: path, action: 'exit' });
      }
  }

  return {
    path: fullPath,
    totalDistance: fullPath.length > 0 ? fullPath.length - 1 : 0,
    visitedObjectives: allVisitedObjectives,
    unreachableObjectives: allUnreachableObjectives,
    isSolvable: allUnreachableObjectives.length === 0,
    steps
  };
};

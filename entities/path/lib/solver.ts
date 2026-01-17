import { Point } from '../../../shared/types';
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
  settings: PathfinderSettings
): boolean => {
  if (cellType === CellType.Empty) return false;
  if (settings.avoidTraps && cellType === CellType.Trap) return false;
  if (settings.avoidGuards && cellType === CellType.Guard) return false;
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
  settings: PathfinderSettings
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
        if (isWalkable(cell.f, settings) || isTarget) {
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
    settings: PathfinderSettings
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
                
                if (isWalkable(cell.f, settings) || isTarget) {
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
              if (isWalkable(grid[y][x].f, settings)) {
                  startPoint = { x, y };
                  break outer;
              }
          }
      }
  }

  if (!startPoint) {
      return { isSolvable: false, path: [], totalDistance: 0, visitedObjectives: [], unreachableObjectives: [], steps: [] };
  }
  
  // 2. Группировка целей в зависимости от приоритета
  let objectiveGroups: Point[][] = [];

  if (settings.objectivePriority === 'buttons_first') {
      if (buttonObjectives.length > 0) objectiveGroups.push(buttonObjectives);
      if (deadlockObjectives.length > 0) objectiveGroups.push(deadlockObjectives);
  } else if (settings.objectivePriority === 'deadlocks_first') {
      if (deadlockObjectives.length > 0) objectiveGroups.push(deadlockObjectives);
      if (buttonObjectives.length > 0) objectiveGroups.push(buttonObjectives);
  } else {
      // Mixed
      const allObjs = [...buttonObjectives, ...deadlockObjectives];
      if (allObjs.length > 0) objectiveGroups.push(allObjs);
  }

  const fullPath: Point[] = [];
  const steps: PathStep[] = [];
  const allVisitedObjectives: Point[] = [];
  const allUnreachableObjectives: Point[] = [];
  
  let currentPos = startPoint;

  // 3. Последовательное решение для каждой группы целей
  for (const group of objectiveGroups) {
      // 3.1 Фильтрация достижимых целей в текущей группе
      const reachableInGroup: Point[] = [];
      const distsFromCurrent = getDistancesToTargets(grid, currentPos, group, settings);
      
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
      // Расстояния от целей до "следующей точки".
      // Если это не последняя группа, следующей точкой будет "неважно" (0), так как мы просто хотим закончить группу.
      // Но глобально мы хотим закончить группу так, чтобы быть ближе к сундуку или выходу.
      // Упрощение: считаем стоимость до сундука (если есть и достижим) или до выхода.
      
      const objsToNext = Array(n).fill(0);
      let nextTarget = chestPoint || exitPoint;
      
      // Проверяем достижимость следующей глобальной цели (сундук или выход)
      let nextTargetReachable = false;
      if (nextTarget) {
           const d = getDistancesToTargets(grid, currentPos, [nextTarget], settings)[0];
           if (d !== Infinity) nextTargetReachable = true;
      }
      
      for (let i = 0; i < n; i++) {
        if (i % 20 === 0) await yieldToMain();

        const dists = getDistancesToTargets(grid, reachableInGroup[i], reachableInGroup, settings);
        for (let j = 0; j < n; j++) {
            distMatrix[i][j] = dists[j];
        }

        if (nextTarget && nextTargetReachable) {
             const d = getDistancesToTargets(grid, reachableInGroup[i], [nextTarget], settings)[0];
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
          const path = getPath(grid, currentPos, target, settings);
          if (path) {
              const seg = fullPath.length === 0 ? path : path.slice(1);
              fullPath.push(...seg);
              const action = grid[target.y][target.x].f === CellType.Button ? 'press' : 'explore';
              steps.push({ from: currentPos, to: target, pathSegment: path, action });
              currentPos = target;
              allVisitedObjectives.push(target);
          }
      }
  }

  // 4. Сундук
  if (chestPoint) {
      const path = getPath(grid, currentPos, chestPoint, settings);
      if (path) {
          const seg = fullPath.length === 0 ? path : path.slice(1);
          fullPath.push(...seg);
          steps.push({ from: currentPos, to: chestPoint, pathSegment: path, action: 'loot' });
          currentPos = chestPoint;
      } else {
          allUnreachableObjectives.push(chestPoint);
      }
  }

  // 5. Выход
  if (exitPoint) {
      const path = getPath(grid, currentPos, exitPoint, settings);
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

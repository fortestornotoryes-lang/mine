import { CellType, PathfinderSettings, PathResult, PathStep, Point, RawDungeonCell } from '../types';

/**
 * Determines if a cell is walkable based on settings.
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
 * Standard BFS to find shortest path between two points on a grid.
 */
const getShortestPath = (
  grid: RawDungeonCell[][],
  start: Point,
  target: Point,
  settings: PathfinderSettings
): Point[] | null => {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue: { x: number; y: number; path: Point[] }[] = [{ ...start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }, // Left
    { x: 1, y: 0 },  // Right
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === target.x && current.y === target.y) {
      return current.path;
    }

    for (const dir of directions) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;

      if (
        nx >= 0 && nx < cols &&
        ny >= 0 && ny < rows &&
        !visited.has(`${nx},${ny}`)
      ) {
        const cell = grid[ny][nx];
        // We can always walk onto the target
        const isTarget = nx === target.x && ny === target.y;
        
        if (isWalkable(cell.f, settings) || isTarget) {
          visited.add(`${nx},${ny}`);
          queue.push({ x: nx, y: ny, path: [...current.path, { x: nx, y: ny }] });
        }
      }
    }
  }

  return null;
};

/**
 * Main solver function.
 * Logic:
 * 1. Identify start (Enter or StairsUp), objectives (Buttons, UnexploredDeadlocks), Chest, Exit (StairsDown).
 * 2. Start -> Nearest Objective -> Next Nearest Objective ... -> Last Objective.
 * 3. Last Objective -> Chest.
 * 4. Chest -> Exit.
 */
export const solveDungeon = (
  grid: RawDungeonCell[][],
  userStart: Point | null,
  settings: PathfinderSettings
): PathResult => {
  const rows = grid.length;
  const cols = grid[0].length;

  let startPoint: Point | null = userStart;
  let exitPoint: Point | null = null;
  let chestPoint: Point | null = null;
  const objectives: Point[] = [];

  // 1. Scan Grid
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const type = grid[y][x].f;
      const p = { x, y };

      if (type === CellType.Button || type === CellType.UnexploredDeadlock) {
        objectives.push(p);
      } else if (type === CellType.Chest) {
        chestPoint = p;
      } else if (type === CellType.stairsDown) {
        exitPoint = p;
      } 

      // Default start points determination
      if (!userStart) {
        // Priority 1: Enter (5)
        if (type === CellType.Enter) {
             startPoint = p;
        }
        // Priority 2: StairsUp (8) if no Enter found yet (or overwrite if we prefer Enter? Let's assume Enter > StairsUp)
        // If we found Enter already, keep it. If not, check StairsUp.
        // Actually, let's store candidates and decide after loop.
      }
    }
  }

  // Refined Start Logic if not set by user
  if (!startPoint && !userStart) {
      // Find Enter
      for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
              if (grid[y][x].f === CellType.Enter) {
                  startPoint = {x,y}; break;
              }
          }
          if (startPoint) break;
      }
      // If no Enter, Find StairsUp
      if (!startPoint) {
           for (let y = 0; y < rows; y++) {
              for (let x = 0; x < cols; x++) {
                  if (grid[y][x].f === CellType.stairsUp) {
                      startPoint = {x,y}; break;
                  }
              }
              if (startPoint) break;
          }
      }
      // Fallback: First Walkable
      if (!startPoint) {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if(isWalkable(grid[y][x].f, settings)) {
                    startPoint = {x, y};
                    break;
                }
            }
            if(startPoint) break;
        }
      }
  }

  
  if (!startPoint) {
      return { isSolvable: false, path: [], totalDistance: 0, visitedObjectives: [], unreachableObjectives: [], steps: [] };
  }

  // 2. Greedy Nearest Neighbor Strategy
  
  let currentPos = startPoint;
  const fullPath: Point[] = [];
  const steps: PathStep[] = [];
  const visitedObjectives: Point[] = [];
  const unreachableObjectives: Point[] = [];
  
  const remainingObjectives = [...objectives];

  // Phase A: Clear all Objectives (Buttons + Deadlocks)
  while (remainingObjectives.length > 0) {
    let bestDist = Infinity;
    let bestPath: Point[] | null = null;
    let bestIndex = -1;

    for (let i = 0; i < remainingObjectives.length; i++) {
      const target = remainingObjectives[i];
      const path = getShortestPath(grid, currentPos, target, settings);
      
      if (path) {
        const dist = path.length - 1;
        if (dist < bestDist) {
          bestDist = dist;
          bestPath = path;
          bestIndex = i;
        }
      }
    }

    if (bestIndex !== -1 && bestPath) {
      const target = remainingObjectives[bestIndex];
      const segmentToAdd = fullPath.length === 0 ? bestPath : bestPath.slice(1);
      fullPath.push(...segmentToAdd);
      
      steps.push({
        from: currentPos,
        to: target,
        pathSegment: bestPath,
        action: grid[target.y][target.x].f === CellType.Button ? 'press' : 'explore'
      });

      currentPos = target;
      visitedObjectives.push(target);
      remainingObjectives.splice(bestIndex, 1);
    } else {
      unreachableObjectives.push(...remainingObjectives);
      break; 
    }
  }

  // Phase B: Get Chest
  if (chestPoint) {
    const pathToChest = getShortestPath(grid, currentPos, chestPoint, settings);
    if (pathToChest) {
       const segmentToAdd = fullPath.length === 0 ? pathToChest : pathToChest.slice(1);
       fullPath.push(...segmentToAdd);
       steps.push({
        from: currentPos,
        to: chestPoint,
        pathSegment: pathToChest,
        action: 'loot'
      });
      currentPos = chestPoint;
    } else {
        unreachableObjectives.push(chestPoint);
    }
  }

  // Phase C: Go to Exit
  if (exitPoint) {
    const pathToExit = getShortestPath(grid, currentPos, exitPoint, settings);
    if (pathToExit) {
        const segmentToAdd = fullPath.length === 0 ? pathToExit : pathToExit.slice(1);
        fullPath.push(...segmentToAdd);
        steps.push({
            from: currentPos,
            to: exitPoint,
            pathSegment: pathToExit,
            action: 'exit'
        });
    }
  }

  return {
    path: fullPath,
    totalDistance: fullPath.length > 0 ? fullPath.length - 1 : 0,
    visitedObjectives,
    unreachableObjectives,
    isSolvable: unreachableObjectives.length === 0,
    steps
  };
};

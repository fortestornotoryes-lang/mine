
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


/**
 * Enums representing the raw integer values from the JSON.
 */
export enum CellType {
    Empty = 0,
    Road = 2,
    UnexploredDeadlock = 3,
    ExploredDeadlock = 4,
    Enter = 5,
    Button = 6,
    stairsDown = 7, // Often the start point
    stairsUp = 8,   // Often the exit point
    Chest = 9,
    Trap = 22,
    Guard = 100,
    ButtonPressed = 106,
}

/**
 * Represents a single cell from the input JSON.
 */
export interface RawDungeonCell {
    f: number;
    comment: string;
}

/**
 * Coordinate point.
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * Configuration options for the pathfinder.
 */
export interface PathfinderSettings {
    avoidTraps: boolean;
    avoidGuards: boolean;
}

/**
 * Result of the pathfinding operation.
 */
export interface PathResult {
    path: Point[];
    totalDistance: number;
    visitedObjectives: Point[];
    unreachableObjectives: Point[];
    isSolvable: boolean;
    steps: PathStep[]; // Segmented path for visualization
}

/**
 * A segment of the path (e.g., Start -> Button 1).
 */
export interface PathStep {
    from: Point;
    to: Point;
    pathSegment: Point[];
    action: 'move' | 'press' | 'explore' | 'loot' | 'exit';
}

/**
 * Represents a node in the graph for BFS/Pathfinding.
 */
export interface GraphNode extends Point {
    distance: number;
    parent?: GraphNode;
}

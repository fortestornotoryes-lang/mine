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

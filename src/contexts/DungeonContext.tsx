// src/contexts/DungeonContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
} from "react";
import { type Tile } from "../types";

import { generateEncounter } from "../utils/generateEncounter";

type Grid = Tile[][];

const GRID_SIZE = 4;
const emptyTile: Tile = { visited: false };

const makeGrid = (): Grid =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ ...emptyTile }))
  );

export interface DungeonContextType {
  grid: Grid;
  player: { row: number; col: number };
  movePlayer: () => void;
  resetMap: () => void;
}

export const DungeonContext = createContext<
  DungeonContextType | undefined
>(undefined);

/* ------------------------------------------------------------------ */
export const DungeonProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  /* ---------- state ---------- */
  const [grid, setGrid] = useState<Grid>(makeGrid());
  const [player, setPlayer] = useState<{ row: number; col: number }>(() => ({
    row: Math.floor(Math.random() * GRID_SIZE),
    col: Math.floor(Math.random() * GRID_SIZE),
  }));

  /* ---------- initialise the starting tile ---------- */
  useEffect(() => {
    setGrid((prev) => {
      const next = prev.map((r) =>
        r.map((t) => ({ ...t }))
      );
      const t = next[player.row][player.col];
      t.visited = true;
      t.encounter = generateEncounter(); // <‑‑ new
      return next;
    });
  }, []); /* only once */

  /* ---------- helpers ---------- */
  const resetMap = () => {
    const newGrid = makeGrid();
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    const t = newGrid[r][c];
    t.visited = true;
    t.encounter = generateEncounter(); // <‑‑ new
    setGrid(newGrid);
    setPlayer({ row: r, col: c });
  };

  const movePlayer = () => {
    const { row, col } = player;

    const dirs = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];

    const candidates = dirs
      .map((d) => ({ row: row + d.dr, col: col + d.dc }))
      .filter(
        (p) =>
          p.row >= 0 &&
          p.row < GRID_SIZE &&
          p.col >= 0 &&
          p.col < GRID_SIZE &&
          !grid[p.row][p.col].visited
      );

    if (candidates.length === 0) {
      resetMap();
      return;
    }

    const chosen =
      candidates[Math.floor(Math.random() * candidates.length)];
    const newGrid = grid.map((r) => r.map((t) => ({ ...t })));

    // mark current tile as having moved to the new spot
    newGrid[row][col].wentTo = {
      row: chosen.row,
      col: chosen.col,
    };

    // mark new tile as visited and record where we came from
    const nextTile = {
      visited: true,
      cameFrom: { row, col },
    } as Tile;
    if (!nextTile.encounter) {
      nextTile.encounter = generateEncounter(); // <‑‑ new
    }
    newGrid[chosen.row][chosen.col] = nextTile;

    setGrid(newGrid);
    setPlayer({ row: chosen.row, col: chosen.col });
  };

  /* ---------- context value ---------- */
  return (
    <DungeonContext.Provider
      value={{ grid, player, movePlayer, resetMap }}
    >
      {children}
    </DungeonContext.Provider>
  );
};

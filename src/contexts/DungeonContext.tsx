// src/contexts/DungeonContext.tsx
import React, { createContext, useState, useEffect } from "react";
import type { Tile, Grid, Quest } from "../types";

import { generateEncounter } from "../utils/generateEncounter";
import { generateRandomQuest } from "../utils/generateRandomQuest";

const GRID_SIZE = 4;
const emptyTile: Tile = { visited: false };

const makeGrid = (): Grid =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ ...emptyTile }))
  );

export interface DungeonContextType {
  grid: Grid;
  player: { row: number; col: number };
  level: number;
  movePlayer: () => void;
  resetMap: () => void;
  setGrid?: React.Dispatch<React.SetStateAction<Grid>>;
  setLevel?: React.Dispatch<React.SetStateAction<number>>;
  quest: Quest;
  setQuest?: React.Dispatch<React.SetStateAction<Quest>>;
}

export const DungeonContext = createContext<DungeonContextType | undefined>(
  undefined
);

export const DungeonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [grid, setGrid] = useState<Grid>(makeGrid());
  const [player, setPlayer] = useState<{
    row: number;
    col: number;
  }>(() => ({
    row: Math.floor(Math.random() * GRID_SIZE),
    col: Math.floor(Math.random() * GRID_SIZE),
  }));
  const [level, setLevel] = useState<number>(1);
  const [quest, setQuest] = useState<Quest>(generateRandomQuest());

  useEffect(() => {
    setGrid((prev) => {
      const next = prev.map((r) => r.map((t) => ({ ...t })));
      const t = next[player.row][player.col];
      t.visited = true;
      t.encounter = generateEncounter();
      return next;
    });
  }, []);

  const resetMap = () => {
    const newGrid = makeGrid();
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    const t = newGrid[r][c];
    t.visited = true;
    t.encounter = generateEncounter();
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
      setLevel((prev) => prev + 1);
      resetMap();
      return;
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const newGrid = grid.map((r) => r.map((t) => ({ ...t })));

    newGrid[row][col].wentTo = {
      row: chosen.row,
      col: chosen.col,
    };

    const nextTile = {
      visited: true,
      cameFrom: { row, col },
      encounter: generateEncounter()
    } as Tile;
    newGrid[chosen.row][chosen.col] = nextTile;

    setGrid(newGrid);
    setPlayer({ row: chosen.row, col: chosen.col });
  };

  return (
    <DungeonContext.Provider
      value={{
        grid,
        player,
        level,
        movePlayer,
        resetMap,
        setGrid,
        setLevel,
        quest,
        setQuest
      }}
    >
      {children}
    </DungeonContext.Provider>
  );
};

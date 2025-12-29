// src/components/DungeonView.tsx
import React, { useContext } from "react";
import { DungeonContext } from "../contexts/DungeonContext";
import './DungeonView.css'

export const DungeonView: React.FC = () => {
  const ctx = useContext(DungeonContext);
  if (!ctx) throw new Error("DungeonView must be used inside DungeonProvider");

  const { grid, player, movePlayer } = ctx;

  /* ---------- helper that returns the image path for a tile ---------- */
  const getTileImage = (tile: typeof grid[0][0], r: number, c: number): string | undefined => {
    if (!tile.visited) return undefined;          // only visited tiles have an image

    // order: up, right, down, left
    const dirs = [
      { dr: -1, dc: 0 },   // up
      { dr: 0, dc: 1 },    // right
      { dr: 1, dc: 0 },     // down
      { dr: 0, dc: -1 }     // left
    ];

    const bits = dirs
      .map(({ dr, dc }) => {
        const nr = r + dr;
        const nc = c + dc;
        const isCameFrom =
          tile.cameFrom?.row === nr && tile.cameFrom.col === nc;
        const isWentTo =
          tile.wentTo?.row === nr && tile.wentTo.col === nc;
        return (isCameFrom || isWentTo) ? "1" : "0";
      })
      .join("");

    // images live in /public/assets/tiles/
    return `/assets/tiles/${bits}.png`;
  };

  /* ---------- render the map ---------- */
  return (
    <div>
      <div className="dungeon">
        {grid.map((row, i) =>
          row.map((tile, j) => {
            const isCurrent = i === player.row && j === player.col;
            const imgSrc = getTileImage(tile, i, j);

            return (
              <div
                key={`${i}-${j}`}
                className={`tile ${tile.visited ? "visited" : ""} ${
                  isCurrent ? "current" : ""
                }`}
              >
                {imgSrc && (
                  <img src={imgSrc} alt="floor" style={{ width: "100%", height: "100%" }} />
                )}
                {isCurrent && <span className="player-icon">🧍</span>}
              </div>
            );
          })
        )}
      </div>

      <button onClick={movePlayer} className="reset-btn">
        Move
      </button>
    </div>
  );
};

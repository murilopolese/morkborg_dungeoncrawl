// src/components/board/Board.tsx

import React, { type FC } from 'react';
import styles from './Board.module.scss';

export interface BoardProps {
  /** Title of the board (e.g. “USE”) */
  title: string;
  /** Content children – usually an action button or icon. */
  children?: React.ReactNode;
}

const Board: FC<BoardProps> = ({ title, children }) => (
  <div className={styles.board}>
    <span>{title}</span>
    {children}
  </div>
);

export default Board;

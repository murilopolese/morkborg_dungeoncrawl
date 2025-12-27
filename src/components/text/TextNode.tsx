// src/components/text/TextNode.tsx

import React, { type FC } from 'react';
import styles from './TextNode.module.scss';

export interface TextNodeProps {
  /** Plain text or JSX (you can use fragments). */
  children: React.ReactNode;
  /** Optional custom font size. */
  fontSize?: string;
  /** Color – defaults to the current text colour. */
  color?: string;
}

const TextNode: FC<TextNodeProps> = ({
  children,
  fontSize = '14px',
  color,
}) => (
  <span
    className={styles.text}
    style={{ fontSize, color }}
  >
    {children}
  </span>
);

export default TextNode;

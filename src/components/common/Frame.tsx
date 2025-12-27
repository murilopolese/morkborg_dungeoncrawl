// src/components/common/Frame.tsx

import React, { type FC, type HTMLAttributes } from 'react';
import styles from './Frame.module.scss';

export interface FrameProps extends HTMLAttributes<HTMLDivElement> {
  /** Flex direction: row | column (default column) */
  direction?: 'row' | 'column';
  /** Whether items should wrap */
  wrap?: boolean;
  /** Gap between children in px or rem */
  gap?: string;
}

const Frame: FC<FrameProps> = ({
  className,
  direction = 'column',
  wrap = false,
  gap = '10px',
  style,
  ...rest
}) => (
  <div
    {...rest}
    className={`${styles.frame} ${className ?? ''}`}
    style={{
      display: 'flex',
      flexDirection: direction,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      gap,
      ...style,
    }}
  />
);

export default Frame;

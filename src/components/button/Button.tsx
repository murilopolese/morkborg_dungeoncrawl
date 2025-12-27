// src/components/button/Button.tsx

import React, { type FC } from 'react';
import styles from './Button.module.scss';

export interface ButtonProps {
  /** The button label. */
  children: React.ReactNode;
  /** Optional icon (e.g., an SVG). */
  icon?: React.ReactNode;
  /** Callback when clicked. */
  onClick?: () => void;
}

const Button: FC<ButtonProps> = ({
  children,
  icon,
  onClick,
}) => (
  <button className={styles.button} onClick={onClick}>
    {icon}
    <span>{children}</span>
  </button>
);

export default Button;

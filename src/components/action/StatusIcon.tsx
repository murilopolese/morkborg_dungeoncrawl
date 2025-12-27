// src/components/action/StatusIcon.tsx

import React, { type FC } from 'react';
import styles from './StatusIcon.module.scss';

export type StatusType = 'poison' | 'freeze' | 'death';

interface Props {
  type: StatusType;
}

const mapLabel: Record<StatusType, string> = {
  poison: 'POISON',
  freeze: 'FREEZE',
  death: 'DEATH',
};

const StatusIcon: FC<Props> = ({ type }) => (
  <div className={styles.icon}>
    <span>{mapLabel[type]}</span>
    {type === 'death' && <small>(10)</small>}
  </div>
);

export default StatusIcon;

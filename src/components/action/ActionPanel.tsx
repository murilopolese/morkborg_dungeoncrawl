// src/components/action/ActionPanel.tsx

import React, { type FC } from 'react';
import Frame from '../common/Frame';
import TextNode from '../text/TextNode';
import StatusIcon from './StatusIcon';
import styles from './ActionPanel.module.scss';

export interface ActionPanelProps {
  hp: number;
  maxHp: number;
  status: Array<'poison' | 'freeze' | 'death'>; // could be an enum
}

const ActionPanel: FC<ActionPanelProps> = ({ hp, maxHp, status }) => (
  <Frame
    className={styles.action}
    direction="row"
    gap="10px"
    style={{ minHeight: '205px', paddingInline: '40px' }}
  >
    {/* HP bar */}
    <div className={styles.hpBar}>
      <div
        className={styles.filled}
        style={{ width: `${(hp / maxHp) * 100}%` }}
      />
    </div>

    {/* Status icons */}
    {status.map(s => (
      <StatusIcon key={s} type={s} />
    ))}
  </Frame>
);

export default ActionPanel;

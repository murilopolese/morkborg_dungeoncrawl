// src/components/inventory/Inventory.tsx

import React, { type FC } from 'react';
import Frame from '../common/Frame';
import styles from './Inventory.module.scss';
import InventoryItem from './InventoryItem';

export interface InventoryProps {
  /** Array of items – you can shape this however you like. */
  items: Array<{
    id: string;
    name: string;
    type: 'elixir' | 'shield' | 'weapon' | 'armor' | 'none';
    quantity?: number;
  }>;
}

const Inventory: FC<InventoryProps> = ({ items }) => (
  <Frame
    className={styles.inventory}
    direction="row"
    wrap
    gap="10px"
    style={{ paddingInline: '10px', minHeight: '90px' }}
  >
    {items.map(item => (
      <InventoryItem key={item.id} {...item} />
    ))}
  </Frame>
);

export default Inventory;

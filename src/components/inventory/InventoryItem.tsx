// src/components/inventory/InventoryItem.tsx

import React, { type FC } from 'react';
import Frame from '../common/Frame';
import TextNode from '../text/TextNode';
import Board from '../board/Board';
import styles from './InventoryItem.module.scss';

export interface InventoryItemProps {
  id: string;
  name: string;
  type: 'elixir' | 'shield' | 'weapon' | 'armor' | 'none';
  quantity?: number; // optional
}

const InventoryItem: FC<InventoryItemProps> = ({
  name,
  type,
  quantity,
}) => {
  const renderDetails = () => {
    switch (type) {
      case 'elixir':
        return (
          <>
            <TextNode>{name}</TextNode>
            <TextNode fontSize="12px">{quantity ?? ''}</TextNode>
          </>
        );
      case 'shield':
      case 'weapon':
      case 'armor':
        return <TextNode>{name}</TextNode>;
      default:
        return null;
    }
  };

  return (
    <Frame
      className={styles.item}
      direction="column"
      gap="5px"
      style={{
        width: '75px',
        height: '90px',
        border: '1px solid $color-white',
        padding: '10px',
        flexShrink: 0,
      }}
    >
      {renderDetails()}
      <Board title={type === 'none' ? '' : 'EQUIP'} />
    </Frame>
  );
};

export default InventoryItem;

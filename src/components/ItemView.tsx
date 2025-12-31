// src/components/ItemView.tsx
import React from "react";
import type { Item } from "../types";

export interface ItemViewProps {
  item: Item;
}

export const ItemView: React.FC<ItemViewProps> = ({ item }) => (
  <div className="item-view">
    {/* Title */}
    <h3>Item</h3>

    <h3>{item.category}</h3>

    {/* Raw data */}
    <pre>{JSON.stringify(item, null, 2)}</pre>
  </div>
);

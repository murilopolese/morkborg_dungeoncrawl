// src/components/ItemView.tsx
import React, { useContext, useState } from "react";
import type { Item } from "../types";

import { CharacterContext } from "../contexts/CharacterContext";
import { addItem } from "../utils/inventory";

export interface ItemViewProps {
  item: Item;
}

export const ItemView: React.FC<ItemViewProps> = ({ item }) => {
  /* ---- Grab the character so we can add the item if space exists ----- */
  const ctx = useContext(CharacterContext);

  /* ------------------ local state to remember a single click --------- */
  const [added, setAdded] = useState(false);

  /* -------------------- helpers -------------------------------------- */
  // true when there is at least one empty slot
  const hasSpace =
    ctx?.character.inventory.findIndex((it) => !it.name) !== -1;

  /* ------------------ click handler --------------------------------- */
  const handleAdd = () => {
    if (!ctx || added) return;           // guard against double clicks

    ctx.setCharacter((prev) => addItem(prev, item));
    setAdded(true);                       // remember that we already clicked
  };

  return (
    <div className="item-view">
      {/* Title */}
      <h3>Item</h3>
      {/* Show button only if there is space,
          the item isn’t already in inventory and we haven’t clicked yet. */}
      {!added && hasSpace && (
        <>
          <h4>{item.category}</h4>
          {/* Raw data */}
          <pre>{JSON.stringify(item, null, 2)}</pre>
          <button
            onClick={handleAdd}
            className="add-to-inventory-btn"
          >
            Add to Inventory
          </button>
        </>
      )}
    </div>
  );
};

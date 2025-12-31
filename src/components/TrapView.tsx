// src/components/TrapView.tsx
import React from "react";

export interface TrapViewProps {
  description: string;
}

export const TrapView: React.FC<TrapViewProps> = ({ description }) => (
  <div className="trap-view">
    {/* Title */}
    <h3>Trap</h3>

    {/* Description */}
    <p>{description}</p>
  </div>
);

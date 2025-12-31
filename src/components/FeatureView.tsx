// src/components/FeatureView.tsx
import React from "react";

export interface FeatureViewProps {
  description: string;
}

export const FeatureView: React.FC<FeatureViewProps> = ({ description }) => (
  <div className="feature-view">
    {/* Title */}
    <h3>Room Feature</h3>

    {/* Description */}
    <p>{description}</p>
  </div>
);

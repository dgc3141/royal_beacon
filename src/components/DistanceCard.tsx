import React from 'react';
import { formatDistance } from '../utils/geo';

interface DistanceCardProps {
  distanceKm: number | null;
  accuracy: number | null;
}

export const DistanceCard: React.FC<DistanceCardProps> = ({ distanceKm, accuracy }) => {
  const formatted = distanceKm !== null ? formatDistance(distanceKm) : { value: '--', unit: 'km' };

  return (
    <div className="distance-card-container">
      <div className="distance-header">
        <span className="distance-label">皇居までの直線距離</span>
        {accuracy !== null && (
          <span className="accuracy-badge" title={`GPS精度: ±${Math.round(accuracy)}m`}>
            GPS ±{Math.round(accuracy)}m
          </span>
        )}
      </div>

      <div className="distance-value-wrapper" data-testid="distance-value">
        <span className="distance-number">{formatted.value}</span>
        <span className="distance-unit">{formatted.unit}</span>
      </div>
    </div>
  );
};

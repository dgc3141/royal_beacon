import React from 'react';
import { formatDistance, getCardinalDirection } from '../utils/geo';

interface DistanceCardProps {
  distanceKm: number | null;
  accuracy: number | null;
  bearing?: number | null;
}

export const DistanceCard: React.FC<DistanceCardProps> = ({ distanceKm, accuracy, bearing }) => {
  const formatted = distanceKm !== null ? formatDistance(distanceKm) : { value: '--', unit: 'km' };
  const bearingText =
    bearing !== null && bearing !== undefined
      ? `${Math.round(bearing)}° ${getCardinalDirection(bearing)}`
      : null;

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

      {bearingText && (
        <div className="distance-bearing-info">
          <span>皇居の方角: {bearingText}</span>
        </div>
      )}
    </div>
  );
};


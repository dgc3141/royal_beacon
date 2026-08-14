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
    <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl border border-zinc-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 text-center transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          皇居までの直線距離
        </span>
        {accuracy !== null && (
          <span
            className="text-[11px] font-medium text-zinc-600 bg-zinc-100/90 px-2.5 py-0.5 rounded-full border border-zinc-200"
            title={`GPS精度: ±${Math.round(accuracy)}m`}
          >
            GPS ±{Math.round(accuracy)}m
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-center my-1" data-testid="distance-value">
        <span className="text-5xl font-extrabold text-zinc-900 tracking-tight leading-none">
          {formatted.value}
        </span>
        <span className="text-xl font-medium text-zinc-500 ml-2">
          {formatted.unit}
        </span>
      </div>

      {bearingText && (
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-center space-x-2 text-xs font-medium text-zinc-600">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
          <span>皇居の方角: {bearingText}</span>
        </div>
      )}
    </div>
  );
};

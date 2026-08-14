import React, { useEffect, useRef } from 'react';
import { getUnwrappedAngle, normalizeAngle } from '../utils/geo';

interface CompassProps {
  heading: number | null;
  bearing: number | null;
}

const TICKS = Array.from({ length: 36 }, (_, i) => i * 10);

export const Compass: React.FC<CompassProps> = ({ heading, bearing }) => {
  const roseRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);

  const prevRoseRef = useRef<number | null>(null);
  const prevNeedleRef = useRef<number | null>(null);

  useEffect(() => {
    const current = heading ?? 0;

    // 1. 文字盤の回転
    if (roseRef.current) {
      const target = -current;
      prevRoseRef.current =
        prevRoseRef.current === null ? target : getUnwrappedAngle(prevRoseRef.current, target);
      roseRef.current.style.transform = `rotate(${prevRoseRef.current}deg)`;
    }

    // 2. 皇居指針の回転
    if (needleRef.current && bearing !== null) {
      const target = bearing - current;
      prevNeedleRef.current =
        prevNeedleRef.current === null ? target : getUnwrappedAngle(prevNeedleRef.current, target);
      needleRef.current.style.transform = `translate(-50%, -100%) rotate(${prevNeedleRef.current}deg)`;
    }
  }, [heading, bearing]);

  // 皇居とのアライメント（正面 ±5度以内）
  const isAligned =
    heading !== null &&
    bearing !== null &&
    Math.abs(normalizeAngle(bearing - heading + 180) - 180) <= 5;

  return (
    <div className="compass-wrapper relative my-auto">
      <div className={`compass-outer-ring ${isAligned ? 'aligned' : ''}`}>
        <div className="compass-inner-housing" data-testid="compass">
          {/* 回転する文字盤 */}
          <div className="compass-rose" ref={roseRef}>
            <div className="ticks-container">
              {TICKS.map((deg) => (
                <div
                  key={deg}
                  className={`tick ${deg % 30 === 0 ? 'major' : 'minor'}`}
                  style={{ transform: `rotate(${deg}deg)` }}
                />
              ))}
            </div>
            <div className="cardinal-label north">N</div>
            <div className="cardinal-label east">E</div>
            <div className="cardinal-label south">S</div>
            <div className="cardinal-label west">W</div>
          </div>

          {/* 回転する皇居指針 */}
          <div className={`compass-needle ${isAligned ? 'aligned' : ''}`} ref={needleRef}>
            <div className="needle-head" />
            <div className="needle-body" />
          </div>

          {/* コンパス中央のミニマルなセンターピン */}
          <div className={`compass-center-pin ${isAligned ? 'aligned' : ''}`} />
        </div>
      </div>
    </div>
  );
};

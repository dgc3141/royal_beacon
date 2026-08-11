import React, { useEffect, useRef } from 'react';
import { getUnwrappedAngle, getCardinalDirection } from '../utils/geo';

interface CompassProps {
  heading: number | null;
  bearing: number | null;
}

export const Compass: React.FC<CompassProps> = ({ heading, bearing }) => {
  const roseRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);

  const prevRoseAngleRef = useRef<number>(0);
  const prevNeedleAngleRef = useRef<number>(0);

  // 端末の向きに応じた回転制御
  useEffect(() => {
    const currentHeading = heading ?? 0;

    // 1. 文字盤: 常に N が真北を指すよう -currentHeading 度回転
    if (roseRef.current) {
      const targetRose = -currentHeading;
      const unwrappedRose = getUnwrappedAngle(prevRoseAngleRef.current, targetRose);
      prevRoseAngleRef.current = unwrappedRose;
      roseRef.current.style.transform = `rotate(${unwrappedRose}deg)`;
    }

    // 2. 指針: 画面上での皇居の相対角度 = bearing - currentHeading
    if (needleRef.current && bearing !== null) {
      const targetNeedle = bearing - currentHeading;
      const unwrappedNeedle = getUnwrappedAngle(prevNeedleAngleRef.current, targetNeedle);
      prevNeedleAngleRef.current = unwrappedNeedle;
      needleRef.current.style.transform = `translate(-50%, -100%) rotate(${unwrappedNeedle}deg)`;
    }
  }, [heading, bearing]);

  // 目盛り（12刻み）の生成
  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < 36; i++) {
      const deg = i * 10;
      const isMajor = deg % 30 === 0;
      ticks.push(
        <div
          key={deg}
          className={`tick ${isMajor ? 'major' : 'minor'}`}
          style={{ transform: `rotate(${deg}deg)` }}
        />
      );
    }
    return ticks;
  };

  const displayBearing = bearing !== null ? Math.round(bearing) : null;
  const cardinalText = displayBearing !== null ? getCardinalDirection(displayBearing) : '--';

  return (
    <div className="compass-wrapper">
      <div className="compass-outer-ring">
        <div className="compass-inner-housing" data-testid="compass">
          {/* 回転する文字盤 */}
          <div className="compass-rose" ref={roseRef}>
            <div className="ticks-container">{renderTicks()}</div>
            <div className="cardinal-label north">N</div>
            <div className="cardinal-label east">E</div>
            <div className="cardinal-label south">S</div>
            <div className="cardinal-label west">W</div>
          </div>

          {/* 回転する皇居指針 */}
          <div className="compass-needle" ref={needleRef}>
            <div className="needle-head" />
            <div className="needle-body" />
          </div>

          {/* コンパス中央のデジタル数値 */}
          <div className="compass-center-display">
            <div className="degree-num">{displayBearing !== null ? `${displayBearing}°` : '--'}</div>
            <div className="direction-txt">{cardinalText}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

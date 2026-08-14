import React, { useEffect, useRef } from 'react';
import { getUnwrappedAngle, normalizeAngle } from '../utils/geo';

interface CompassProps {
  heading: number | null;
  bearing: number | null;
}

export const Compass: React.FC<CompassProps> = ({ heading, bearing }) => {
  const roseRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);

  const prevRoseAngleRef = useRef<number | null>(null);
  const prevNeedleAngleRef = useRef<number | null>(null);

  // 端末の向きに応じた回転制御
  useEffect(() => {
    const currentHeading = heading ?? 0;

    // 1. 文字盤: 常に N が真北を指すよう -currentHeading 度回転
    if (roseRef.current) {
      const targetRose = -currentHeading;
      if (prevRoseAngleRef.current === null) {
        prevRoseAngleRef.current = targetRose;
      } else {
        prevRoseAngleRef.current = getUnwrappedAngle(prevRoseAngleRef.current, targetRose);
      }
      roseRef.current.style.transform = `rotate(${prevRoseAngleRef.current}deg)`;
    }

    // 2. 指針: 画面上での皇居の相対角度 = bearing - currentHeading
    if (needleRef.current && bearing !== null) {
      const targetNeedle = bearing - currentHeading;
      if (prevNeedleAngleRef.current === null) {
        prevNeedleAngleRef.current = targetNeedle;
      } else {
        prevNeedleAngleRef.current = getUnwrappedAngle(prevNeedleAngleRef.current, targetNeedle);
      }
      needleRef.current.style.transform = `translate(-50%, -100%) rotate(${prevNeedleAngleRef.current}deg)`;
    }
  }, [heading, bearing]);

  // 目盛り（36分割、10度刻み）の生成
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

  // 皇居とのアライメント（正面 ±5度以内）
  const relativeAngle =
    heading !== null && bearing !== null ? Math.abs(normalizeAngle(bearing - heading + 180) - 180) : null;
  const isAligned = relativeAngle !== null && relativeAngle <= 5;

  return (
    <div className="compass-wrapper relative my-auto">
      <div className={`compass-outer-ring ${isAligned ? 'aligned' : ''}`}>
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

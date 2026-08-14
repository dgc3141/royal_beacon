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
  const wasAlignedRef = useRef<boolean>(false);

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

  // アライメント成立時の触覚フィードバック（Haptic Feedback）
  useEffect(() => {
    if (isAligned && !wasAlignedRef.current) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(15);
        } catch {
          // Vibration API 失敗時は安全に無視
        }
      }
    }
    wasAlignedRef.current = isAligned;
  }, [isAligned]);

  const accessibilityLabel =
    heading !== null && bearing !== null
      ? `コンパス: 端末の方位 ${Math.round(heading)}度、皇居の方位 ${Math.round(bearing)}度${
          isAligned ? '（皇居の正面を向いています）' : ''
        }`
      : 'コンパス: 計測待機中';

  return (
    <div className="compass-wrapper relative my-auto">
      <div className={`compass-outer-ring ${isAligned ? 'aligned' : ''}`}>
        <div
          className="compass-inner-housing"
          data-testid="compass"
          role="img"
          aria-label={accessibilityLabel}
        >
          {/* 回転する文字盤 */}
          <div className="compass-rose" ref={roseRef} aria-hidden="true">
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
          <div
            className={`compass-needle ${isAligned ? 'aligned' : ''}`}
            ref={needleRef}
            aria-hidden="true"
          >
            <div className="needle-head" />
            <div className="needle-body" />
          </div>

          {/* コンパス中央のミニマルなセンターピン */}
          <div className={`compass-center-pin ${isAligned ? 'aligned' : ''}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

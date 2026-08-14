import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  calculateBearing,
  normalizeAngle,
  getUnwrappedAngle,
  getCardinalDirection,
  formatDistance,
  calculateCompassHeading,
} from './geo';

describe('geo utility functions', () => {
  const TokyoStation = { lat: 35.681236, lng: 139.767125 };
  const ImperialPalace = { lat: 35.685175, lng: 139.7528 };

  it('2点間の距離を正確に計算できる', () => {
    const distance = calculateDistance(TokyoStation, ImperialPalace);
    // 東京駅から皇居までは約 1.3km 〜 1.4km
    expect(distance).toBeGreaterThan(1.0);
    expect(distance).toBeLessThan(2.0);
  });

  it('東京駅から皇居へ向かう方位角が北西（約290°〜320°）付近になる', () => {
    const bearing = calculateBearing(TokyoStation, ImperialPalace);
    expect(bearing).toBeGreaterThan(280);
    expect(bearing).toBeLessThan(330);
  });

  it('角度を0-360度の範囲に正規化できる', () => {
    expect(normalizeAngle(370)).toBe(10);
    expect(normalizeAngle(-30)).toBe(330);
    expect(normalizeAngle(0)).toBe(0);
  });

  it('360度跨ぎでアンラップ角度を滑らかに補正できる', () => {
    expect(getUnwrappedAngle(350, 10)).toBe(370);
    expect(getUnwrappedAngle(10, 350)).toBe(-10);
  });

  it('角度を16方位の文字列に正しく変換できる', () => {
    expect(getCardinalDirection(0)).toBe('北');
    expect(getCardinalDirection(90)).toBe('東');
    expect(getCardinalDirection(180)).toBe('南');
    expect(getCardinalDirection(270)).toBe('西');
    expect(getCardinalDirection(45)).toBe('北東');
  });

  it('距離表示を単位（m / km）に合わせて整形できる', () => {
    expect(formatDistance(0.45)).toEqual({ value: '450', unit: 'm' });
    expect(formatDistance(3.256)).toEqual({ value: '3.26', unit: 'km' });
  });

  describe('calculateCompassHeading (傾き補正コンパス方位角計算)', () => {
    it('平置き状態（beta=0, gamma=0）で方位角が正しく計算される', () => {
      // alpha = 0 -> 360/0 (北)
      expect(calculateCompassHeading(0, 0, 0)).toBe(0);
      // alpha = 90 -> 270 (西) W3Cの反時計回りalphaから時計回り方位へ
      expect(calculateCompassHeading(90, 0, 0)).toBe(270);
      // alpha = 270 -> 90 (東)
      expect(calculateCompassHeading(270, 0, 0)).toBe(90);
      // alpha = 180 -> 180 (南)
      expect(calculateCompassHeading(180, 0, 0)).toBe(180);
    });

    it('端末を45度傾けた（beta=45, gamma=0）場合でも方位角が狂わない', () => {
      const headingNorth = calculateCompassHeading(0, 45, 0);
      expect(headingNorth).toBeCloseTo(0, 1);

      const headingEast = calculateCompassHeading(270, 45, 0);
      expect(headingEast).toBeCloseTo(90, 1);
    });

    it('画面回転（screenAngle）が加味される', () => {
      // alpha=0 (北), screenAngle=90 (横画面) -> 90度
      expect(calculateCompassHeading(0, 0, 0, 90)).toBe(90);
      expect(calculateCompassHeading(0, 0, 0, 270)).toBe(270);
    });

    it('alpha が null または NaN の場合は null を返す', () => {
      expect(calculateCompassHeading(null)).toBeNull();
      expect(calculateCompassHeading(NaN)).toBeNull();
    });
  });
});


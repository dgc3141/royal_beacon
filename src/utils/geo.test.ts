import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  calculateBearing,
  normalizeAngle,
  getUnwrappedAngle,
  getCardinalDirection,
  formatDistance,
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
});

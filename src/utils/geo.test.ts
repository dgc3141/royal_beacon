import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  calculateBearing,
  normalizeAngle,
  getUnwrappedAngle,
  formatDistance,
  calculateCompassHeading,
  calculateMagneticDeclination,
} from './geo';

describe('geo utilities', () => {
  const TokyoStation = { lat: 35.681236, lng: 139.767125 };
  const ImperialPalace = { lat: 35.685175, lng: 139.7528 };
  const Sapporo = { lat: 43.06417, lng: 141.34694 };
  const Naha = { lat: 26.2125, lng: 127.6811 };

  it('2点間の球面距離を正確に計算できる', () => {
    const distance = calculateDistance(TokyoStation, ImperialPalace);
    expect(distance).toBeGreaterThan(1.0);
    expect(distance).toBeLessThan(2.0);
  });

  it('東京駅から皇居へ向かう方位角が北西付近になる', () => {
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

  it('距離表示を単位（m / km）に合わせて整形できる', () => {
    expect(formatDistance(0.45)).toEqual({ value: '450', unit: 'm' });
    expect(formatDistance(3.256)).toEqual({ value: '3.26', unit: 'km' });
  });

  describe('calculateMagneticDeclination', () => {
    it('東京の地磁気偏角が約 -7.6°（西偏）になる', () => {
      const declination = calculateMagneticDeclination(TokyoStation);
      expect(declination).toBeLessThan(-7.0);
      expect(declination).toBeGreaterThan(-8.2);
    });

    it('札幌の地磁気偏角が約 -9.3°（北へ行くほど西偏拡大）になる', () => {
      const declination = calculateMagneticDeclination(Sapporo);
      expect(declination).toBeLessThan(-8.5);
      expect(declination).toBeGreaterThan(-10.0);
    });

    it('那覇の地磁気偏角が約 -4.5°（南へ行くほど西偏縮小）になる', () => {
      const declination = calculateMagneticDeclination(Naha);
      expect(declination).toBeLessThan(-4.0);
      expect(declination).toBeGreaterThan(-5.5);
    });
  });

  describe('calculateCompassHeading', () => {
    it('平置き状態（beta=0, gamma=0）で方位角が正しく計算される', () => {
      expect(calculateCompassHeading(0, 0, 0)).toBe(0);
      expect(calculateCompassHeading(90, 0, 0)).toBe(270);
      expect(calculateCompassHeading(270, 0, 0)).toBe(90);
      expect(calculateCompassHeading(180, 0, 0)).toBe(180);
    });

    it('地磁気偏角補正が加味される', () => {
      expect(calculateCompassHeading(90, 0, 0, 0, -7.5)).toBe(262.5);
    });

    it('端末を45度傾けた（beta=45, gamma=0）場合でも方位角が狂わない', () => {
      expect(calculateCompassHeading(0, 45, 0)).toBeCloseTo(0, 1);
      expect(calculateCompassHeading(270, 45, 0)).toBeCloseTo(90, 1);
    });

    it('画面回転（screenAngle）が加味される', () => {
      expect(calculateCompassHeading(0, 0, 0, 90)).toBe(90);
      expect(calculateCompassHeading(0, 0, 0, 270)).toBe(270);
    });

    it('alpha が null または NaN の場合は null を返す', () => {
      expect(calculateCompassHeading(null)).toBeNull();
      expect(calculateCompassHeading(NaN)).toBeNull();
    });
  });
});

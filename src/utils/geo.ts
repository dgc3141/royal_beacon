import { LatLng, CardinalDirection } from '../types';
import { EARTH_RADIUS_KM } from '../constants';

/**
 * 2点間の球面距離を計算 (km)
 */
export const calculateDistance = (pointA: LatLng, pointB: LatLng): number => {
  const dLat = ((pointB.lat - pointA.lat) * Math.PI) / 180;
  const dLon = ((pointB.lng - pointA.lng) * Math.PI) / 180;

  const lat1Rad = (pointA.lat * Math.PI) / 180;
  const lat2Rad = (pointB.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * 点Aから点Bへ向かう真北基準の初期方位角を計算 (0° ~ 360°)
 */
export const calculateBearing = (pointA: LatLng, pointB: LatLng): number => {
  const dLon = ((pointB.lng - pointA.lng) * Math.PI) / 180;
  const lat1Rad = (pointA.lat * Math.PI) / 180;
  const lat2Rad = (pointB.lat * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const bearingRad = Math.atan2(y, x);
  const bearingDeg = (bearingRad * 180) / Math.PI;

  return normalizeAngle(bearingDeg);
};

/**
 * 角度を 0° ~ 360° に正規化
 */
export const normalizeAngle = (angle: number): number => {
  return ((angle % 360) + 360) % 360;
};

/**
 * 角度連続化（0-360跨ぎで急激な逆回転を防ぐ）
 */
export const getUnwrappedAngle = (currentAngle: number, targetAngle: number): number => {
  const normTarget = normalizeAngle(targetAngle);
  const normCurrent = normalizeAngle(currentAngle);

  let diff = normTarget - normCurrent;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return currentAngle + diff;
};

/**
 * 角度 (0° ~ 360°) を日本語の16方位に変換
 */
export const getCardinalDirection = (angle: number): CardinalDirection => {
  const normalized = normalizeAngle(angle);
  const directions: CardinalDirection[] = [
    '北', '北北東', '北東', '東北東',
    '東', '東南東', '南東', '南南東',
    '南', '南南西', '南西', '西南西',
    '西', '西北西', '北西', '北北西'
  ];

  // 360 / 16 = 22.5度刻み
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
};

/**
 * 距離を表示用文字列に整形（例: "1.25 km" または "850 m"）
 */
export const formatDistance = (distanceKm: number): { value: string; unit: string } => {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return { value: meters.toString(), unit: 'm' };
  }
  return { value: distanceKm.toFixed(2), unit: 'km' };
};

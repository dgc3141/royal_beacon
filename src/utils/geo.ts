import { LatLng } from '../types';
import { EARTH_RADIUS_KM } from '../constants';

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * 角度を 0° ~ 360° に正規化
 */
export const normalizeAngle = (angle: number): number => ((angle % 360) + 360) % 360;

/**
 * 角度の連続化（0-360跨ぎで急激な逆回転を防ぐ）
 */
export const getUnwrappedAngle = (current: number, target: number): number => {
  let diff = normalizeAngle(target) - normalizeAngle(current);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return current + diff;
};

/**
 * 2点間の大圏球面距離を計算 (km)
 */
export const calculateDistance = (a: LatLng, b: LatLng): number => {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

/**
 * 点Aから点Bへ向かう初期方位角を計算 (0° ~ 360°)
 */
export const calculateBearing = (a: LatLng, b: LatLng): number => {
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return normalizeAngle(toDeg(Math.atan2(y, x)));
};

/**
 * 端末の姿勢（alpha, beta, gamma）から傾き補正された真北基準方位角（0° ~ 360°）を計算
 */
export const calculateCompassHeading = (
  alpha: number | null,
  beta: number | null = 0,
  gamma: number | null = 0,
  screenAngle: number = 0
): number | null => {
  if (alpha === null || isNaN(alpha)) return null;

  const b = beta ?? 0;
  const g = gamma ?? 0;

  // 手持ちコンパス（ピッチ 70度以下）: ロール手振れノイズを遮断し真北基準方位（360 - alpha）を維持
  if (Math.abs(b) < 70) {
    return normalizeAngle(360 - alpha + screenAngle);
  }

  // 端末をほぼ垂直に立てた場合（70度〜90度）: 3D回転行列補正
  const [radA, radB, radG] = [toRad(alpha), toRad(b), toRad(g)];
  const [cA, sA] = [Math.cos(radA), Math.sin(radA)];
  const [cB, sB] = [Math.cos(radB), Math.sin(radB)];
  const [cG, sG] = [Math.cos(radG), Math.sin(radG)];

  const rA = -cA * sG - sA * sB * cG;
  const rB = -sA * sG + cA * sB * cG;
  const topA = -sA * cB;
  const topB = cA * cB;

  const uprightWeight = Math.min(1, Math.max(0, (Math.abs(b) - 70) / 20));
  const finalA = topA * (1 - uprightWeight) + rA * uprightWeight;
  const finalB = topB * (1 - uprightWeight) + rB * uprightWeight;

  return normalizeAngle(toDeg(Math.atan2(finalA, finalB)) + screenAngle);
};

/**
 * 距離を表示用文字列に整形（例: "1.25 km" または "850 m"）
 */
export const formatDistance = (km: number): { value: string; unit: string } => {
  if (km < 1) {
    return { value: Math.round(km * 1000).toString(), unit: 'm' };
  }
  return { value: km.toFixed(2), unit: 'km' };
};

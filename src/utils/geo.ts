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
 * 端末の姿勢（alpha, beta, gamma）から、傾き補正された真北基準の方位角（0° ~ 360°）を計算
 * 
 * @param alpha 磁北/真北に対するZ軸回転（0 ~ 360）
 * @param beta X軸回転（ピッチ: -180 ~ 180）
 * @param gamma Y軸回転（ロール: -90 ~ 90）
 * @param screenAngle 画面の回転角（0, 90, 180, 270）
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

  // 水平置き（beta, gamma がほぼ0）の場合
  if (Math.abs(b) < 1 && Math.abs(g) < 1) {
    return normalizeAngle(360 - alpha + screenAngle);
  }

  const degToRad = Math.PI / 180;
  const radA = alpha * degToRad;
  const radB = b * degToRad;
  const radG = g * degToRad;

  const cA = Math.cos(radA);
  const sA = Math.sin(radA);
  const cB = Math.cos(radB);
  const sB = Math.sin(radB);
  const cG = Math.cos(radG);
  const sG = Math.sin(radG);

  // W3C DeviceOrientation 仕様に基づく回転行列成分
  // 端末を立てた状態での水平面ベクトル成分
  const rA = -cA * sG - sA * sB * cG;
  const rB = -sA * sG + cA * sB * cG;

  // 端末の上部（+Y軸）の水平面ベクトル成分
  const topA = -sA * cB;
  const topB = cA * cB;

  // ピッチ角 (beta) の大きさに応じて、水平持ち（+Y軸優先）と直立持ち（視線方向優先）をブレンド
  const pitchWeight = Math.abs(sB);
  const finalA = topA * (1 - pitchWeight * pitchWeight) + rA * (pitchWeight * pitchWeight);
  const finalB = topB * (1 - pitchWeight * pitchWeight) + rB * (pitchWeight * pitchWeight);

  let headingRad = Math.atan2(finalA, finalB);
  let headingDeg = (headingRad * 180) / Math.PI;

  return normalizeAngle(headingDeg + screenAngle);
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


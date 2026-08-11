import { useState, useEffect, useRef, useCallback } from 'react';
import { CompassState } from '../types';
import { normalizeAngle } from '../utils/geo';

// センサ針のぶれを滑らかにするローパスフィルター係数 (0 ~ 1, 小さいほど滑らか)
const SMOOTHING_FACTOR = 0.25;

export const useCompass = (): CompassState => {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const prevHeadingRef = useRef<number | null>(null);

  // 指針のノイズ低減フィルター処理
  const filterHeading = useCallback((rawHeading: number): number => {
    if (prevHeadingRef.current === null) {
      prevHeadingRef.current = rawHeading;
      return rawHeading;
    }

    let prev = prevHeadingRef.current;
    let diff = rawHeading - prev;

    // 0° ~ 360° の境界における差分の補正
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const smoothed = normalizeAngle(prev + diff * SMOOTHING_FACTOR);
    prevHeadingRef.current = smoothed;
    return smoothed;
  }, []);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      let rawHeading: number | null = null;

      // 1. iOS Safari 固有プロパティ (webkitCompassHeading)
      if (
        (event as any).webkitCompassHeading !== undefined &&
        (event as any).webkitCompassHeading !== null
      ) {
        rawHeading = (event as any).webkitCompassHeading;
      }
      // 2. Android Chrome / 標準仕様 (alpha)
      else if (event.alpha !== null && event.alpha !== undefined) {
        // W3C規格上、alphaは反時計回りのため 360 - alpha で時計回りに変換
        rawHeading = (360 - event.alpha) % 360;
      }

      if (rawHeading !== null) {
        const smoothed = filterHeading(rawHeading);
        setHeading(smoothed);
        setError(null);
      }
    },
    [filterHeading]
  );

  useEffect(() => {
    // iOS 13+ の Permission 要求チェック
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      setPermissionNeeded(true);
    } else {
      setPermissionGranted(true);
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    return () => {
      if ('ondeviceorientationabsolute' in window) {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      } else if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [handleOrientation]);

  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setPermissionNeeded(false);
          if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
          } else if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        } else {
          setError('コンパスセンサーのアクセスが拒否されました。');
        }
      } catch (err) {
        console.error('コンパスパーミッション許可エラー:', err);
        setError('コンパスの権限取得中にエラーが発生しました。');
      }
    }
  };

  return {
    heading,
    permissionGranted,
    permissionNeeded,
    error,
    requestPermission,
  };
};

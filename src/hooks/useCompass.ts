import { useState, useEffect, useRef, useCallback } from 'react';
import { CompassState } from '../types';
import { normalizeAngle, calculateCompassHeading } from '../utils/geo';

// センサ針のぶれを滑らかにする基本ローパスフィルター係数
const BASE_SMOOTHING_FACTOR = 0.25;

export const useCompass = (): CompassState => {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const prevHeadingRef = useRef<number | null>(null);
  const pendingHeadingRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 指針のノイズ低減フィルター処理（角度差に応じて適応的に補正）
  const filterHeading = useCallback((rawHeading: number): number => {
    if (prevHeadingRef.current === null) {
      prevHeadingRef.current = rawHeading;
      return rawHeading;
    }

    const prev = prevHeadingRef.current;
    let diff = rawHeading - prev;

    // 0° ~ 360° の境界における差分の補正
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    // 急な回転時は追従性を高め、微小なブレはしっかり抑制する
    const absDiff = Math.abs(diff);
    const dynamicFactor = absDiff > 30 ? 0.6 : BASE_SMOOTHING_FACTOR;

    const smoothed = normalizeAngle(prev + diff * dynamicFactor);
    prevHeadingRef.current = smoothed;
    return smoothed;
  }, []);

  // requestAnimationFrame で 1フレームに1回だけ React State を更新
  const scheduleUpdate = useCallback((newHeading: number) => {
    pendingHeadingRef.current = newHeading;
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingHeadingRef.current !== null) {
          setHeading(pendingHeadingRef.current);
          setError(null);
        }
        rafIdRef.current = null;
      });
    }
  }, []);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      let calculatedHeading: number | null = null;

      // 1. iOS Safari 固有プロパティ (webkitCompassHeading)
      if (
        (event as any).webkitCompassHeading !== undefined &&
        (event as any).webkitCompassHeading !== null
      ) {
        calculatedHeading = (event as any).webkitCompassHeading;
      }
      // 2. Android Chrome / 標準仕様 (alpha, beta, gamma から傾き補正計算)
      else if (event.alpha !== null && event.alpha !== undefined) {
        const screenAngle =
          typeof window !== 'undefined' && window.screen?.orientation
            ? window.screen.orientation.angle
            : typeof window !== 'undefined'
            ? Number((window as any).orientation) || 0
            : 0;

        calculatedHeading = calculateCompassHeading(
          event.alpha,
          event.beta,
          event.gamma,
          screenAngle
        );
      }

      if (calculatedHeading !== null) {
        const smoothed = filterHeading(calculatedHeading);
        scheduleUpdate(smoothed);
      }
    },
    [filterHeading, scheduleUpdate]
  );

  const registerListeners = useCallback(() => {
    // Android Chrome 等で絶対方位を取得するため deviceorientationabsolute を優先
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, { passive: true });
    }
    // iOS Safari および標準 deviceorientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }
  }, [handleOrientation]);

  const unregisterListeners = useCallback(() => {
    if ('ondeviceorientationabsolute' in window) {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
    }
    if (window.DeviceOrientationEvent) {
      window.removeEventListener('deviceorientation', handleOrientation);
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, [handleOrientation]);

  useEffect(() => {
    // iOS 13+ の Permission 要求チェック
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      setPermissionNeeded(true);
    } else {
      setPermissionGranted(true);
      registerListeners();
    }

    return () => {
      unregisterListeners();
    };
  }, [registerListeners, unregisterListeners]);

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
          registerListeners();
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


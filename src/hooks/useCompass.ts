import { useState, useEffect, useRef, useCallback } from 'react';
import { CompassState } from '../types';
import { normalizeAngle, calculateCompassHeading } from '../utils/geo';

const getScreenAngle = (): number => {
  if (typeof window === 'undefined') return 0;
  return window.screen?.orientation?.angle ?? (Number((window as any).orientation) || 0);
};

export const useCompass = (): CompassState => {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(false);
  const [needsCalibration, setNeedsCalibration] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const prevHeadingRef = useRef<number | null>(null);
  const pendingHeadingRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 指針のノイズ低減・静止時ブレ遮断フィルター処理
  const filterHeading = useCallback((raw: number): number => {
    if (prevHeadingRef.current === null) {
      prevHeadingRef.current = raw;
      return raw;
    }

    const prev = prevHeadingRef.current;
    let diff = raw - prev;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const absDiff = Math.abs(diff);

    // 0.4°以下の微小ノイズは完全静止とみなして無視
    if (absDiff < 0.4) return prev;

    // 多段階適応型ローパスフィルター
    const factor = absDiff <= 4 ? 0.06 : absDiff <= 20 ? 0.2 : 0.65;
    const smoothed = normalizeAngle(prev + diff * factor);
    prevHeadingRef.current = smoothed;
    return smoothed;
  }, []);

  // RAF で 1フレームに1回だけ React State を更新
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
      if ((event as any).webkitCompassHeading != null) {
        calculatedHeading = (event as any).webkitCompassHeading;
      }
      // 2. Android Chrome / 標準仕様 (alpha, beta, gamma から傾き補正計算)
      else if (event.alpha != null) {
        calculatedHeading = calculateCompassHeading(
          event.alpha,
          event.beta,
          event.gamma,
          getScreenAngle()
        );
      }

      if (calculatedHeading !== null) {
        scheduleUpdate(filterHeading(calculatedHeading));
      }
    },
    [filterHeading, scheduleUpdate]
  );

  const registerListeners = useCallback(() => {
    if (typeof window === 'undefined') return;

    const hasAbsolute = 'ondeviceorientationabsolute' in (window as any);
    if (hasAbsolute) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, { passive: true });
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }
  }, [handleOrientation]);

  const unregisterListeners = useCallback(() => {
    if (typeof window === 'undefined') return;

    const hasAbsolute = 'ondeviceorientationabsolute' in (window as any);
    if (hasAbsolute) {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
    }
    if (typeof DeviceOrientationEvent !== 'undefined') {
      window.removeEventListener('deviceorientation', handleOrientation);
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, [handleOrientation]);

  useEffect(() => {
    const isPermissionRequired =
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (isPermissionRequired) {
      setPermissionNeeded(true);
    } else {
      setPermissionGranted(true);
      registerListeners();
    }

    // 8の字キャリブレーション要求検知
    const handleCalibration = (e: Event) => {
      e.preventDefault();
      setNeedsCalibration(true);
      setTimeout(() => setNeedsCalibration(false), 8000);
    };

    window.addEventListener('compassneedscalibration', handleCalibration);

    // ライフサイクル連動: バックグラウンド時にセンサー監視を停止してバッテリー消費を抑制
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        registerListeners();
      } else {
        unregisterListeners();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unregisterListeners();
      window.removeEventListener('compassneedscalibration', handleCalibration);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [registerListeners, unregisterListeners]);

  const requestPermission = async () => {
    try {
      const response = await (DeviceOrientationEvent as any).requestPermission();
      if (response === 'granted') {
        setPermissionGranted(true);
        setPermissionNeeded(false);
        registerListeners();
      } else {
        setError('コンパスセンサーのアクセスが拒否されました。');
      }
    } catch {
      setError('コンパスの権限取得中にエラーが発生しました。');
    }
  };

  return {
    heading,
    permissionGranted,
    permissionNeeded,
    needsCalibration,
    error,
    requestPermission,
  };
};

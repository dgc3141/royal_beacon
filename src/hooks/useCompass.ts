import { useState, useEffect, useRef, useCallback } from 'react';
import { CompassState } from '../types';
import { normalizeAngle, calculateCompassHeading } from '../utils/geo';

export const useCompass = (): CompassState => {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const prevHeadingRef = useRef<number | null>(null);
  const pendingHeadingRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 指針のノイズ低減・静止時ブレ遮断フィルター処理
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

    const absDiff = Math.abs(diff);

    // 1. デッドバンド: 0.4°以下の微小なセンサーノイズは静止とみなして無視（ジッター遮断）
    if (absDiff < 0.4) {
      return prev;
    }

    // 2. 多段階適応型ローパスフィルター:
    // - 微小な揺れ (0.4° ~ 4°): 非常に滑らかに平滑化 (factor = 0.06)
    // - 中程度の回転 (4° ~ 20°): スムーズに追従 (factor = 0.20)
    // - 大きな回転 (> 20°): 遅延なく即座に追従 (factor = 0.65)
    let factor: number;
    if (absDiff <= 4) {
      factor = 0.06;
    } else if (absDiff <= 20) {
      factor = 0.20;
    } else {
      factor = 0.65;
    }

    const smoothed = normalizeAngle(prev + diff * factor);
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
    // Android Chrome 等で絶対方位を取得するため deviceorientationabsolute を最優先（重複登録を防止）
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, { passive: true });
    } else if (window.DeviceOrientationEvent) {
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

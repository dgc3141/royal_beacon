import { useState, useEffect } from 'react';
import { GeolocationState } from '../types';

const ERROR_MESSAGES: Record<number, string> = {
  1: '位置情報の利用を許可してください。',
  2: '現在地を取得できませんでした。',
  3: '位置情報の取得がタイムアウトしました。',
};

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>(() => {
    if (typeof navigator !== 'undefined' && !navigator.geolocation) {
      return {
        coords: null,
        accuracy: null,
        error: 'お使いのブラウザは位置情報をサポートしていません。',
        loading: false,
      };
    }
    return {
      coords: null,
      accuracy: null,
      error: null,
      loading: true,
    };
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    let watchId: number | null = null;

    const startWatching = () => {
      if (watchId !== null) return;
      watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          setState({
            coords: {
              lat: coords.latitude,
              lng: coords.longitude,
              altitude: coords.altitude,
            },
            accuracy: coords.accuracy,
            error: null,
            loading: false,
          });
        },
        (err) => {
          setState({
            coords: null,
            accuracy: null,
            error: ERROR_MESSAGES[err.code] ?? '位置情報の取得に失敗しました。',
            loading: false,
          });
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    };

    const stopWatching = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    startWatching();

    // ライフサイクル連動: バックグラウンド時にGPS監視を停止してバッテリー消費を抑制
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startWatching();
      } else {
        stopWatching();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopWatching();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return state;
};

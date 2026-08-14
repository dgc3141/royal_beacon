import { useState, useEffect } from 'react';
import { GeolocationState } from '../types';

const ERROR_MESSAGES: Record<number, string> = {
  1: '位置情報の利用を許可してください。',
  2: '現在地を取得できませんでした。',
  3: '位置情報の取得がタイムアウトしました。',
};

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coords: null,
        accuracy: null,
        error: 'お使いのブラウザは位置情報をサポートしていません。',
        loading: false,
      });
      return;
    }

    const successHandler = ({ coords }: GeolocationPosition) => {
      setState({
        coords: { lat: coords.latitude, lng: coords.longitude },
        accuracy: coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const errorHandler = (err: GeolocationPositionError) => {
      setState({
        coords: null,
        accuracy: null,
        error: ERROR_MESSAGES[err.code] ?? '位置情報の取得に失敗しました。',
        loading: false,
      });
    };

    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
};

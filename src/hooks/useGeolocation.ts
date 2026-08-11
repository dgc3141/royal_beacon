import { useState, useEffect } from 'react';
import { GeolocationState } from '../types';

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

    const successHandler = (position: GeolocationPosition) => {
      setState({
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let message = '位置情報の取得に失敗しました。';
      if (error.code === error.PERMISSION_DENIED) {
        message = '位置情報の利用を許可してください。';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = '現在地を取得できませんでした。';
      } else if (error.code === error.TIMEOUT) {
        message = '位置情報の取得がタイムアウトしました。';
      }

      setState({
        coords: null,
        accuracy: null,
        error: message,
        loading: false,
      });
    };

    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
};

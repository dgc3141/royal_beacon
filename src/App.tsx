import React from 'react';
import './App.css';
import { IMPERIAL_PALACE_LAT_LNG } from './constants';
import { calculateBearing, calculateDistance } from './utils/geo';
import { useGeolocation } from './hooks/useGeolocation';
import { useCompass } from './hooks/useCompass';
import { Compass } from './components/Compass';
import { DistanceCard } from './components/DistanceCard';

const App: React.FC = () => {
  const { coords, accuracy, error: geoError, loading: geoLoading } = useGeolocation();
  const { heading, permissionNeeded, error: compassError, requestPermission } = useCompass();

  const distanceKm = coords ? calculateDistance(coords, IMPERIAL_PALACE_LAT_LNG) : null;
  const bearing = coords ? calculateBearing(coords, IMPERIAL_PALACE_LAT_LNG) : null;

  const combinedError = geoError || compassError;

  return (
    <div className="app-root">
      <header className="app-header">
        <h1 className="app-title">皇居コンパス</h1>
        <p className="app-subtitle">IMPERIAL PALACE BEACON</p>
      </header>

      <main className="app-main">
        {geoLoading && <div className="status-message loading">GPS位置情報を取得中...</div>}

        {combinedError && <div className="status-message error-message">{combinedError}</div>}

        {permissionNeeded && !geoLoading && !combinedError && (
          <div className="permission-notice">
            <p className="permission-text">コンパスの方位精度を高めるためセンサーを有効化してください</p>
            <button className="permission-btn" onClick={requestPermission}>
              コンパスセンサーを有効化
            </button>
          </div>
        )}

        {!geoLoading && !geoError && (
          <>
            <Compass heading={heading} bearing={bearing} />
            <DistanceCard distanceKm={distanceKm} accuracy={accuracy} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <span>Target: 35.6851° N, 139.7528° E</span>
      </footer>
    </div>
  );
};

export default App;

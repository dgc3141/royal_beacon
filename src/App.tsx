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
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col items-center justify-between p-6 sm:p-8 max-w-md mx-auto relative select-none">
      {/* Header */}
      <header className="text-center pt-2 pb-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 mb-3">
          <span className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">
            Tokyo Imperial Palace
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-zinc-900">
          皇居コンパス
        </h1>
        <p className="text-[11px] font-semibold tracking-[0.25em] text-zinc-400 mt-1 uppercase">
          Imperial Palace Beacon
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1 flex flex-col items-center justify-center my-4">
        {geoLoading && (
          <div className="bg-white/80 backdrop-blur border border-zinc-200 text-zinc-600 px-6 py-4 rounded-2xl text-sm font-medium shadow-sm animate-pulse flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-zinc-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>GPS位置情報を取得中...</span>
          </div>
        )}

        {combinedError && (
          <div className="bg-zinc-900 text-white px-6 py-4 rounded-2xl text-sm font-medium shadow-lg max-w-xs text-center border border-zinc-800">
            {combinedError}
          </div>
        )}

        {permissionNeeded && !geoLoading && !combinedError && (
          <div className="bg-white/90 backdrop-blur border border-zinc-200 text-center p-5 rounded-2xl shadow-sm max-w-xs mb-4">
            <p className="text-xs text-zinc-600 mb-3 font-medium">
              コンパスの方位精度を高めるためセンサーを有効化してください
            </p>
            <button
              className="bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all shadow-md cursor-pointer"
              onClick={requestPermission}
            >
              コンパスセンサーを有効化
            </button>
          </div>
        )}

        {!geoLoading && !geoError && (
          <div className="w-full flex flex-col items-center">
            <Compass heading={heading} bearing={bearing} />
            <DistanceCard distanceKm={distanceKm} accuracy={accuracy} bearing={bearing} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-[11px] font-medium tracking-wider text-zinc-400 pb-2 text-center">
        <span>Target: 35.6851° N, 139.7528° E</span>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import './App.css';
import { IMPERIAL_PALACE_LAT_LNG } from './constants';
import { calculateBearing, calculateDistance } from './utils/geo';
import { useGeolocation } from './hooks/useGeolocation';
import { useCompass } from './hooks/useCompass';
import { Compass } from './components/Compass';

const App: React.FC = () => {
  const { coords, accuracy, error: geoError, loading: geoLoading } = useGeolocation();
  const { heading, permissionNeeded, error: compassError, requestPermission } = useCompass();

  const distanceKm = coords ? calculateDistance(coords, IMPERIAL_PALACE_LAT_LNG) : null;
  const bearing = coords ? calculateBearing(coords, IMPERIAL_PALACE_LAT_LNG) : null;

  const combinedError = geoError || compassError;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col items-center justify-between p-6 max-w-md mx-auto relative select-none">
      {/* Header: 最小限のタイトル */}
      <header className="text-center pt-4">
        <h1 className="text-xs font-bold tracking-[0.25em] text-zinc-400 uppercase">
          皇居コンパス
        </h1>
      </header>

      {/* Main: コンパス計器 & 距離表示 */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        {geoLoading && (
          <div className="text-xs font-medium text-zinc-400 animate-pulse tracking-wider">
            GPS取得中...
          </div>
        )}

        {combinedError && (
          <div className="bg-zinc-900 text-white px-5 py-3 rounded-2xl text-xs font-medium max-w-xs text-center shadow-lg">
            {combinedError}
          </div>
        )}

        {permissionNeeded && !geoLoading && !combinedError && (
          <div className="text-center">
            <button
              className="bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white text-xs font-semibold px-6 py-3 rounded-full shadow-md cursor-pointer transition-all"
              onClick={requestPermission}
            >
              コンパスを有効化
            </button>
          </div>
        )}

        {!geoLoading && !geoError && (
          <Compass heading={heading} bearing={bearing} distanceKm={distanceKm} />
        )}
      </main>

      {/* Footer: GPS精度のみ極小表示 */}
      <footer className="h-6 flex items-center justify-center">
        {accuracy !== null && !geoLoading && (
          <span className="text-[10px] font-medium text-zinc-300 tracking-wider">
            ±{Math.round(accuracy)}m
          </span>
        )}
      </footer>
    </div>
  );
};

export default App;

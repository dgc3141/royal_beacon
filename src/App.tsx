import React from 'react';
import './App.css';
import { IMPERIAL_PALACE_LAT_LNG } from './constants';
import { calculateBearing, calculateDistance, formatDistance } from './utils/geo';
import { useGeolocation } from './hooks/useGeolocation';
import { useCompass } from './hooks/useCompass';
import { useWakeLock } from './hooks/useWakeLock';
import { Compass } from './components/Compass';

const App: React.FC = () => {
  useWakeLock();
  const { coords, accuracy, error: geoError, loading: geoLoading } = useGeolocation();

  const {
    heading,
    permissionNeeded,
    needsCalibration,
    error: compassError,
    requestPermission,
  } = useCompass();

  const distanceKm = coords ? calculateDistance(coords, IMPERIAL_PALACE_LAT_LNG) : null;
  const bearing = coords ? calculateBearing(coords, IMPERIAL_PALACE_LAT_LNG) : null;

  const formattedDistance =
    distanceKm !== null ? formatDistance(distanceKm) : { value: '--', unit: 'km' };

  const combinedError = geoError || compassError;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col items-center justify-between p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] max-w-md mx-auto relative select-none">
      {/* 8の字キャリブレーション要求ガイド（センサー異常時のみ一時表示） */}
      {needsCalibration && (
        <div className="fixed top-[max(1.5rem,env(safe-area-inset-top))] bg-zinc-900/90 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 z-50 animate-bounce">
          <span className="text-base font-mono">∿</span>
          <span>端末を8の字に動かして校正してください</span>
        </div>
      )}

      {/* Header: 最小限のタイトル */}
      <header className="text-center pt-2">
        <h1 className="text-xs font-bold tracking-[0.25em] text-zinc-400 uppercase">
          皇居コンパス
        </h1>
      </header>

      {/* Main: コンパス ＋ 直下に大きく距離を表示 */}
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
          <div className="w-full flex flex-col items-center my-auto">
            <Compass heading={heading} bearing={bearing} />

            {/* コンパスの外側の下に大きく距離を表示 */}
            <div className="mt-8 flex items-baseline justify-center" data-testid="distance-value">
              <span className="text-6xl sm:text-7xl font-extrabold text-zinc-900 tracking-tight leading-none">
                {formattedDistance.value}
              </span>
              <span className="text-2xl sm:text-3xl font-medium text-zinc-400 ml-2.5">
                {formattedDistance.unit}
              </span>
            </div>
          </div>
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

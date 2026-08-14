import React from 'react';
import './App.css';
import { IMPERIAL_PALACE_LAT_LNG, IMPERIAL_PALACE_ALTITUDE_M } from './constants';
import { calculateBearing, calculateDistance, formatDistance } from './utils/geo';
import { useGeolocation } from './hooks/useGeolocation';
import { useCompass } from './hooks/useCompass';
import { useWakeLock } from './hooks/useWakeLock';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Compass } from './components/Compass';

const App: React.FC = () => {
  useWakeLock();
  const isOnline = useOnlineStatus();
  const { isInstallable, triggerInstall } = usePWAInstall();
  const { coords, accuracy, error: geoError, loading: geoLoading } = useGeolocation();

  const {
    heading,
    permissionNeeded,
    needsCalibration,
    error: compassError,
    requestPermission,
  } = useCompass();

  const distanceKm = coords
    ? calculateDistance(coords, IMPERIAL_PALACE_LAT_LNG, IMPERIAL_PALACE_ALTITUDE_M)
    : null;

  const bearing = coords ? calculateBearing(coords, IMPERIAL_PALACE_LAT_LNG) : null;

  const formattedDistance =
    distanceKm !== null ? formatDistance(distanceKm) : { value: '--', unit: 'km' };

  const combinedError = geoError || compassError;

  const distanceAriaLabel =
    distanceKm !== null
      ? `皇居までの直線距離: ${formattedDistance.value} ${
          formattedDistance.unit === 'km' ? 'キロメートル' : 'メートル'
        }`
      : '皇居までの直線距離を計算中';

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-between p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] max-w-md mx-auto relative select-none">
      {/* 8の字キャリブレーション要求ガイド（センサー異常時のみ一時表示） */}
      {needsCalibration && (
        <div
          role="alert"
          className="fixed top-[max(1.5rem,env(safe-area-inset-top))] bg-zinc-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 text-xs font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 z-50 animate-bounce"
        >
          <span className="text-base font-mono" aria-hidden="true">
            ∿
          </span>
          <span>端末を8の字に動かして校正してください</span>
        </div>
      )}

      {/* Header: 最小限のタイトル */}
      <header className="text-center pt-2">
        <h1 className="text-xs font-bold tracking-[0.25em] text-zinc-400 dark:text-zinc-500 uppercase">
          皇居コンパス
        </h1>
      </header>

      {/* Main: コンパス ＋ 直下に大きく距離を表示 */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        {geoLoading && (
          <div
            role="status"
            className="text-xs font-medium text-zinc-400 dark:text-zinc-500 animate-pulse tracking-wider"
          >
            GPS取得中...
          </div>
        )}

        {combinedError && (
          <div
            role="alert"
            className="bg-zinc-900 dark:bg-zinc-800 text-white px-5 py-3 rounded-2xl text-xs font-medium max-w-xs text-center shadow-lg"
          >
            {combinedError}
          </div>
        )}

        {permissionNeeded && !geoLoading && !combinedError && (
          <div className="text-center">
            <button
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 active:scale-95 text-white text-xs font-semibold px-6 py-3 rounded-full shadow-md cursor-pointer transition-all"
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
            <div
              className="mt-8 flex items-baseline justify-center"
              data-testid="distance-value"
              role="region"
              aria-live="polite"
              aria-label={distanceAriaLabel}
            >
              <span
                className="text-6xl sm:text-7xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none"
                aria-hidden="true"
              >
                {formattedDistance.value}
              </span>
              <span
                className="text-2xl sm:text-3xl font-medium text-zinc-400 dark:text-zinc-500 ml-2.5"
                aria-hidden="true"
              >
                {formattedDistance.unit}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer: GPS精度 ＋ オフライン状態 ＋ PWAインストール */}
      <footer className="h-6 flex items-center justify-center gap-3">
        {!isOnline && (
          <span
            className="text-[10px] font-medium text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1"
            role="status"
            aria-label="現在オフラインで動作中です（GPS測位中）"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
            オフライン
          </span>
        )}
        {accuracy !== null && !geoLoading && (
          <span
            className="text-[10px] font-medium text-zinc-300 dark:text-zinc-600 tracking-wider"
            aria-label={`GPS測位精度: 約${Math.round(accuracy)}メートル`}
          >
            ±{Math.round(accuracy)}m
          </span>
        )}
        {isInstallable && (
          <button
            onClick={triggerInstall}
            className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline underline-offset-2 cursor-pointer transition-colors"
            aria-label="アプリをホーム画面にインストール"
          >
            インストール
          </button>
        )}
      </footer>
    </div>
  );
};

export default App;

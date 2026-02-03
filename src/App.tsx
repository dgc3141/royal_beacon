import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { IMPERIAL_PALACE_LAT_LNG } from "./constants";
import { calculateDistance, calculateBearing } from "./utils";

const App: React.FC = () => {
  const [distance, setDistance] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const compassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザは位置情報をサポートしていません。");
      setLoading(false);
      return;
    }

    const successCallback = (position: GeolocationPosition) => {
      const currentLatLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setDistance(calculateDistance(currentLatLng, IMPERIAL_PALACE_LAT_LNG));
      setBearing(calculateBearing(currentLatLng, IMPERIAL_PALACE_LAT_LNG));
      setLoading(false);
      setError(null);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.error("位置情報の取得に失敗しました:", error);
      setError("位置情報の取得に失敗しました。位置情報の利用を許可してください。");
      setLoading(false);
    };

    navigator.geolocation.watchPosition(successCallback, errorCallback);
  }, []);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let orientation = 0;
      // iOS向けの処理
      if ((event as any).webkitCompassHeading) {
        orientation = (event as any).webkitCompassHeading;
      } else if (event.alpha) {
        // Android等の処理 (alphaは反時計回りの場合があるが、一般的に北=0基準であればそのまま使用)
        // ただし、デバイスによって挙動が異なるため、absoluteプロパティがあるかも確認推奨だが
        // ここでは簡易的にalphaを使用する。
        // alphaが反時計回りの場合、時計回りの方位に変換するには 360 - alpha
        // しかし、多くのブラウザ実装ではコンパスとして機能させるために時計回りの値を返すことが多い
        // ここでは単純にalphaを使用する
        orientation = event.alpha;
      }
      setDeviceOrientation(orientation);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (compassRef.current && bearing !== null) {
      // 目的地の方位 - デバイスの方位 = 画面上に対する目的地の相対角度
      const rotation = bearing - deviceOrientation;
      compassRef.current.style.transform = `rotate(${rotation}deg)`;
    }
  }, [deviceOrientation, bearing]);

  return (
    <div className="container">
      <h1 className="app-title">皇居コンパス</h1>

      {loading && <div className="loading">読み込み中...</div>}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <>
          <div className="compass-container">
            <div className="compass" ref={compassRef} data-testid="compass">
              <div className="compass-face">
                <div className="compass-rose">
                  <div className="direction north">N</div>
                  <div className="direction east">E</div>
                  <div className="direction south">S</div>
                  <div className="direction west">W</div>
                </div>
                <div className="arrow"></div>
                <div className="center-dot"></div>
              </div>
            </div>
          </div>
          <div className="distance-card">
            <div className="distance-label">皇居までの距離</div>
            <div className="distance" data-testid="distance-value">
              {distance ? distance.toFixed(2) : "--"}
              <span className="distance-unit">km</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;


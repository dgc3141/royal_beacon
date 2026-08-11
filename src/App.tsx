import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { IMPERIAL_PALACE_LAT_LNG } from "./constants";
import { calculateDistance, calculateBearing } from "./utils";

// 0-360度の境界跨ぎで逆回転を防ぐ連続角度（アンラップ）計算
const getUnwrappedAngle = (currentAngle: number, targetAngle: number): number => {
  const normTarget = ((targetAngle % 360) + 360) % 360;
  const currentNorm = ((currentAngle % 360) + 360) % 360;
  let diff = normTarget - currentNorm;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return currentAngle + diff;
};

const App: React.FC = () => {
  const [distance, setDistance] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(false);

  const compassRoseRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const prevRoseAngleRef = useRef<number>(0);
  const prevArrowAngleRef = useRef<number>(0);

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

    const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // DeviceOrientation のパーミッション確認および登録
  const setupOrientationListener = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let orientation = 0;
      if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
        // iOS: 真北を0度とする時計回りの角度
        orientation = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null && event.alpha !== undefined) {
        // Android / Pixel (Chrome): alpha は反時計回りのため 360 - alpha で時計回りに変換
        orientation = (360 - event.alpha) % 360;
      }
      setDeviceOrientation(orientation);
    };

    // Pixel / Android Chrome 向けに絶対方位(deviceorientationabsolute)を優先追加
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener("deviceorientationabsolute", handleOrientation as any, true);
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return handleOrientation;
  };

  useEffect(() => {
    // iOS 13+ の Permission 要求チェック
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      setPermissionNeeded(true);
    } else {
      const handleOrientation = setupOrientationListener();
      return () => {
        if ('ondeviceorientationabsolute' in window) {
          window.removeEventListener("deviceorientationabsolute", handleOrientation as any, true);
        } else if (window.DeviceOrientationEvent) {
          window.removeEventListener("deviceorientation", handleOrientation, true);
        }
      };
    }
  }, []);

  const requestCompassPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === "granted") {
          setPermissionNeeded(false);
          setupOrientationListener();
        } else {
          setError("コンパスセンサーへのアクセスが拒否されました。");
        }
      } catch (err) {
        console.error("パーミッションの要求に失敗しました:", err);
        setError("コンパスセンサーのパーミッション設定中にエラーが発生しました。");
      }
    }
  };

  // 文字盤と針の独立回転アニメーション制御
  useEffect(() => {
    // 1. 文字盤の回転: デバイスの向きに対して N が常に実際の北を指すよう -deviceOrientation に回転
    if (compassRoseRef.current) {
      const targetRoseAngle = -deviceOrientation;
      const unwrappedRoseAngle = getUnwrappedAngle(prevRoseAngleRef.current, targetRoseAngle);
      prevRoseAngleRef.current = unwrappedRoseAngle;
      compassRoseRef.current.style.transform = `rotate(${unwrappedRoseAngle}deg)`;
    }

    // 2. 皇居指針の回転: 画面上での皇居の相対方位 = bearing - deviceOrientation
    if (arrowRef.current && bearing !== null) {
      const targetArrowAngle = bearing - deviceOrientation;
      const unwrappedArrowAngle = getUnwrappedAngle(prevArrowAngleRef.current, targetArrowAngle);
      prevArrowAngleRef.current = unwrappedArrowAngle;
      arrowRef.current.style.transform = `translate(-50%, -100%) rotate(${unwrappedArrowAngle}deg)`;
    }
  }, [deviceOrientation, bearing]);

  return (
    <div className="container">
      <h1 className="app-title">皇居コンパス</h1>

      {loading && <div className="loading">読み込み中...</div>}

      {error && <div className="error-message">{error}</div>}

      {permissionNeeded && !loading && !error && (
        <button className="permission-btn" onClick={requestCompassPermission}>
          コンパスセンサーを有効化
        </button>
      )}

      {!loading && !error && (
        <>
          <div className="compass-container">
            <div className="compass" data-testid="compass">
              <div className="compass-face">
                <div className="compass-rose" ref={compassRoseRef}>
                  <div className="direction north">N</div>
                  <div className="direction east">E</div>
                  <div className="direction south">S</div>
                  <div className="direction west">W</div>
                </div>
                <div className="arrow" ref={arrowRef}></div>
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



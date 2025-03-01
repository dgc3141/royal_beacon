import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const imperialPalaceLatLng = { lat: 35.685175, lng: 139.752800 };

const App: React.FC = () => {
  const [distance, setDistance] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<number>(0);
  const compassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const successCallback = (position: GeolocationPosition) => {
      const currentLatLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setDistance(calculateDistance(currentLatLng, imperialPalaceLatLng));
      setBearing(calculateBearing(currentLatLng, imperialPalaceLatLng));
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.error("位置情報の取得に失敗しました:", error);
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }, []);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setDeviceOrientation(event.alpha ?? 0);
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  useEffect(() => {
    if (compassRef.current && bearing !== null) {
      const rotation = deviceOrientation + bearing;
      compassRef.current.style.transform = `rotate(${rotation}deg)`;
    }
  }, [deviceOrientation, bearing]);

  return (
    <div className="container">
      <h1 className="app-title">皇居コンパス</h1>
      <div className="compass-container">
        <div className="compass" ref={compassRef}>
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
        <div className="distance">
          {distance ? distance.toFixed(2) : "読み込み中..."}
          <span className="distance-unit">km</span>
        </div>
      </div>
    </div>
  );
};

// 2点間の距離を計算 (km)
const calculateDistance = (
  pointA: { lat: number; lng: number },
  pointB: { lat: number; lng: number }
): number => {
  const earthRadius = 6378; // 地球の半径 (km)
  const dLat = (pointB.lat - pointA.lat) * (Math.PI / 180);
  const dLon = (pointB.lng - pointA.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pointA.lat * (Math.PI / 180)) *
    Math.cos(pointB.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

// 方角を計算
const calculateBearing = (
  pointA: { lat: number; lng: number },
  pointB: { lat: number; lng: number }
): number => {
  const dLon = (pointB.lng - pointA.lng) * (Math.PI / 180);
  const y = Math.sin(dLon) * Math.cos(pointB.lat * (Math.PI / 180));
  const x =
    Math.cos(pointA.lat * (Math.PI / 180)) *
    Math.sin(pointB.lat * (Math.PI / 180)) -
    Math.sin(pointA.lat * (Math.PI / 180)) *
    Math.cos(pointB.lat * (Math.PI / 180)) *
    Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
  return bearing;
};

export default App;

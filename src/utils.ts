import { EARTH_RADIUS_KM } from './constants';

export interface LatLng {
    lat: number;
    lng: number;
}

// 2点間の距離を計算 (km)
export const calculateDistance = (pointA: LatLng, pointB: LatLng): number => {
    const dLat = (pointB.lat - pointA.lat) * (Math.PI / 180);
    const dLon = (pointB.lng - pointA.lng) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pointA.lat * (Math.PI / 180)) *
        Math.cos(pointB.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
};

// 方角を計算
export const calculateBearing = (pointA: LatLng, pointB: LatLng): number => {
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

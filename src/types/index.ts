export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeolocationState {
  coords: LatLng | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export interface CompassState {
  heading: number | null;
  permissionGranted: boolean;
  permissionNeeded: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
}

export type CardinalDirection = 
  | '北' | '北北東' | '北東' | '東北東'
  | '東' | '東南東' | '南東' | '南南東'
  | '南' | '南南西' | '南西' | '西南西'
  | '西' | '西北西' | '北西' | '北北西';

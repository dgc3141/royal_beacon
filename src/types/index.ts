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
  needsCalibration: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
}

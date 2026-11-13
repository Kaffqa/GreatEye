export type ThermalSeverity = 'critical' | 'warning' | 'elevated' | 'nominal';

export interface Hotspot {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  frp: number; // Fire Radiative Power in Megawatts (MW)
  brightnessTemp: number; // Kelvin (K)
  confidence: number; // 0 - 100%
  severity: ThermalSeverity;
  satellite: 'NOAA-20' | 'Suomi NPP' | 'Sentinel-2A' | 'Aqua' | 'Terra';
  instrument: 'VIIRS' | 'MODIS' | 'MSI';
  scanTimestampUtc: string;
  spreadVectorDeg: number;
  spreadSpeedKmH: number;
  areaHa: number;
  containmentPct: number;
  swirReflectance: number; // 0 - 1.0 (Band 12 short-wave infrared)
  smokeAod: number; // Aerosol Optical Depth (0 - 5.0)
  windSpeedKt: number;
  windDirDeg: number;
  relativeHumidityPct: number;
  historyTimeline: {
    hourOffset: number; // e.g. -24, -18, -12, -6, 0 (current)
    frp: number;
    brightnessTemp: number;
    areaHa: number;
  }[];
}

export interface SatelliteTrack {
  id: string;
  name: string;
  code: string;
  altitudeKm: number;
  velocityKmS: number;
  inclinationDeg: number;
  nextPassUtc: string;
  status: 'ONLINE' | 'ACTIVE_SWATH' | 'TRANSMITTING' | 'CALIBRATING';
  swathWidthKm: number;
  currentLat: number;
  currentLng: number;
  orbitPath: [number, number][]; // coordinates for ground track
}

export interface LayerVisibility {
  viirsHotspots: boolean;
  modisHotspots: boolean;
  sentinelSwir: boolean;
  thermalHeatmap: boolean;
  smokeAod: boolean;
  windVectors: boolean;
  satelliteTracks: boolean;
  burnScarPerimeters: boolean;
}

export interface FilterState {
  searchQuery: string;
  minConfidence: number;
  minFrp: number;
  severityFilter: ThermalSeverity | 'all';
  satelliteFilter: string;
}

export interface ViewportTelemetry {
  centerLat: number;
  centerLng: number;
  zoom: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  fovDeg: number;
  utcTime: string;
  sunElevationDeg: number;
}

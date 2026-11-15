export type ThermalSeverity = 'critical' | 'warning' | 'elevated' | 'nominal';

export type ViewMode = 'landing' | 'dashboard';

export type MapDisplayMode = 'clusters' | 'heatmap' | 'split';
export type HeatmapWeightMode = 'frp' | 'frequency';
export type HeatmapGradientPreset = 'nasa' | 'inferno' | 'gambut';

export interface HeatmapConfig {
  radius: number; // in pixels, 15 - 50
  blur: number; // in pixels, 10 - 35
  weightMode: HeatmapWeightMode;
  gradientPreset: HeatmapGradientPreset;
  maxIntensity: number;
  opacity: number;
}

// --- Data Types from the 3 CSVs ---

export interface IndeksHarian {
  tanggal: string; // YYYY-MM-DD
  kejadian: number;
  frp_harmonis: number;
  data_lengkap: boolean;
  kejadian_valid: number;
  z_anomali: number;
  anomali_tinggi: boolean;
  tahun: number;
  bulan: number;
  hari: number;
}

export interface RingkasanHarian {
  tanggal: string;
  provinsi: string;
  pulau: string;
  veg: number; // 1 = vegetasi/lahan, 0 = non-vegetasi/flare industri
  kejadian: number;
  hotspot: number;
  n_modis: number;
  n_viirs: number;
  keduanya: number;
  frp: number;
}

export interface ClusterPoint {
  id: string;
  d: string; // date YYYY-MM-DD
  nh: number; // n_hotspot
  nm: number; // n_modis
  lat: number;
  lon: number;
  frp: number; // frp_total
  frpm: number; // frp_maks
  vegP: number; // persen_type0 (1.0 = vegetasi, 0.0 = non-veg)
  nv: number; // n_viirs
  s: string; // 'Keduanya' | 'Hanya VIIRS' | 'Hanya MODIS'
  pr: string; // provinsi
  pu: string; // pulau
}

// Spatiotemporal Filter State
export interface SpatiotemporalFilter {
  selectedYear: number; // 2023 | 2024 | 2025 | 2026
  selectedMonth: number | 'all'; // 1 - 12 or 'all'
  selectedDate: string | null; // specific YYYY-MM-DD or null
  selectedIsland: string | 'all';
  selectedProvince: string | 'all';
  onlyVegetation: boolean; // filter veg == 1
  sensorOrigin: 'all' | 'Keduanya' | 'Hanya VIIRS' | 'Hanya MODIS';
  minFrp: number;
}

// Aggregated Metrics for Mission Control HUD
export interface MissionMetrics {
  totalRawModis: number;
  totalRawViirs: number;
  totalRawHotspots: number;
  totalCleanClusters: number;
  reductionRatePct: number;
  totalFrp: number;
  criticalDaysCount: number;
}

export interface LayerVisibility {
  clusterPoints: boolean;
  thermalHeatmap: boolean;
  showKeduanya: boolean;
  showViirsOnly: boolean;
  showModisOnly: boolean;
  provincialBoundaries: boolean;
}

export interface Hotspot {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  frp: number;
  brightnessTemp: number;
  confidence: number;
  severity: ThermalSeverity;
  satellite: string;
  instrument: string;
  scanTimestampUtc: string;
}

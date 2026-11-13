import { Hotspot, ThermalSeverity, FilterState } from '../types';

/**
 * Format latitude and longitude into high-precision NASA telemetry notation
 * e.g., "39.7592° N, 121.6219° W"
 */
export function formatLatLon(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const absLat = Math.abs(lat).toFixed(4);
  const absLng = Math.abs(lng).toFixed(4);
  return `${absLat}° ${latDir}, ${absLng}° ${lngDir}`;
}

/**
 * Classifies thermal severity tier strictly following design system:
 * - Nominal: < 50 MW
 * - Elevated: 50 - 180 MW
 * - Warning: 180 - 450 MW
 * - Critical: >= 450 MW or extreme brightness temp (> 400 K)
 */
export function getSeverityFromFrp(frp: number, brightnessTemp: number = 340): ThermalSeverity {
  if (frp >= 450 || brightnessTemp >= 410) {
    return 'critical';
  }
  if (frp >= 180 || brightnessTemp >= 370) {
    return 'warning';
  }
  if (frp >= 50 || brightnessTemp >= 330) {
    return 'elevated';
  }
  return 'nominal';
}

/**
 * Returns exact design system hex colors for thermal scales
 */
export function getSeverityColor(severity: ThermalSeverity): string {
  switch (severity) {
    case 'critical':
      return '#EF4444'; // thermal-critical
    case 'warning':
      return '#F97316'; // thermal-warning / primary orange
    case 'elevated':
      return '#FBBF24'; // thermal-elevated amber
    case 'nominal':
      return '#10B981'; // thermal-nominal emerald
    default:
      return '#06B6D4'; // spectral-sensor cyan
  }
}

/**
 * Great-circle distance between two coordinates in kilometers (Haversine formula)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Approximate solar elevation angle (degrees above horizon) based on lat/lon and UTC date
 */
export function calculateSunElevation(lat: number, lon: number, date: Date): number {
  const safeLat = Math.max(-85, Math.min(85, lat));
  const safeLon = ((((lon + 180) % 360) + 360) % 360) - 180;
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getUTCFullYear(), 0, 0).getTime()) / 86400000
  );
  // Declination approximation in radians
  const declination =
    23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180) * (Math.PI / 180);
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarTimeHours = (utcHours + safeLon / 15 + 24) % 24;
  const hourAngle = (solarTimeHours - 12) * 15 * (Math.PI / 180);
  const latRad = (safeLat * Math.PI) / 180;

  const sinElevation =
    Math.sin(latRad) * Math.sin(declination) +
    Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle);
  const elevationDeg = (Math.asin(Math.max(-1, Math.min(1, sinElevation))) * 180) / Math.PI;
  if (isNaN(elevationDeg)) return 0;
  return Math.round(elevationDeg * 10) / 10;
}

/**
 * Interpolates or resolves hotspot FRP for a given temporal scrubber offset (-24 to 0 hours)
 */
export function getInterpolatedHotspotAtTime(hotspot: Hotspot, hourOffset: number): Hotspot {
  if (hourOffset === 0 || !hotspot.historyTimeline || hotspot.historyTimeline.length === 0) {
    return hotspot;
  }

  // Find nearest timeline segment
  const sorted = [...hotspot.historyTimeline].sort((a, b) => a.hourOffset - b.hourOffset);
  const closest = sorted.reduce((prev, curr) =>
    Math.abs(curr.hourOffset - hourOffset) < Math.abs(prev.hourOffset - hourOffset) ? curr : prev
  );

  const updatedFrp = closest.frp;
  const updatedTemp = closest.brightnessTemp;
  const updatedArea = closest.areaHa;
  const updatedSeverity = getSeverityFromFrp(updatedFrp, updatedTemp);

  return {
    ...hotspot,
    frp: updatedFrp,
    brightnessTemp: updatedTemp,
    areaHa: updatedArea,
    severity: updatedSeverity,
  };
}

/**
 * Filters hotspots based on query, confidence, FRP, severity, and satellite
 */
export function filterHotspots(
  hotspots: Hotspot[],
  filter: FilterState,
  timeOffset: number = 0
): Hotspot[] {
  return hotspots
    .map((h) => getInterpolatedHotspotAtTime(h, timeOffset))
    .filter((h) => {
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(query);
        const matchesRegion = h.region.toLowerCase().includes(query);
        const matchesCountry = h.country.toLowerCase().includes(query);
        const matchesSatellite = h.satellite.toLowerCase().includes(query);
        if (!matchesName && !matchesRegion && !matchesCountry && !matchesSatellite) {
          return false;
        }
      }

      if (h.confidence < filter.minConfidence) {
        return false;
      }

      if (h.frp < filter.minFrp) {
        return false;
      }

      if (filter.severityFilter !== 'all' && h.severity !== filter.severityFilter) {
        return false;
      }

      if (filter.satelliteFilter !== 'ALL' && h.satellite !== filter.satelliteFilter) {
        return false;
      }

      return true;
    });
}

/**
 * Generates RFC 7946 compliant GeoJSON FeatureCollection for Supabase/GIS export
 */
export function exportToGeoJson(hotspots: Hotspot[]): string {
  const geojson = {
    type: 'FeatureCollection',
    metadata: {
      generatedAt: new Date().toISOString(),
      generator: 'Orbital Observation System (Sentinel-VIIRS/MODIS)',
      count: hotspots.length,
    },
    features: hotspots.map((h) => ({
      type: 'Feature',
      id: h.id,
      geometry: {
        type: 'Point',
        coordinates: [h.lng, h.lat],
      },
      properties: {
        name: h.name,
        region: h.region,
        country: h.country,
        frp_mw: h.frp,
        brightness_temp_k: h.brightnessTemp,
        confidence_pct: h.confidence,
        severity: h.severity,
        satellite: h.satellite,
        instrument: h.instrument,
        scan_timestamp_utc: h.scanTimestampUtc,
        spread_vector_deg: h.spreadVectorDeg,
        spread_speed_kmh: h.spreadSpeedKmH,
        area_ha: h.areaHa,
        containment_pct: h.containmentPct,
        swir_reflectance: h.swirReflectance,
        smoke_aod: h.smokeAod,
      },
    })),
  };

  return JSON.stringify(geojson, null, 2);
}

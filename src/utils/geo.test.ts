import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatLatLon,
  getSeverityFromFrp,
  calculateDistanceKm,
  filterHotspots,
  exportToGeoJson,
} from './geo';
import { Hotspot, FilterState } from '../types';

const mockHotspot: Hotspot = {
  id: 'HOT-01',
  name: 'Sierra Feather River Complex',
  region: 'California',
  country: 'USA',
  lat: 39.8123,
  lng: -121.4567,
  frp: 520,
  brightnessTemp: 425,
  confidence: 96,
  severity: 'critical',
  satellite: 'NOAA-20',
  instrument: 'VIIRS',
  scanTimestampUtc: '2026-11-08T22:30:00Z',
  spreadVectorDeg: 42,
  spreadSpeedKmH: 4.8,
  areaHa: 14200,
  containmentPct: 18,
  swirReflectance: 0.88,
  smokeAod: 3.4,
  windSpeedKt: 22,
  windDirDeg: 215,
  relativeHumidityPct: 11,
  historyTimeline: [
    { hourOffset: -24, frp: 280, brightnessTemp: 360, areaHa: 9500 },
    { hourOffset: -12, frp: 390, brightnessTemp: 385, areaHa: 12000 },
    { hourOffset: 0, frp: 520, brightnessTemp: 425, areaHa: 14200 },
  ],
};

test('formatLatLon formats coordinates with hemisphere symbols', () => {
  assert.equal(formatLatLon(39.81234, -121.45678), '39.8123° N, 121.4568° W');
  assert.equal(formatLatLon(-14.235, 131.02), '14.2350° S, 131.0200° E');
});

test('getSeverityFromFrp classifies thermal tiers accurately', () => {
  assert.equal(getSeverityFromFrp(550, 430), 'critical');
  assert.equal(getSeverityFromFrp(300, 380), 'warning');
  assert.equal(getSeverityFromFrp(120, 340), 'elevated');
  assert.equal(getSeverityFromFrp(35, 310), 'nominal');
});

test('calculateDistanceKm computes geodesic distance correctly', () => {
  // Distance between San Francisco (37.7749, -122.4194) and Los Angeles (34.0522, -118.2437) is approx 559 km
  const distance = calculateDistanceKm(37.7749, -122.4194, 34.0522, -118.2437);
  assert.ok(distance > 550 && distance < 570);
});

test('filterHotspots applies search, severity, and confidence thresholds', () => {
  const filters: FilterState = {
    searchQuery: 'California',
    minConfidence: 80,
    minFrp: 100,
    severityFilter: 'critical',
    satelliteFilter: 'ALL',
  };

  const results = filterHotspots([mockHotspot], filters, 0);
  assert.equal(results.length, 1);

  const nonMatching = filterHotspots([mockHotspot], { ...filters, searchQuery: 'Australia' }, 0);
  assert.equal(nonMatching.length, 0);

  const highFrpFilter = filterHotspots([mockHotspot], { ...filters, minFrp: 9999 }, 0);
  assert.equal(highFrpFilter.length, 0);
});

test('exportToGeoJson creates standard GeoJSON feature collection', () => {
  const jsonStr = exportToGeoJson([mockHotspot]);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.type, 'FeatureCollection');
  assert.equal(parsed.features.length, 1);
  assert.equal(parsed.features[0].geometry.type, 'Point');
  assert.equal(parsed.features[0].geometry.coordinates[0], -121.4567);
  assert.equal(parsed.features[0].geometry.coordinates[1], 39.8123);
  assert.equal(parsed.features[0].properties.frp_mw, 520);
});

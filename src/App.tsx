import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapCanvas } from './components/MapCanvas';
import { TelemetryRail } from './components/TelemetryRail';
import { TimelineScrubber } from './components/TimelineScrubber';
import { CoordinateFooter } from './components/CoordinateFooter';
import { SpectralModal } from './components/SpectralModal';
import {
  Hotspot,
  SatelliteTrack,
  LayerVisibility,
  FilterState,
  ViewportTelemetry,
} from './types';
import { INITIAL_HOTSPOTS, SATELLITE_TRACKS } from './data/mockData';
import { filterHotspots, calculateDistanceKm } from './utils/geo';

export default function App() {
  // Datasets
  const [satellites] = useState<SatelliteTrack[]>(SATELLITE_TRACKS);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(
    INITIAL_HOTSPOTS[0]
  );

  // Layer Toggles
  const [layers, setLayers] = useState<LayerVisibility>({
    viirsHotspots: true,
    modisHotspots: true,
    sentinelSwir: true,
    thermalHeatmap: true,
    smokeAod: true,
    windVectors: true,
    satelliteTracks: true,
    burnScarPerimeters: true,
  });

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    minConfidence: 75,
    minFrp: 0,
    severityFilter: 'all',
    satelliteFilter: 'ALL',
  });

  // Temporal Simulation State (-24h to 0h)
  const [timeOffsetHours, setTimeOffsetHours] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Viewport / Map programmatic flight target
  const [flyToTarget, setFlyToTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
    timestamp: number;
  } | null>(null);

  // Continuous Viewport Telemetry for Coordinate Footer
  const [viewportTelemetry, setViewportTelemetry] = useState<ViewportTelemetry>({
    centerLat: 25.0,
    centerLng: 0.0,
    zoom: 3,
    bounds: {
      north: 65.0,
      south: -45.0,
      east: 120.0,
      west: -120.0,
    },
    fovDeg: 45.0,
    utcTime: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    sunElevationDeg: 42.1,
  });

  // UI Panels state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState<boolean>(true);
  const [isSpectralModalOpen, setIsSpectralModalOpen] = useState<boolean>(false);

  // Keyboard shortcut listener (Space to play/pause simulation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Hotspots based on current filters and temporal scrub offset
  const filteredHotspots = useMemo(() => {
    return filterHotspots(INITIAL_HOTSPOTS, filters, timeOffsetHours);
  }, [filters, timeOffsetHours]);

  // Keep selectedHotspot synchronized if filtered list updates
  useEffect(() => {
    if (selectedHotspot) {
      const match = filteredHotspots.find((h) => h.id === selectedHotspot.id);
      if (match) {
        setSelectedHotspot(match);
      }
    }
  }, [timeOffsetHours, filteredHotspots]);

  // Simulation loop when isPlaying is active
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 1000 / playbackSpeed;
    const timer = setInterval(() => {
      setTimeOffsetHours((prev) => {
        if (prev >= 0) {
          return -24; // Loop back to start
        }
        return Math.min(0, Math.round((prev + 1) * 10) / 10);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Handlers
  const handleToggleLayer = (layerKey: keyof LayerVisibility) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  const handleFlyToRegion = (lat: number, lng: number, zoom: number) => {
    setFlyToTarget({ lat, lng, zoom, timestamp: Date.now() });

    // Automatically select the nearest hotspot in that sector
    if (INITIAL_HOTSPOTS.length > 0) {
      let nearest = INITIAL_HOTSPOTS[0];
      let minDist = calculateDistanceKm(lat, lng, nearest.lat, nearest.lng);
      for (const h of INITIAL_HOTSPOTS) {
        const d = calculateDistanceKm(lat, lng, h.lat, h.lng);
        if (d < minDist) {
          minDist = d;
          nearest = h;
        }
      }
      setSelectedHotspot(nearest);
    }
  };

  const handleFlyToHotspot = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setFlyToTarget({ lat: hotspot.lat, lng: hotspot.lng, zoom: 8, timestamp: Date.now() });
  };

  const handleResetView = () => {
    setFlyToTarget({ lat: 25.0, lng: 0.0, zoom: 3, timestamp: Date.now() });
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-full max-w-full bg-[#090D16] text-[#dfe2ef] overflow-hidden select-none font-['Geist']">
      {/* Top Operational Command Bar */}
      <Header
        hotspots={filteredHotspots}
        satellites={satellites}
        onOpenSpectralModal={() => setIsSpectralModalOpen(true)}
        onResetView={handleResetView}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isTelemetryOpen={isTelemetryOpen}
        onToggleTelemetry={() => setIsTelemetryOpen(!isTelemetryOpen)}
        selectedHotspot={selectedHotspot}
      />

      {/* Main Multi-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden relative w-full max-w-full min-w-0">
        {/* Left Orbital Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          filters={filters}
          onFilterChange={setFilters}
          satellites={satellites}
          onFlyToRegion={handleFlyToRegion}
        />

        {/* Central Map Canvas */}
        <main className="flex-1 min-w-0 relative flex flex-col h-full overflow-hidden">
          <MapCanvas
            hotspots={filteredHotspots}
            satellites={satellites}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
            layers={layers}
            flyToTarget={flyToTarget}
            onViewportChange={setViewportTelemetry}
            onOpenSpectralModal={() => setIsSpectralModalOpen(true)}
          />
        </main>

        {/* Right Analytical Telemetry Rail (Toggleable for responsive map exploration) */}
        {isTelemetryOpen && (
          <TelemetryRail
            selectedHotspot={selectedHotspot}
            hotspots={filteredHotspots}
            onSelectHotspot={setSelectedHotspot}
            onFlyToHotspot={handleFlyToHotspot}
            onOpenSpectralModal={() => setIsSpectralModalOpen(true)}
            satellites={satellites}
          />
        )}
      </div>

      {/* Temporal Timeline Scrubber */}
      <TimelineScrubber
        timeOffsetHours={timeOffsetHours}
        onTimeOffsetChange={setTimeOffsetHours}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
      />

      {/* Docked Coordinate Matrix Readout Footer */}
      <CoordinateFooter telemetry={viewportTelemetry} />

      {/* Multi-Spectral Radiometric Modal */}
      <SpectralModal
        isOpen={isSpectralModalOpen}
        onClose={() => setIsSpectralModalOpen(false)}
        selectedHotspot={selectedHotspot || INITIAL_HOTSPOTS[0]}
        hotspots={INITIAL_HOTSPOTS}
        onSelectHotspot={setSelectedHotspot}
      />
    </div>
  );
}

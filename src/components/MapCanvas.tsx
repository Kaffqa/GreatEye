import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { HeatmapLayer } from './HeatmapLayer';
import { HeatmapToolbar } from './HeatmapToolbar';
import { ClusterPoint, LayerVisibility, HeatmapConfig, MapDisplayMode } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../utils/i18n';
import {
  Flame,
  Satellite,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  Gauge,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Crosshair,
  Copy,
  Check,
  Zap,
  Sliders,
  AlertCircle,
} from 'lucide-react';

interface MapCanvasProps {
  clusters: ClusterPoint[];
  selectedCluster: ClusterPoint | null;
  onSelectCluster: (cluster: ClusterPoint | null) => void;
  layers: LayerVisibility;
  flyToTarget: { lat: number; lng: number; zoom: number; timestamp: number } | null;
  onCursorMove?: (lat: number, lng: number) => void;
  isSidebarOpen?: boolean;
  isAnalyticsOpen?: boolean;
  onResetFilter?: () => void;
}

// Predefined static PathOptions for 60 FPS zero-allocation canvas rendering
const STATIC_PATH_OPTIONS = {
  keduanya: { color: '#06B6D4', weight: 1, fillColor: '#06B6D4', fillOpacity: 0.85 },
  kritis: { color: '#EF4444', weight: 1, fillColor: '#EF4444', fillOpacity: 0.85 },
  sedang: { color: '#F97316', weight: 1, fillColor: '#F97316', fillOpacity: 0.85 },
  rendah: { color: '#EAB308', weight: 1, fillColor: '#EAB308', fillOpacity: 0.85 },
};

// Controller component to track map movements and viewport bounds smoothly & responsively
const MapController: React.FC<{
  flyToTarget: { lat: number; lng: number; zoom: number; timestamp: number } | null;
  onBoundsChange: (bounds: L.LatLngBounds, zoom: number) => void;
  onCursorMove?: (lat: number, lng: number) => void;
  coordBadgeRef?: React.RefObject<HTMLDivElement | null>;
  onMapClick?: () => void;
  isSidebarOpen?: boolean;
  isAnalyticsOpen?: boolean;
  lastMarkerClickRef: React.MutableRefObject<number>;
}> = ({ flyToTarget, onBoundsChange, onCursorMove, coordBadgeRef, onMapClick, isSidebarOpen, isAnalyticsOpen, lastMarkerClickRef }) => {
  const map = useMap();
  const lastTargetTime = useRef<number>(0);

  // Programmatic flight animation
  useEffect(() => {
    if (flyToTarget && flyToTarget.timestamp !== lastTargetTime.current) {
      lastTargetTime.current = flyToTarget.timestamp;
      map.flyTo([flyToTarget.lat, flyToTarget.lng], flyToTarget.zoom, {
        duration: 1.0,
        easeLinearity: 0.25,
      });
    }
  }, [flyToTarget, map]);

  // Handle ResizeObserver to automatically resize map whenever container expands/shrinks
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      onBoundsChange(map.getBounds(), map.getZoom());
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [map, onBoundsChange]);

  // Trigger invalidateSize during sidebar collapse/expand transitions
  useEffect(() => {
    const t1 = setTimeout(() => {
      map.invalidateSize();
      onBoundsChange(map.getBounds(), map.getZoom());
    }, 50);
    const t2 = setTimeout(() => {
      map.invalidateSize();
      onBoundsChange(map.getBounds(), map.getZoom());
    }, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isSidebarOpen, isAnalyticsOpen, map, onBoundsChange]);

  // Track map movements and cursor coordinates with zero React re-render
  useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds(), map.getZoom());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds(), map.getZoom());
    },
    mousemove: (e) => {
      if (coordBadgeRef?.current) {
        coordBadgeRef.current.textContent = `LAT: ${e.latlng.lat.toFixed(4)}° | LON: ${e.latlng.lng.toFixed(4)}°`;
      }
      if (onCursorMove) {
        onCursorMove(e.latlng.lat, e.latlng.lng);
      }
    },
    click: () => {
      if (Date.now() - lastMarkerClickRef.current < 250) {
        return;
      }
      if (onMapClick) {
        onMapClick();
      }
    },
  });

  return null;
};

// High-speed Canvas renderer
const canvasRenderer = L.canvas({ padding: 0.2 });

export const MapCanvas: React.FC<MapCanvasProps> = React.memo(({
  clusters,
  selectedCluster,
  onSelectCluster,
  layers,
  flyToTarget,
  onCursorMove,
  isSidebarOpen,
  isAnalyticsOpen,
  onResetFilter,
}) => {
  const { theme, language, showRipple } = usePreferences();
  const t = useTranslation(language);

  const indonesiaCenter: [number, number] = [-0.7893, 113.9213];
  const indonesiaBounds: [[number, number], [number, number]] = [
    [-13.0, 93.5],
    [8.0, 142.5],
  ];

  const coordBadgeRef = useRef<HTMLDivElement>(null);
  const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const [renderMode, setRenderMode] = useState<'ultra-smooth' | 'all'>('ultra-smooth');
  const [basemapStyle, setBasemapStyle] = useState<'dark-gray' | 'satellite'>('satellite');

  // Unified Popover States
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [isHeatmapSettingsOpen, setIsHeatmapSettingsOpen] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const lastMarkerClickRef = useRef<number>(0);

  // Epicenter Ripple Animation state
  const [activeRipple, setActiveRipple] = useState<{ lat: number; lng: number } | null>(null);

  const toggleHeatmapSettings = () => {
    setIsHeatmapSettingsOpen((prev) => {
      if (!prev) setIsLegendOpen(false);
      return !prev;
    });
  };

  const toggleLegend = () => {
    setIsLegendOpen((prev) => {
      if (!prev) setIsHeatmapSettingsOpen(false);
      return !prev;
    });
  };

  // Map Display Mode: 'clusters' | 'heatmap' | 'split'
  const [mapMode, setMapMode] = useState<MapDisplayMode>('clusters');

  // Heatmap Configuration (Default: 15 px minimum tight radius)
  const [heatmapConfig, setHeatmapConfig] = useState<HeatmapConfig>({
    radius: 15,
    blur: 10,
    weightMode: 'frp',
    gradientPreset: 'nasa',
    maxIntensity: 60,
    opacity: 0.85,
  });

  // Local programmatic flyTo target for Indonesian Epicenters
  const [internalFlyTo, setInternalFlyTo] = useState<{
    lat: number;
    lng: number;
    zoom: number;
    timestamp: number;
  } | null>(null);

  // Trigger Ripple Wave on flight to epicenters
  useEffect(() => {
    const target = internalFlyTo || flyToTarget;
    if (target && showRipple) {
      setActiveRipple({ lat: target.lat, lng: target.lng });
      const timer = setTimeout(() => {
        setActiveRipple(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [internalFlyTo, flyToTarget, showRipple]);

  // Create DivIcon for Ripple Wave
  const rippleDivIcon = useMemo(() => {
    return L.divIcon({
      className: 'epicenter-ripple-div',
      html: `
        <div style="position:relative; width:0; height:0;">
          <div class="absolute -top-12 -left-12 w-24 h-24 rounded-full border-2 border-cyan-400 animate-ripple-ring-1 pointer-events-none"></div>
          <div class="absolute -top-12 -left-12 w-24 h-24 rounded-full border-2 border-amber-400 animate-ripple-ring-2 pointer-events-none"></div>
          <div class="absolute -top-12 -left-12 w-24 h-24 rounded-full border-2 border-rose-500 animate-ripple-ring-3 pointer-events-none"></div>
          <div class="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] pointer-events-none"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }, []);

  // Highly optimized viewport & LOD filtering for 60 FPS smooth rendering
  const visibleClusters = useMemo(() => {
    if (!clusters.length) return [];

    let inBounds = clusters;
    if (currentBounds) {
      const south = currentBounds.getSouth() - 0.2;
      const north = currentBounds.getNorth() + 0.2;
      const west = currentBounds.getWest() - 0.2;
      const east = currentBounds.getEast() + 0.2;

      inBounds = clusters.filter(
        (c) => c.lat >= south && c.lat <= north && c.lon >= west && c.lon <= east
      );
    }

    if (renderMode === 'all') {
      if (inBounds.length > 25000) {
        const step = Math.ceil(inBounds.length / 25000);
        const sampled: ClusterPoint[] = [];
        for (let i = 0; i < inBounds.length; i += step) {
          sampled.push(inBounds[i]);
        }
        return sampled;
      }
      return inBounds;
    }

    // Ultra-smooth Mode budget: 1,200 for national (zoom <= 5), 2,500 for regional (zoom 6-7), 9,000 for local (zoom >= 8)
    const maxBudget = currentZoom <= 5 ? 1200 : currentZoom <= 7 ? 2500 : 9000;
    if (inBounds.length > maxBudget) {
      const step = Math.ceil(inBounds.length / maxBudget);
      const sampled: ClusterPoint[] = [];
      for (let i = 0; i < inBounds.length; i += step) {
        sampled.push(inBounds[i]);
      }
      return sampled;
    }

    return inBounds;
  }, [clusters, currentBounds, currentZoom, renderMode]);

  const getColorByCluster = (c: ClusterPoint) => {
    if (c.s === 'Keduanya') return '#06B6D4'; // Cyan (MODIS + VIIRS Overlap)
    if (c.frp > 50) return '#EF4444'; // Red (Critical)
    if (c.frp > 15) return '#F97316'; // Orange (Elevated)
    return '#EAB308'; // Amber (Moderate/Low)
  };

  const getRadiusByHotspotCount = (count: number) => {
    if (currentZoom <= 5) return 3.5;
    if (count >= 5) return 7;
    if (count >= 3) return 5;
    return 4;
  };

  const handleCopyCoords = (lat: number, lon: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div
      style={{ contain: 'layout paint', willChange: 'transform' }}
      className={`relative w-full h-full overflow-hidden select-none transition-colors ${
        theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#050811]'
      }`}
    >
      {/* Subtle Top 2px Progress/Scanline Indicator */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80 z-20 pointer-events-none animate-pulse" />

      <MapContainer
        center={indonesiaCenter}
        zoom={5}
        minZoom={4}
        maxZoom={14}
        maxBounds={indonesiaBounds}
        maxBoundsViscosity={0.7}
        className="w-full h-full z-0"
        preferCanvas={true}
      >
        <MapController
          flyToTarget={internalFlyTo || flyToTarget}
          onBoundsChange={(b, z) => {
            setCurrentBounds(b);
            setCurrentZoom(z);
          }}
          onCursorMove={onCursorMove}
          coordBadgeRef={coordBadgeRef}
          onMapClick={() => onSelectCluster(null)}
          isSidebarOpen={isSidebarOpen}
          isAnalyticsOpen={isAnalyticsOpen}
          lastMarkerClickRef={lastMarkerClickRef}
        />

        {/* Dynamic Dual Theme Basemap: Esri Light Gray / Dark Gray or Satellite */}
        {basemapStyle === 'dark-gray' ? (
          theme === 'light' ? (
            <TileLayer
              key="esri-light-gray"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, USGS, NOAA, NASA FIRMS'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
              keepBuffer={6}
              updateWhenZooming={false}
              updateWhenIdle={true}
            />
          ) : (
            <TileLayer
              key="esri-dark-gray"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, USGS, NOAA, NASA FIRMS'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
              keepBuffer={6}
              updateWhenZooming={false}
              updateWhenIdle={true}
            />
          )
        ) : (
          <TileLayer
            key="esri-satellite"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics, NASA FIRMS'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={17}
            keepBuffer={6}
            updateWhenZooming={false}
            updateWhenIdle={true}
          />
        )}

        {/* HEATMAP LAYER */}
        {(mapMode === 'heatmap' || mapMode === 'split') && (
          <HeatmapLayer clusters={visibleClusters} config={heatmapConfig} />
        )}

        {/* PURE CANVAS CIRCLE MARKERS */}
        {(mapMode === 'clusters' || mapMode === 'split') &&
          layers.clusterPoints &&
          visibleClusters.map((c) => {
            const radius = getRadiusByHotspotCount(c.nh);
            const pathOption =
              c.s === 'Keduanya'
                ? STATIC_PATH_OPTIONS.keduanya
                : c.frp > 50
                ? STATIC_PATH_OPTIONS.kritis
                : c.frp > 15
                ? STATIC_PATH_OPTIONS.sedang
                : STATIC_PATH_OPTIONS.rendah;

            return (
              <CircleMarker
                key={c.id}
                center={[c.lat, c.lon]}
                radius={mapMode === 'split' ? radius - 0.5 : radius}
                renderer={canvasRenderer}
                pathOptions={pathOption}
                eventHandlers={{
                  click: (e) => {
                    lastMarkerClickRef.current = Date.now();
                    if (e && e.originalEvent) {
                      e.originalEvent.stopPropagation();
                    }
                    onSelectCluster(c);
                  },
                }}
              />
            );
          })}

        {/* RIPPLE WAVE EFFECT AT EPICENTER JUMP */}
        {showRipple && activeRipple && (
          <Marker
            position={[activeRipple.lat, activeRipple.lng]}
            icon={rippleDivIcon}
            interactive={false}
          />
        )}

        {/* DEDICATED SELECTION OVERLAY */}
        {selectedCluster && (
          <CircleMarker
            center={[selectedCluster.lat, selectedCluster.lon]}
            radius={18}
            pathOptions={{
              color: '#06B6D4',
              weight: 2,
              dashArray: '4, 4',
              fillColor: '#06B6D4',
              fillOpacity: 0.15,
            }}
            interactive={false}
          />
        )}
      </MapContainer>

      {/* EMPTY STATE FEEDBACK OVERLAY */}
      {clusters.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-6 rounded-2xl bg-slate-950/98 border border-slate-800 shadow-2xl text-center space-y-3 max-w-sm pointer-events-auto animate-in zoom-in-95">
          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-slate-100">{t.mapEmptyTitle}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.mapEmptyDesc}</p>
          </div>
          {onResetFilter && (
            <button
              onClick={onResetFilter}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              {t.mapEmptyReset}
            </button>
          )}
        </div>
      )}

      {/* SELECTED CLUSTER INSPECTOR MODAL DRAWER / MOBILE BOTTOM SHEET */}
      {selectedCluster && (
        <>
          {/* Mobile backdrop */}
          <div
            onClick={() => onSelectCluster(null)}
            className="fixed inset-0 bg-black/40 z-30 md:hidden animate-in fade-in duration-200"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`fixed md:absolute inset-x-0 bottom-0 md:bottom-auto md:top-4 md:right-4 md:inset-x-auto z-40 md:z-20 w-full md:w-84 max-w-full md:max-w-[calc(100vw-2rem)] rounded-t-3xl md:rounded-2xl border-t md:border p-4 shadow-2xl font-mono text-xs space-y-3 pointer-events-auto max-h-[75vh] md:max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-6 md:slide-in-from-top-2 duration-200 ${
              theme === 'light'
                ? 'bg-white/98 border-slate-200 text-slate-800 shadow-slate-300/50'
                : 'bg-[#070c18]/98 border-slate-800 text-slate-100 shadow-cyan-950/80'
            }`}
          >
            {/* Mobile Drag Handle Bar */}
            <div className="w-12 h-1 bg-slate-500/40 rounded-full mx-auto mb-1 md:hidden" />
          {/* Header Card */}
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 animate-pulse shadow-md"
                style={{ backgroundColor: getColorByCluster(selectedCluster) }}
              />
              <span className="font-bold text-xs tracking-wide">
                {language === 'en' ? 'CLUSTER CENTROID DETAIL' : 'DETAIL CENTROID KLASTER'}
              </span>
            </div>
            <button
              onClick={() => onSelectCluster(null)}
              className="p-1 rounded-lg hover:bg-slate-800/20 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Badge Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`p-2 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Total FRP</span>
              </div>
              <div className="text-base font-bold text-amber-500 mt-0.5">
                {selectedCluster.frp.toFixed(1)} <span className="text-[10px] font-normal">MW</span>
              </div>
            </div>

            <div
              className={`p-2 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-500" />
                <span>Titik Hotspot</span>
              </div>
              <div className="text-base font-bold text-cyan-500 mt-0.5">
                {selectedCluster.nh}{' '}
                <span className="text-[10px] font-normal">
                  ({selectedCluster.nm}M + {selectedCluster.nv}V)
                </span>
              </div>
            </div>
          </div>

          {/* Spatial & Temporal Attributes */}
          <div
            className={`space-y-1.5 p-2.5 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-500" />
                <span>{language === 'en' ? 'Date' : 'Tanggal'}:</span>
              </span>
              <span className="font-bold">{selectedCluster.d}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-500" />
                <span>{language === 'en' ? 'Province' : 'Provinsi'}:</span>
              </span>
              <span className="font-bold truncate max-w-[150px]">{selectedCluster.pr}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Satellite className="w-3 h-3 text-cyan-500" />
                <span>Sensor:</span>
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  selectedCluster.s === 'Keduanya'
                    ? 'bg-cyan-500/20 text-cyan-500'
                    : selectedCluster.s === 'Hanya VIIRS'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-amber-500/20 text-amber-500'
                }`}
              >
                {selectedCluster.s}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-cyan-500" />
                <span>{language === 'en' ? 'Coordinates' : 'Koordinat'}:</span>
              </span>
              <span className="font-mono text-[10px]">
                {selectedCluster.lat.toFixed(4)}°, {selectedCluster.lon.toFixed(4)}°
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleCopyCoords(selectedCluster.lat, selectedCluster.lon)}
              className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                copiedCoords
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500 font-bold'
                  : theme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {copiedCoords ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Copied!' : 'Tersalin!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Copy Coords' : 'Salin Koordinat'}</span>
                </>
              )}
            </button>
            <button
              onClick={() => onSelectCluster(null)}
              className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {language === 'en' ? 'Close' : 'Tutup'}
            </button>
          </div>
        </div>
        </>
      )}

      {/* UNIFIED MAP CONTROL DOCK & POPOVERS */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 max-w-[calc(100vw-2rem)] pointer-events-auto">
        {/* Heatmap Settings Popover */}
        {isHeatmapSettingsOpen && (
          <HeatmapToolbar
            isOpen={isHeatmapSettingsOpen}
            onClose={() => setIsHeatmapSettingsOpen(false)}
            config={heatmapConfig}
            onChangeConfig={setHeatmapConfig}
            onQuickJump={setInternalFlyTo}
          />
        )}

        {/* Legend Popover */}
        {isLegendOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`p-3.5 rounded-2xl border shadow-2xl w-76 max-w-[calc(100vw-2rem)] font-mono text-xs space-y-2.5 pointer-events-auto animate-fadeIn ${
              theme === 'light'
                ? 'bg-white/98 border-slate-200 text-slate-800 shadow-slate-300/50'
                : 'bg-[#070c18]/98 border-slate-800 text-slate-100 shadow-cyan-950/80'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-1.5 border-b ${
                theme === 'light' ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>
                  {mapMode === 'heatmap'
                    ? language === 'en'
                      ? 'THERMAL DENSITY LEGEND'
                      : 'LEGENDA DENSITAS TERMAL'
                    : mapMode === 'split'
                    ? language === 'en'
                      ? 'HYBRID LEGEND'
                      : 'LEGENDA HYBRID'
                    : language === 'en'
                    ? 'CLUSTER LEGEND'
                    : 'LEGENDA KLASTER'}
                </span>
              </div>
              <button
                onClick={() => setIsLegendOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800/20 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Tutup Legenda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Heatmap Gradient Bar */}
            {(mapMode === 'heatmap' || mapMode === 'split') && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span>{language === 'en' ? 'Low' : 'Rendah'}</span>
                  <span>{language === 'en' ? 'Moderate' : 'Sedang'}</span>
                  <span>{language === 'en' ? 'High' : 'Tinggi'}</span>
                  <span className="text-rose-500 font-bold">{language === 'en' ? 'Critical' : 'Kritis'}</span>
                </div>
                <div
                  className={`h-2 w-full rounded-full ${
                    heatmapConfig.gradientPreset === 'nasa'
                      ? 'bg-gradient-to-r from-cyan-400 via-amber-400 via-orange-500 to-rose-600'
                      : heatmapConfig.gradientPreset === 'inferno'
                      ? 'bg-gradient-to-r from-purple-800 via-pink-600 via-amber-500 to-yellow-300'
                      : 'bg-gradient-to-r from-teal-800 via-amber-600 via-red-600 to-rose-900'
                  }`}
                />
              </div>
            )}

            {/* Cluster Point Symbols */}
            {(mapMode === 'clusters' || mapMode === 'split') && (
              <div
                className={`space-y-1.5 text-[11px] pt-1 border-t ${
                  theme === 'light' ? 'border-slate-200' : 'border-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                  <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                    {language === 'en' ? 'Both (MODIS + VIIRS)' : 'Keduanya (MODIS + VIIRS)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                  <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                    {language === 'en' ? 'FRP Critical (> 50 MW)' : 'FRP Kritis (> 50 MW)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                  <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                    {language === 'en' ? 'FRP Moderate (15 - 50 MW)' : 'FRP Sedang (15 - 50 MW)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
                  <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                    {language === 'en' ? 'FRP Low (≤ 15 MW)' : 'FRP Rendah (≤ 15 MW)'}
                  </span>
                </div>
              </div>
            )}

            <div
              className={`pt-2 border-t text-[10px] flex items-center justify-between ${
                theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
              }`}
            >
              <span>{language === 'en' ? 'Active on screen:' : 'Aktif di layar:'}</span>
              <span className="font-bold text-cyan-500">
                {visibleClusters.length.toLocaleString()}{' '}
                {language === 'en' ? 'points' : 'titik'}
              </span>
            </div>
          </div>
        )}

        {/* Unified Control Dock Bar */}
        <div
          className={`flex flex-wrap items-center gap-1.5 p-1 rounded-2xl border shadow-2xl text-[10px] font-mono transition-colors ${
            theme === 'light'
              ? 'bg-white/98 border-slate-200 shadow-slate-300/60'
              : 'bg-[#070c18]/98 border-slate-800/90 shadow-2xl'
          }`}
        >
          {/* Segment A: Mode Switcher */}
          <div
            className={`flex items-center gap-0.5 p-0.5 rounded-xl border ${
              theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <button
              onClick={() => {
                setMapMode('clusters');
                setIsHeatmapSettingsOpen(false);
              }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                mapMode === 'clusters'
                  ? 'bg-cyan-500 text-black font-bold shadow-sm'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={language === 'en' ? 'DBSCAN Spatial Cluster Points' : 'Peta Titik Klaster Spasial DBSCAN'}
            >
              <Crosshair className="w-3 h-3" />
              <span>{t.dockCluster}</span>
            </button>
            <button
              onClick={() => setMapMode('heatmap')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                mapMode === 'heatmap'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-black font-bold shadow-sm'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={language === 'en' ? 'Thermal Density Heatmap' : 'Peta Densitas Termal Heatmap'}
            >
              <Flame className="w-3 h-3" />
              <span>{t.dockHeatmap}</span>
            </button>
            <button
              onClick={() => setMapMode('split')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                mapMode === 'split'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold shadow-sm'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={language === 'en' ? 'Hybrid Map (Heatmap + Clusters)' : 'Peta Hybrid (Heatmap + Klaster)'}
            >
              <Sparkles className="w-3 h-3" />
              <span>Hybrid</span>
            </button>
          </div>

          <div
            className={`w-[1px] h-4 shrink-0 ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-800'}`}
          />

          {/* Segment B: Heatmap Settings Button */}
          {(mapMode === 'heatmap' || mapMode === 'split') && (
            <button
              onClick={toggleHeatmapSettings}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                isHeatmapSettingsOpen
                  ? 'bg-rose-950/80 border border-rose-500/80 text-rose-300 font-bold'
                  : theme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
              title={language === 'en' ? 'Tune heatmap parameters & epicenters' : 'Atur parameter & episentrum heatmap'}
            >
              <Sliders className="w-3 h-3 text-rose-400" />
              <span>{language === 'en' ? 'Tune Heatmap' : 'Atur Heatmap'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </button>
          )}

          {/* Segment C: Basemap Switcher */}
          <button
            onClick={() => setBasemapStyle((prev) => (prev === 'dark-gray' ? 'satellite' : 'dark-gray'))}
            className={`px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title={language === 'en' ? 'Toggle basemap style' : 'Ganti gaya peta'}
          >
            {basemapStyle === 'dark-gray' ? (
              <>
                <Eye className="w-3 h-3 text-cyan-500" />
                <span>{theme === 'light' ? t.dockVectorLight : t.dockVectorDark}</span>
              </>
            ) : (
              <>
                <Satellite className="w-3 h-3 text-amber-500" />
                <span>{t.dockSatellite}</span>
              </>
            )}
          </button>

          {/* Segment D: Performance Switcher */}
          <button
            onClick={() => setRenderMode((prev) => (prev === 'ultra-smooth' ? 'all' : 'ultra-smooth'))}
            className={`px-2 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
              renderMode === 'ultra-smooth'
                ? 'text-emerald-500 hover:border-emerald-500/50'
                : theme === 'light'
                ? 'text-slate-600 hover:border-slate-300'
                : 'text-slate-400 hover:border-slate-700'
            } ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}
            title="Mode Kecepatan Rendering Peta"
          >
            <Gauge className="w-3 h-3" />
            <span>{renderMode === 'ultra-smooth' ? t.dockFpsSmooth : (language === 'en' ? 'All' : 'Semua')}</span>
          </button>

          {/* Segment E: Legenda Toggle */}
          <button
            onClick={toggleLegend}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              isLegendOpen
                ? 'bg-cyan-950/80 border border-cyan-500/80 text-cyan-300 font-bold'
                : theme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Buka / Tutup Legenda Simbol & Suhu"
          >
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span>{t.dockLegend}</span>
          </button>
        </div>
      </div>

      {/* Floating High-Performance Real-Time Coordinate Badge (Zero Re-render, Hidden on Mobile Touch) */}
      <div
        ref={coordBadgeRef}
        className={`hidden sm:block absolute bottom-4 right-4 z-20 px-3 py-1 rounded-xl border font-mono text-[10px] pointer-events-none select-none tracking-wide shadow-lg transition-colors ${
          theme === 'light'
            ? 'bg-white/98 border-slate-300 text-slate-700 shadow-slate-300/40'
            : 'bg-[#070c18]/98 border-slate-800 text-cyan-400 shadow-cyan-950/40'
        }`}
      >
        LAT: -0.7893° | LON: 113.9213°
      </div>
    </div>
  );
});

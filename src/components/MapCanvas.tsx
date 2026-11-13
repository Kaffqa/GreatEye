import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Hotspot,
  SatelliteTrack,
  LayerVisibility,
  ViewportTelemetry,
} from '../types';
import { formatLatLon, getSeverityColor, calculateSunElevation } from '../utils/geo';
import {
  Flame,
  Wind,
  Navigation,
  Satellite as SatIcon,
  Crosshair,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface MapCanvasProps {
  hotspots: Hotspot[];
  satellites: SatelliteTrack[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  layers: LayerVisibility;
  flyToTarget: { lat: number; lng: number; zoom: number; timestamp: number } | null;
  onViewportChange: (telemetry: ViewportTelemetry) => void;
  onOpenSpectralModal: () => void;
}

// Controller component to listen to Leaflet events and execute programmatic moves
const MapController: React.FC<{
  flyToTarget: { lat: number; lng: number; zoom: number; timestamp: number } | null;
  onViewportChange: (telemetry: ViewportTelemetry) => void;
}> = ({ flyToTarget, onViewportChange }) => {
  const map = useMap();
  const lastTargetTime = useRef<number>(0);

  // Handle flyTo when target changes
  useEffect(() => {
    if (flyToTarget && flyToTarget.timestamp !== lastTargetTime.current) {
      lastTargetTime.current = flyToTarget.timestamp;
      map.flyTo([flyToTarget.lat, flyToTarget.lng], flyToTarget.zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [flyToTarget, map]);

  // Ensure map container size is always synchronized on mount and on flex resize
  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize(), 50);
    const timer2 = setTimeout(() => map.invalidateSize(), 250);
    const timer3 = setTimeout(() => map.invalidateSize(), 600);

    const container = map.getContainer();
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [map]);

  // Update telemetry on moveend / zoomend
  const updateTelemetry = () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const now = new Date();

    const safeLat = Math.max(-84.5, Math.min(84.5, center.lat));
    const safeLng = ((((center.lng + 180) % 360) + 360) % 360) - 180;
    const sunElev = calculateSunElevation(safeLat, safeLng, now);
    const fovDeg = Math.round((180 / Math.pow(2, zoom)) * 10) / 10;

    onViewportChange({
      centerLat: safeLat,
      centerLng: safeLng,
      zoom,
      bounds: {
        north: Math.max(-84.5, Math.min(84.5, bounds.getNorth())),
        south: Math.max(-84.5, Math.min(84.5, bounds.getSouth())),
        east: ((((bounds.getEast() + 180) % 360) + 360) % 360) - 180,
        west: ((((bounds.getWest() + 180) % 360) + 360) % 360) - 180,
      },
      fovDeg,
      utcTime: now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      sunElevationDeg: sunElev,
    });
  };

  useMapEvents({
    moveend: () => {
      updateTelemetry();
    },
    zoomend: () => {
      updateTelemetry();
    },
    dragend: () => {
      const center = map.getCenter();
      if (center.lat > 84.5 || center.lat < -84.5) {
        map.panInsideBounds([[-84.5, -180], [84.5, 180]], { animate: true });
      }
    },
  });

  // Initial trigger
  useEffect(() => {
    updateTelemetry();
  }, [map]);

  return null;
};

// Zoom HUD component using Leaflet useMap hook
const MapControlsHUD: React.FC = () => {
  const map = useMap();
  return (
    <div className="absolute top-12 left-3 z-[400] flex flex-col space-y-1 pointer-events-auto">
      <button
        onClick={() => map.zoomIn()}
        className="w-7 h-7 bg-[#0D131F]/95 hover:bg-[#162032] border border-[#1E293B] hover:border-[#06B6D4] text-[#F8FAFC] rounded-sm flex items-center justify-center font-mono font-bold text-base shadow-lg transition-colors cursor-pointer"
        title="Zoom In"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-7 h-7 bg-[#0D131F]/95 hover:bg-[#162032] border border-[#1E293B] hover:border-[#06B6D4] text-[#F8FAFC] rounded-sm flex items-center justify-center font-mono font-bold text-base shadow-lg transition-colors cursor-pointer"
        title="Zoom Out"
        aria-label="Zoom out"
      >
        -
      </button>
    </div>
  );
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  hotspots,
  satellites,
  selectedHotspot,
  onSelectHotspot,
  layers,
  flyToTarget,
  onViewportChange,
  onOpenSpectralModal,
}) => {
  const [baseMapType, setBaseMapType] = useState<'dark' | 'satellite'>('dark');

  // Generate custom HTML div icons for hotspots
  const createHotspotIcon = (hotspot: Hotspot, isSelected: boolean) => {
    const color = getSeverityColor(hotspot.severity);
    const isHigh = hotspot.severity === 'critical' || hotspot.severity === 'warning';
    const size = isHigh ? 28 : 22;
    const pulseRing = isHigh
      ? `<div class="absolute inset-0 rounded-full animate-thermal-pulse pointer-events-none" style="border: 1.5px solid ${color};"></div>`
      : '';
    const selectedRing = isSelected
      ? `<div class="absolute -inset-2 rounded-full pointer-events-none" style="border: 2px dashed #06B6D4; animation: spin 8s linear infinite;"></div>`
      : '';

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: ${size}px; height: ${size}px;">
        ${pulseRing}
        ${selectedRing}
        <div class="w-full h-full rounded-full flex items-center justify-center transition-transform group-hover:scale-125" style="background: rgba(9, 13, 22, 0.85); border: 1.5px solid ${color}; box-shadow: 0 0 10px ${color}80;">
          <div class="w-2.5 h-2.5 rounded-full" style="background: ${color};"></div>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'bg-transparent border-0',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  // Generate satellite icon
  const createSatelliteIcon = (sat: SatelliteTrack) => {
    const html = `
      <div class="flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-[#111827] border border-[#06B6D4] text-[#06B6D4] shadow-lg text-[10px] font-mono whitespace-nowrap cursor-pointer">
        <span class="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping inline-block"></span>
        <span class="font-bold text-[#F8FAFC]">${sat.code}</span>
        <span class="text-[9px] text-[#94A3B8]">${sat.altitudeKm}km</span>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'bg-transparent border-0',
      iconSize: [90, 24],
      iconAnchor: [45, 12],
    });
  };

  return (
    <div className="relative flex-1 h-full w-full bg-[#090D16] overflow-hidden">
      {/* Reticle HUD in Center */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="w-16 h-16 border border-[#334155]/40 rounded-full flex items-center justify-center relative">
          <div className="w-2 h-2 border-t border-l border-[#06B6D4]" />
          <div className="absolute w-4 h-[1px] bg-[#06B6D4]/30" />
          <div className="absolute h-4 w-[1px] bg-[#06B6D4]/30" />
        </div>
      </div>

      {/* Floating HUD Viewport Mode Badge */}
      <div className="absolute top-3 left-3 z-10 bg-[#0D131F]/90 backdrop-blur-md border border-[#1E293B] px-2.5 py-1.5 rounded-sm flex items-center space-x-2 text-[11px] font-['JetBrains_Mono'] text-[#94A3B8]">
        <Crosshair className="w-3.5 h-3.5 text-[#06B6D4]" />
        <span className="text-[#F8FAFC] font-semibold">GLOBAL ORBITAL PROJECTION</span>
        <span className="text-[#334155]">|</span>
        <span className="text-[#10B981]">EPSG:3857 (WGS 84)</span>
      </div>

      {/* Floating Basemap Selector Top-Right */}
      <div className="absolute top-3 right-3 z-10 bg-[#0D131F]/90 backdrop-blur-md border border-[#1E293B] p-1 rounded-sm flex items-center space-x-1 text-[10px] font-['JetBrains_Mono']">
        <button
          onClick={() => setBaseMapType('dark')}
          className={`px-2 py-1 rounded-sm uppercase tracking-wider transition-colors ${
            baseMapType === 'dark'
              ? 'bg-[#1E293B] text-[#06B6D4] font-bold border border-[#334155]'
              : 'text-[#94A3B8] hover:text-[#dfe2ef]'
          }`}
        >
          DARK OBSIDIAN
        </button>
        <button
          onClick={() => setBaseMapType('satellite')}
          className={`px-2 py-1 rounded-sm uppercase tracking-wider transition-colors ${
            baseMapType === 'satellite'
              ? 'bg-[#1E293B] text-[#06B6D4] font-bold border border-[#334155]'
              : 'text-[#94A3B8] hover:text-[#dfe2ef]'
          }`}
        >
          ORBITAL SATELLITE
        </button>
      </div>

      {/* Legend Card Floating Bottom-Left */}
      <div className="absolute bottom-4 left-3 z-10 bg-[#0D131F]/95 backdrop-blur-md border border-[#1E293B] p-2 rounded-sm text-[10px] font-['JetBrains_Mono'] space-y-1.5 shadow-xl hidden md:block">
        <div className="text-[#94A3B8] uppercase tracking-wider text-[9px] font-semibold border-b border-[#1E293B] pb-1">
          THERMAL ANOMALY TIERS (MW)
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-[#dfe2ef]">CRIT &gt; 450 MW</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            <span className="text-[#dfe2ef]">WARN 180-450</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
            <span className="text-[#dfe2ef]">ELEV 50-180</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[#dfe2ef]">NOM &lt; 50 MW</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={[25.0, 0.0]}
        zoom={3}
        minZoom={2}
        maxZoom={14}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapController flyToTarget={flyToTarget} onViewportChange={onViewportChange} />
        <MapControlsHUD />

        {/* High-Contrast Watermark-Free Tiles */}
        {baseMapType === 'dark' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={17}
          />
        )}

        {/* Satellite Ground Tracks */}
        {layers.satelliteTracks &&
          satellites.map((sat) => (
            <React.Fragment key={sat.id}>
              <Polyline
                positions={sat.orbitPath}
                pathOptions={{
                  color: '#06B6D4',
                  weight: 1.5,
                  dashArray: '4, 6',
                  opacity: 0.65,
                }}
              />
              <Marker
                position={[sat.currentLat, sat.currentLng]}
                icon={createSatelliteIcon(sat)}
              >
                <Popup>
                  <div className="p-2.5 font-['Geist'] text-xs min-w-[200px]">
                    <div className="font-['Space_Grotesk'] font-bold text-sm text-[#06B6D4] mb-1">
                      {sat.name}
                    </div>
                    <div className="text-[11px] font-['JetBrains_Mono'] space-y-0.5 text-[#94A3B8]">
                      <div>ORBIT ALT: <span className="text-[#F8FAFC]">{sat.altitudeKm} km</span></div>
                      <div>VELOCITY: <span className="text-[#F8FAFC]">{sat.velocityKmS} km/s</span></div>
                      <div>SWATH WIDTH: <span className="text-[#F8FAFC]">{sat.swathWidthKm} km</span></div>
                      <div>NEXT PASS: <span className="text-[#10B981]">{sat.nextPassUtc}</span></div>
                      <div>STATUS: <span className="text-[#06B6D4]">{sat.status}</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

        {/* Thermal Density Heatmap Halos */}
        {layers.thermalHeatmap &&
          hotspots.map((h) => {
            const radius = Math.min(120000, Math.max(30000, h.frp * 150));
            return (
              <Circle
                key={`heat-${h.id}`}
                center={[h.lat, h.lng]}
                radius={radius}
                pathOptions={{
                  fillColor: getSeverityColor(h.severity),
                  fillOpacity: 0.16,
                  color: getSeverityColor(h.severity),
                  weight: 1,
                  opacity: 0.35,
                }}
              />
            );
          })}

        {/* Smoke Plumes (AOD) */}
        {layers.smokeAod &&
          hotspots.map((h) => (
            <Circle
              key={`smoke-${h.id}`}
              center={[h.lat, h.lng]}
              radius={Math.min(150000, Math.max(40000, h.smokeAod * 25000))}
              pathOptions={{
                fillColor: '#94A3B8',
                fillOpacity: 0.18,
                color: '#64748B',
                weight: 0.5,
                dashArray: '3, 4',
              }}
            />
          ))}

        {/* Hotspot Markers */}
        {layers.viirsHotspots &&
          hotspots.map((hotspot) => {
            const isSelected = selectedHotspot?.id === hotspot.id;
            return (
              <Marker
                key={hotspot.id}
                position={[hotspot.lat, hotspot.lng]}
                icon={createHotspotIcon(hotspot, isSelected)}
                eventHandlers={{
                  click: () => onSelectHotspot(hotspot),
                }}
              >
                <Popup>
                  <div className="p-3 font-['Geist'] text-xs min-w-[240px] bg-[#111827] border border-[#334155] rounded-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 mb-2">
                      <div>
                        <span className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC] block">
                          {hotspot.name}
                        </span>
                        <span className="text-[10px] font-['JetBrains_Mono'] text-[#06B6D4]">
                          {hotspot.id} • {hotspot.satellite}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded-sm font-semibold uppercase"
                        style={{
                          color: getSeverityColor(hotspot.severity),
                          backgroundColor: `${getSeverityColor(hotspot.severity)}20`,
                          border: `1px solid ${getSeverityColor(hotspot.severity)}50`,
                        }}
                      >
                        {hotspot.severity}
                      </span>
                    </div>

                    {/* Telemetry Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-['JetBrains_Mono'] mb-3">
                      <div className="bg-[#090D16] p-1.5 rounded-sm border border-[#1E293B]">
                        <span className="text-[#94A3B8] text-[9px] block">RADIATIVE POWER</span>
                        <span className="text-[#F97316] font-bold text-sm">
                          {hotspot.frp} MW
                        </span>
                      </div>

                      <div className="bg-[#090D16] p-1.5 rounded-sm border border-[#1E293B]">
                        <span className="text-[#94A3B8] text-[9px] block">BRIGHTNESS TEMP</span>
                        <span className="text-[#F8FAFC] font-bold text-sm">
                          {hotspot.brightnessTemp} K
                        </span>
                      </div>

                      <div className="bg-[#090D16] p-1.5 rounded-sm border border-[#1E293B]">
                        <span className="text-[#94A3B8] text-[9px] block">CONFIDENCE</span>
                        <span className="text-[#10B981] font-bold">{hotspot.confidence}%</span>
                      </div>

                      <div className="bg-[#090D16] p-1.5 rounded-sm border border-[#1E293B]">
                        <span className="text-[#94A3B8] text-[9px] block">EST. BURN AREA</span>
                        <span className="text-[#F8FAFC]">{hotspot.areaHa.toLocaleString()} ha</span>
                      </div>
                    </div>

                    {/* Wind & Spread Vector */}
                    <div className="text-[10px] font-['JetBrains_Mono'] text-[#94A3B8] mb-3 flex items-center justify-between bg-[#0D131F] p-1.5 rounded-sm border border-[#1E293B]">
                      <div className="flex items-center space-x-1">
                        <Wind className="w-3 h-3 text-[#06B6D4]" />
                        <span>WIND: {hotspot.windSpeedKt} kt @ {hotspot.windDirDeg}°</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[#F97316]">
                        <Navigation
                          className="w-3 h-3 transform"
                          style={{ transform: `rotate(${hotspot.spreadVectorDeg}deg)` }}
                        />
                        <span>{hotspot.spreadSpeedKmH} km/h</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => {
                        onSelectHotspot(hotspot);
                        onOpenSpectralModal();
                      }}
                      className="w-full py-1.5 px-2 bg-[#162032] hover:bg-[#1E293B] border border-[#334155] rounded-sm text-[#06B6D4] text-[11px] font-['JetBrains_Mono'] flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Zap className="w-3 h-3 text-[#06B6D4]" />
                      <span>ANALYZE MULTI-SPECTRAL BANDS</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

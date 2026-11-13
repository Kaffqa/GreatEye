import React from 'react';
import { ViewportTelemetry } from '../types';
import { formatLatLon } from '../utils/geo';
import { Globe, Radio, Sun, Compass } from 'lucide-react';

interface CoordinateFooterProps {
  telemetry: ViewportTelemetry;
}

export const CoordinateFooter: React.FC<CoordinateFooterProps> = ({ telemetry }) => {
  const approxAltKm = Math.round(15000 / Math.pow(2, telemetry.zoom - 1));

  return (
    <footer className="h-7 bg-[#090D16] border-t border-[#1E293B] px-3 flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#94A3B8] select-none shrink-0 z-30 overflow-x-auto whitespace-nowrap">
      {/* Left: Viewport Center Coordinates */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-[#dfe2ef]">
          <Globe className="w-3 h-3 text-[#06B6D4]" />
          <span className="text-[#64748B]">CTR:</span>
          <span className="font-semibold text-[#F8FAFC]">
            {formatLatLon(telemetry.centerLat, telemetry.centerLng)}
          </span>
        </div>

        <span className="text-[#334155]">|</span>

        <div>
          <span className="text-[#64748B]">ZOOM:</span>{' '}
          <span className="text-[#06B6D4] font-semibold">{telemetry.zoom}X</span>
        </div>

        <span className="text-[#334155]">|</span>

        <div>
          <span className="text-[#64748B]">FOV:</span>{' '}
          <span className="text-[#dfe2ef]">{telemetry.fovDeg.toFixed(1)}°</span>
        </div>

        <span className="text-[#334155]">|</span>

        <div>
          <span className="text-[#64748B]">ALT:</span>{' '}
          <span className="text-[#dfe2ef]">{approxAltKm} KM</span>
        </div>
      </div>

      {/* Center: Bounding Box Coordinates */}
      <div className="hidden xl:flex items-center space-x-2 text-[9px] text-[#64748B]">
        <span>BOUNDS:</span>
        <span className="text-[#dfe2ef] px-1 bg-[#111827] border border-[#1E293B] rounded-sm">
          N {telemetry.bounds.north.toFixed(2)}°
        </span>
        <span className="text-[#dfe2ef] px-1 bg-[#111827] border border-[#1E293B] rounded-sm">
          S {telemetry.bounds.south.toFixed(2)}°
        </span>
        <span className="text-[#dfe2ef] px-1 bg-[#111827] border border-[#1E293B] rounded-sm">
          E {telemetry.bounds.east.toFixed(2)}°
        </span>
        <span className="text-[#dfe2ef] px-1 bg-[#111827] border border-[#1E293B] rounded-sm">
          W {telemetry.bounds.west.toFixed(2)}°
        </span>
      </div>

      {/* Right: Solar Elevation & System Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <Sun className="w-3 h-3 text-[#FBBF24]" />
          <span className="text-[#64748B]">SUN ELEV:</span>
          <span
            className={`font-semibold ${
              telemetry.sunElevationDeg > 0 ? 'text-[#FBBF24]' : 'text-[#64748B]'
            }`}
          >
            {telemetry.sunElevationDeg > 0 ? `+${telemetry.sunElevationDeg}°` : `${telemetry.sunElevationDeg}°`}
          </span>
        </div>

        <span className="text-[#334155]">|</span>

        <div className="flex items-center space-x-1 text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block"></span>
          <span>ORBITAL MESH: NOMINAL</span>
        </div>
      </div>
    </footer>
  );
};

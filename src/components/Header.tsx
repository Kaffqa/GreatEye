import React, { useEffect, useState } from 'react';
import {
  Satellite,
  Radio,
  Flame,
  Download,
  Eye,
  RotateCcw,
  Clock,
  ShieldAlert,
  SlidersHorizontal,
  PanelRight,
} from 'lucide-react';
import { Hotspot, SatelliteTrack } from '../types';
import { exportToGeoJson } from '../utils/geo';

interface HeaderProps {
  hotspots: Hotspot[];
  satellites: SatelliteTrack[];
  onOpenSpectralModal: () => void;
  onResetView: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isTelemetryOpen: boolean;
  onToggleTelemetry: () => void;
  selectedHotspot: Hotspot | null;
}

export const Header: React.FC<HeaderProps> = ({
  hotspots,
  satellites,
  onOpenSpectralModal,
  onResetView,
  isSidebarOpen,
  onToggleSidebar,
  isTelemetryOpen,
  onToggleTelemetry,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalFrp = hotspots.reduce((acc, h) => acc + h.frp, 0);
  const criticalCount = hotspots.filter((h) => h.severity === 'critical').length;
  const warningCount = hotspots.filter((h) => h.severity === 'warning').length;

  const handleExport = () => {
    const jsonStr = exportToGeoJson(hotspots);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbital-wildfire-telemetry-${new Date().toISOString().substring(0, 10)}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <header className="w-full max-w-full h-14 bg-[#0D131F] border-b border-[#1E293B] px-3 flex items-center justify-between select-none z-30 shrink-0 overflow-hidden">
      {/* Left: Branding & Mission Identity */}
      <div className="flex items-center space-x-2.5 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-sm hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#06B6D4] transition-colors border border-transparent hover:border-[#334155] cursor-pointer"
          title={isSidebarOpen ? 'Collapse Left Navigation' : 'Expand Left Navigation'}
          aria-label="Toggle navigation panel"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 whitespace-nowrap">
          <div className="w-8 h-8 rounded-sm bg-[#111827] border border-[#334155] flex items-center justify-center relative overflow-hidden shadow-inner shrink-0">
            <Satellite className="w-4 h-4 text-[#F97316]" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#10B981] rounded-full" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-['Space_Grotesk'] font-semibold text-xs sm:text-sm tracking-wide text-[#F8FAFC]">
                ORBITAL OBSERVATION SYSTEM
              </span>
              <span className="text-[10px] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded-sm bg-[#162032] border border-[#334155] text-[#06B6D4] hidden sm:inline">
                LEO-VIIRS
              </span>
            </div>
            <div className="text-[10px] font-['Geist'] text-[#94A3B8] flex items-center space-x-1.5">
              <span className="hidden md:inline">NASA / NOAA / COPERNICUS</span>
              <span className="text-[#334155] hidden md:inline">•</span>
              <span className="text-[#10B981] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block"></span>
                <span>REALTIME FEED</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Live Mission Telemetry Readouts (responsively scaled) */}
      <div className="hidden lg:flex items-center space-x-2 shrink-0 mx-2">
        {/* UTC Clock */}
        <div className="flex items-center space-x-1.5 px-2 py-1 rounded-sm bg-[#090D16] border border-[#1E293B] text-[11px] font-['JetBrains_Mono'] text-[#94A3B8] whitespace-nowrap shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
          <span className="text-[#F8FAFC] tracking-wider">{utcTime || 'SYNCHRONIZING...'}</span>
        </div>

        {/* Anomaly Metrics */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-sm bg-[#090D16] border border-[#1E293B] shrink-0 whitespace-nowrap">
          <div className="flex items-center space-x-1.5">
            <Flame className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
            <span className="text-[11px] font-['Geist'] text-[#94A3B8] hidden xl:inline">HOTSPOTS:</span>
            <span className="text-[12px] font-['JetBrains_Mono'] font-bold text-[#F8FAFC]">
              {hotspots.length}
            </span>
          </div>

          <div className="h-3 w-[1px] bg-[#1E293B]" />

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-['Geist'] text-[#94A3B8] hidden xl:inline">CUMULATIVE FRP:</span>
            <span className="text-[12px] font-['JetBrains_Mono'] font-bold text-[#F97316]">
              {totalFrp.toLocaleString()} MW
            </span>
          </div>

          <div className="h-3 w-[1px] bg-[#1E293B] hidden xl:block" />

          <div className="hidden xl:flex items-center space-x-1 text-[11px] font-['JetBrains_Mono']">
            <span className="px-1 py-0.5 rounded-sm bg-red-950/40 border border-red-800/50 text-[#EF4444]">
              {criticalCount} CRIT
            </span>
            <span className="px-1 py-0.5 rounded-sm bg-orange-950/40 border border-orange-800/50 text-[#F97316]">
              {warningCount} WARN
            </span>
          </div>
        </div>

        {/* Constellation Telemetry - Unified badge with fixed width that never clips */}
        <div className="hidden 2xl:flex items-center space-x-2 px-2.5 py-1 rounded-sm bg-[#090D16] border border-[#1E293B] text-[11px] font-['JetBrains_Mono'] shrink-0 whitespace-nowrap">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-[#06B6D4] animate-pulse shrink-0" />
            <span className="text-[#94A3B8]">CONSTELLATION:</span>
            <span className="text-[#10B981] font-bold">{satellites.length} NODES</span>
          </div>
          <div className="h-3 w-[1px] bg-[#1E293B]" />
          <div className="flex items-center space-x-1">
            <span className="text-[#dfe2ef] font-semibold">{satellites[0]?.code}</span>
            <span className="text-[9px] px-1 py-0.2 bg-[#111827] text-[#06B6D4] border border-[#1E293B] rounded-sm">
              PASS {satellites[0]?.nextPassUtc}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Operational Controls (ALWAYS preserved & shrink-0) */}
      <div className="flex items-center space-x-1.5 shrink-0 ml-auto">
        <button
          onClick={onOpenSpectralModal}
          className="h-8 px-2 sm:px-2.5 rounded-sm bg-[#111827] hover:bg-[#162032] border border-[#1E293B] hover:border-[#334155] text-[#94A3B8] hover:text-[#06B6D4] text-xs font-['JetBrains_Mono'] flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap"
          title="Inspect SWIR / NIR Radiance Imagery"
        >
          <Eye className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
          <span className="hidden sm:inline">SWIR BANDS</span>
        </button>

        <button
          onClick={onResetView}
          className="h-8 px-2 rounded-sm bg-[#111827] hover:bg-[#162032] border border-[#1E293B] hover:border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-['JetBrains_Mono'] flex items-center space-x-1 transition-all cursor-pointer whitespace-nowrap"
          title="Reset Global View to Continental Scale"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">RESET</span>
        </button>

        <button
          onClick={onToggleTelemetry}
          className={`h-8 px-2 sm:px-2.5 rounded-sm border text-xs font-['JetBrains_Mono'] flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
            isTelemetryOpen
              ? 'bg-[#162032] border-[#06B6D4]/60 text-[#06B6D4]'
              : 'bg-[#111827] border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
          title={isTelemetryOpen ? 'Hide Right Telemetry Rail' : 'Show Right Telemetry Rail'}
        >
          <PanelRight className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">TELEMETRY</span>
        </button>

        <button
          onClick={handleExport}
          className="h-8 px-2.5 sm:px-3 rounded-sm bg-[#F97316] hover:bg-[#FB923C] text-[#090D16] font-['JetBrains_Mono'] font-bold text-xs uppercase flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          title="Export Hotspots as Supabase / GIS compliant GeoJSON"
        >
          <Download className="w-3.5 h-3.5 text-[#090D16] shrink-0" />
          <span className="hidden sm:inline">EXPORT GEOJSON</span>
          <span className="sm:hidden">EXPORT</span>
        </button>
      </div>

      {/* Notification Toast */}
      {copiedNotification && (
        <div className="fixed top-16 right-4 z-50 bg-[#111827] border border-[#06B6D4] text-[#F8FAFC] px-3 py-2 rounded-sm shadow-xl flex items-center space-x-2 text-xs font-['JetBrains_Mono'] animate-fade-in">
          <ShieldAlert className="w-4 h-4 text-[#06B6D4]" />
          <span>GEOJSON TELEMETRY GENERATED & DOWNLOADED</span>
        </div>
      )}
    </header>
  );
};

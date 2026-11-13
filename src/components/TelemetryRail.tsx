import React, { useState, useMemo } from 'react';
import {
  Flame,
  Activity,
  Table as TableIcon,
  Compass,
  Wind,
  Droplets,
  Calendar,
  Satellite,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Target,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Hotspot, SatelliteTrack } from '../types';
import { formatLatLon, getSeverityColor } from '../utils/geo';
import { SPECTRAL_BANDS, HOURLY_HISTOGRAM_DATA } from '../data/mockData';

interface TelemetryRailProps {
  selectedHotspot: Hotspot | null;
  hotspots: Hotspot[];
  onSelectHotspot: (hotspot: Hotspot) => void;
  onFlyToHotspot: (hotspot: Hotspot) => void;
  onOpenSpectralModal: () => void;
  satellites: SatelliteTrack[];
}

type TabType = 'telemetry' | 'table' | 'spectral' | 'trends';

export const TelemetryRail: React.FC<TelemetryRailProps> = ({
  selectedHotspot,
  hotspots,
  onSelectHotspot,
  onFlyToHotspot,
  onOpenSpectralModal,
  satellites,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('telemetry');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<'name' | 'frp' | 'brightnessTemp' | 'severity'>('frp');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const target = selectedHotspot || hotspots[0] || null;

  const handleSort = (col: 'name' | 'frp' | 'brightnessTemp' | 'severity') => {
    if (sortColumn === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(col);
      setSortAsc(col === 'name');
    }
  };

  const filteredHotspotsTable = hotspots.filter(
    (h) =>
      h.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      h.region.toLowerCase().includes(tableSearch.toLowerCase()) ||
      h.id.toLowerCase().includes(tableSearch.toLowerCase()) ||
      h.satellite.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const sortedHotspotsTable = useMemo(() => {
    return [...filteredHotspotsTable].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortColumn === 'frp') {
        comparison = a.frp - b.frp;
      } else if (sortColumn === 'brightnessTemp') {
        comparison = a.brightnessTemp - b.brightnessTemp;
      } else if (sortColumn === 'severity') {
        const order = { critical: 4, warning: 3, elevated: 2, nominal: 1 };
        comparison = (order[a.severity] || 0) - (order[b.severity] || 0);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredHotspotsTable, sortColumn, sortAsc]);

  return (
    <aside className="w-full md:w-[340px] xl:w-[370px] bg-[#111827] border-l border-[#1E293B] flex flex-col h-full select-none shrink-0 z-20 text-xs overflow-hidden">
      {/* 36px fixed Header Bar with Tab Navigation */}
      <div className="h-9 border-b border-[#1E293B] px-2 flex items-center justify-between bg-[#0D131F] shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`h-7 px-2.5 rounded-sm font-['JetBrains_Mono'] text-[11px] font-medium tracking-wider uppercase transition-colors ${
              activeTab === 'telemetry'
                ? 'bg-[#1E293B] text-[#F97316] font-semibold border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#dfe2ef]'
            }`}
          >
            TELEMETRY
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`h-7 px-2.5 rounded-sm font-['JetBrains_Mono'] text-[11px] font-medium tracking-wider uppercase transition-colors ${
              activeTab === 'table'
                ? 'bg-[#1E293B] text-[#06B6D4] font-semibold border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#dfe2ef]'
            }`}
          >
            LOGS ({hotspots.length})
          </button>

          <button
            onClick={() => setActiveTab('spectral')}
            className={`h-7 px-2.5 rounded-sm font-['JetBrains_Mono'] text-[11px] font-medium tracking-wider uppercase transition-colors ${
              activeTab === 'spectral'
                ? 'bg-[#1E293B] text-[#10B981] font-semibold border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#dfe2ef]'
            }`}
          >
            SPECTRAL
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`h-7 px-2.5 rounded-sm font-['JetBrains_Mono'] text-[11px] font-medium tracking-wider uppercase transition-colors ${
              activeTab === 'trends'
                ? 'bg-[#1E293B] text-[#FBBF24] font-semibold border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#dfe2ef]'
            }`}
          >
            DIURNAL
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TAB 1: Real-time Telemetry for Selected Incident */}
        {activeTab === 'telemetry' && target && (
          <div className="space-y-3.5">
            {/* Incident Title Card */}
            <div className="bg-[#0D131F] border border-[#1E293B] p-3 rounded-sm space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#06B6D4] uppercase tracking-wider block">
                    {target.id} • {target.satellite} ({target.instrument})
                  </span>
                  <h2 className="font-['Space_Grotesk'] font-bold text-base text-[#F8FAFC]">
                    {target.name}
                  </h2>
                  <p className="text-[#94A3B8] text-xs font-['Geist']">
                    {target.region}, {target.country}
                  </p>
                </div>
                <span
                  className="px-2 py-0.5 rounded-sm font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${getSeverityColor(target.severity)}20`,
                    color: getSeverityColor(target.severity),
                    border: `1px solid ${getSeverityColor(target.severity)}60`,
                  }}
                >
                  {target.severity}
                </span>
              </div>

              {/* Coordinates Pill */}
              <div className="flex items-center justify-between bg-[#090D16] px-2 py-1.5 rounded-sm border border-[#1E293B] text-[11px] font-['JetBrains_Mono']">
                <span className="text-[#94A3B8]">COORDINATES:</span>
                <span className="text-[#dfe2ef]">{formatLatLon(target.lat, target.lng)}</span>
              </div>

              {/* Action Jump Button */}
              <button
                onClick={() => onFlyToHotspot(target)}
                className="w-full py-1.5 rounded-sm bg-[#162032] hover:bg-[#1E293B] border border-[#334155] text-[#06B6D4] text-[11px] font-['JetBrains_Mono'] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                <span>CENTER RETICLE ON HOTSPOT</span>
              </button>
            </div>

            {/* High-Density Telemetry Metrics Grid */}
            <div>
              <div className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8] mb-1.5">
                RADIATIVE POWER & TEMPERATURE
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-['JetBrains_Mono']">
                {/* FRP Card */}
                <div className="bg-[#0D131F] border border-[#1E293B] p-2.5 rounded-sm">
                  <div className="text-[#94A3B8] text-[9px] uppercase tracking-wider flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-[#F97316]" />
                    <span>RADIATIVE POWER (FRP)</span>
                  </div>
                  <div className="text-xl font-bold text-[#F97316] mt-1">
                    {target.frp} <span className="text-xs font-normal text-[#94A3B8]">MW</span>
                  </div>
                  <div className="text-[9px] text-[#64748B] mt-0.5">
                    Tier: {target.frp > 450 ? 'Extreme Pyrocb' : 'Confirmed Burn'}
                  </div>
                </div>

                {/* Brightness Temp */}
                <div className="bg-[#0D131F] border border-[#1E293B] p-2.5 rounded-sm">
                  <div className="text-[#94A3B8] text-[9px] uppercase tracking-wider flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-[#EF4444]" />
                    <span>BRIGHTNESS TEMP</span>
                  </div>
                  <div className="text-xl font-bold text-[#F8FAFC] mt-1">
                    {target.brightnessTemp} <span className="text-xs font-normal text-[#94A3B8]">K</span>
                  </div>
                  <div className="text-[9px] text-[#64748B] mt-0.5">
                    {Math.round(target.brightnessTemp - 273.15)}°C Surface Equivalent
                  </div>
                </div>

                {/* Detection Confidence */}
                <div className="bg-[#0D131F] border border-[#1E293B] p-2.5 rounded-sm">
                  <div className="text-[#94A3B8] text-[9px] uppercase tracking-wider">
                    ALGORITHM CONFIDENCE
                  </div>
                  <div className="text-lg font-bold text-[#10B981] mt-1">
                    {target.confidence}%
                  </div>
                  <div className="w-full bg-[#1E293B] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-[#10B981] h-full"
                      style={{ width: `${target.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Estimated Area & Containment */}
                <div className="bg-[#0D131F] border border-[#1E293B] p-2.5 rounded-sm">
                  <div className="text-[#94A3B8] text-[9px] uppercase tracking-wider">
                    EST. PERIMETER AREA
                  </div>
                  <div className="text-lg font-bold text-[#dfe2ef] mt-1">
                    {target.areaHa.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-[#94A3B8]">ha</span>
                  </div>
                  <div className="text-[9px] text-[#94A3B8] mt-0.5 flex justify-between">
                    <span>CONTAINED:</span>
                    <span className="text-[#10B981] font-bold">{target.containmentPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fire Weather & Atmospheric Telemetry */}
            <div className="bg-[#0D131F] border border-[#1E293B] p-3 rounded-sm space-y-2">
              <div className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8]">
                FIRE WEATHER & VECTOR DYNAMICS
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-['JetBrains_Mono']">
                <div className="bg-[#090D16] p-2 rounded-sm border border-[#1E293B]">
                  <span className="text-[#94A3B8] block text-[9px]">SURFACE WIND</span>
                  <div className="flex items-center space-x-1 mt-0.5 text-[#06B6D4]">
                    <Wind className="w-3.5 h-3.5" />
                    <span className="font-bold">{target.windSpeedKt} kt</span>
                  </div>
                  <span className="text-[#64748B] text-[8px] block">Dir: {target.windDirDeg}°</span>
                </div>

                <div className="bg-[#090D16] p-2 rounded-sm border border-[#1E293B]">
                  <span className="text-[#94A3B8] block text-[9px]">SPREAD VECTOR</span>
                  <div className="flex items-center space-x-1 mt-0.5 text-[#F97316]">
                    <Compass className="w-3.5 h-3.5" />
                    <span className="font-bold">{target.spreadSpeedKmH} km/h</span>
                  </div>
                  <span className="text-[#64748B] text-[8px] block">Vector: {target.spreadVectorDeg}°</span>
                </div>

                <div className="bg-[#090D16] p-2 rounded-sm border border-[#1E293B]">
                  <span className="text-[#94A3B8] block text-[9px]">REL HUMIDITY</span>
                  <div className="flex items-center space-x-1 mt-0.5 text-[#dfe2ef]">
                    <Droplets className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <span className="font-bold">{target.relativeHumidityPct}%</span>
                  </div>
                  <span className="text-[#EF4444] text-[8px] block">
                    {target.relativeHumidityPct < 15 ? 'CRITICALLY DRY' : 'MODERATE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Historical 24h FRP Progression Mini Chart */}
            <div className="bg-[#0D131F] border border-[#1E293B] p-3 rounded-sm space-y-2">
              <div className="flex justify-between items-center text-[10px] font-['JetBrains_Mono']">
                <span className="uppercase text-[#94A3B8]">24H FRP RADIATIVE HISTORY</span>
                <span className="text-[#F97316]">PEAK: {Math.max(...target.historyTimeline.map((t) => t.frp))} MW</span>
              </div>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={target.historyTimeline}>
                    <defs>
                      <linearGradient id="frpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="hourOffset"
                      stroke="#64748B"
                      fontSize={9}
                      fontFamily="JetBrains Mono"
                      tickFormatter={(val) => `${val}h`}
                    />
                    <YAxis stroke="#64748B" fontSize={9} fontFamily="JetBrains Mono" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#334155',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono',
                      }}
                      labelFormatter={(val) => `Time Offset: ${val} hours`}
                    />
                    <Area
                      type="monotone"
                      dataKey="frp"
                      stroke="#F97316"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#frpGrad)"
                      name="FRP (MW)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spectral Band Inspection Trigger */}
            <button
              onClick={onOpenSpectralModal}
              className="w-full py-2 px-3 rounded-sm bg-[#F97316] hover:bg-[#FB923C] text-[#090D16] font-['JetBrains_Mono'] font-bold text-xs uppercase flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <span>INSPECT SWIR MULTI-SPECTRAL BANDS</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Empty State when no target matching filter */}
        {activeTab === 'telemetry' && !target && (
          <div className="h-64 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#0D131F] border border-[#1E293B] rounded-sm">
            <Flame className="w-8 h-8 text-[#64748B]" />
            <span className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC]">
              NO ACTIVE THERMAL ANOMALIES
            </span>
            <p className="text-[#94A3B8] text-xs font-['Geist'] max-w-[240px]">
              No hotspots match your current filters. Clear the search query or lower the confidence threshold in the left sidebar.
            </p>
          </div>
        )}

        {/* TAB 2: Supabase-Ready Incident Table */}
        {activeTab === 'table' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8]">
                SUPABASE INCIDENT TABLE (FLAT SCHEMA)
              </span>
              <span className="text-[10px] font-['JetBrains_Mono'] text-[#06B6D4]">
                {sortedHotspotsTable.length} RECORDS
              </span>
            </div>

            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter table rows..."
              className="w-full h-8 px-2.5 bg-[#090D16] border border-[#1E293B] focus:border-[#06B6D4] rounded-sm text-xs font-['Geist'] text-[#F8FAFC] placeholder-[#64748B] outline-none"
            />

            <div className="border border-[#1E293B] rounded-sm overflow-hidden bg-[#090D16]">
              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full text-left border-collapse text-[11px] font-['JetBrains_Mono']">
                  <thead>
                    <tr className="bg-[#111827] border-b border-[#1E293B] text-[#94A3B8] text-[9px] uppercase tracking-wider">
                      <th
                        onClick={() => handleSort('name')}
                        className="p-2 cursor-pointer hover:text-[#06B6D4] transition-colors"
                        title="Sort by incident name"
                      >
                        <div className="flex items-center space-x-1">
                          <span>INCIDENT / REGION</span>
                          {sortColumn === 'name' ? (
                            sortAsc ? <ArrowUp className="w-2.5 h-2.5 text-[#06B6D4]" /> : <ArrowDown className="w-2.5 h-2.5 text-[#06B6D4]" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('frp')}
                        className="p-2 text-right cursor-pointer hover:text-[#06B6D4] transition-colors"
                        title="Sort by Fire Radiative Power"
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>FRP (MW)</span>
                          {sortColumn === 'frp' ? (
                            sortAsc ? <ArrowUp className="w-2.5 h-2.5 text-[#06B6D4]" /> : <ArrowDown className="w-2.5 h-2.5 text-[#06B6D4]" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('brightnessTemp')}
                        className="p-2 text-right cursor-pointer hover:text-[#06B6D4] transition-colors"
                        title="Sort by Brightness Temperature"
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>TEMP (K)</span>
                          {sortColumn === 'brightnessTemp' ? (
                            sortAsc ? <ArrowUp className="w-2.5 h-2.5 text-[#06B6D4]" /> : <ArrowDown className="w-2.5 h-2.5 text-[#06B6D4]" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('severity')}
                        className="p-2 text-center cursor-pointer hover:text-[#06B6D4] transition-colors"
                        title="Sort by Thermal Severity Tier"
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>TIER</span>
                          {sortColumn === 'severity' ? (
                            sortAsc ? <ArrowUp className="w-2.5 h-2.5 text-[#06B6D4]" /> : <ArrowDown className="w-2.5 h-2.5 text-[#06B6D4]" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {sortedHotspotsTable.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-[#64748B] font-['Geist'] text-xs">
                          No incident records matching current filter.
                        </td>
                      </tr>
                    ) : (
                      sortedHotspotsTable.map((h) => {
                        const isSelected = selectedHotspot?.id === h.id;
                        return (
                          <tr
                            key={h.id}
                            onClick={() => {
                              onSelectHotspot(h);
                              onFlyToHotspot(h);
                            }}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#162032] text-[#F8FAFC]'
                                : 'hover:bg-[#111827] text-[#dfe2ef]'
                            }`}
                          >
                            <td className="p-2">
                              <div className="font-semibold text-xs text-[#F8FAFC] truncate max-w-[140px]">
                                {h.name}
                              </div>
                              <div className="text-[9px] text-[#64748B]">
                                {h.id} • {h.satellite}
                              </div>
                            </td>
                            <td className="p-2 text-right text-[#F97316] font-bold">
                              {h.frp}
                            </td>
                            <td className="p-2 text-right text-[#dfe2ef]">
                              {h.brightnessTemp}
                            </td>
                            <td className="p-2 text-center">
                              <span
                                className="px-1.5 py-0.5 rounded-sm text-[8px] uppercase font-bold"
                                style={{
                                  color: getSeverityColor(h.severity),
                                  backgroundColor: `${getSeverityColor(h.severity)}20`,
                                  border: `1px solid ${getSeverityColor(h.severity)}40`,
                                }}
                              >
                                {h.severity.substring(0, 4)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Spectral Payloads & Bands */}
        {activeTab === 'spectral' && (
          <div className="space-y-3">
            <div className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8]">
              PAYLOAD INSTRUMENTATION BANDS
            </div>

            <div className="space-y-2">
              {SPECTRAL_BANDS.map((b) => (
                <div
                  key={b.name}
                  className="bg-[#0D131F] border border-[#1E293B] p-2.5 rounded-sm space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-['JetBrains_Mono'] font-bold text-xs text-[#06B6D4]">
                      {b.name}
                    </span>
                    <span className="text-[9px] font-['JetBrains_Mono'] px-1.5 py-0.5 bg-[#090D16] border border-[#1E293B] text-[#10B981] rounded-sm">
                      RES: {b.resolution}
                    </span>
                  </div>
                  <div className="text-[11px] font-['Geist'] text-[#dfe2ef]">
                    {b.desc}
                  </div>
                  <div className="text-[9px] font-['JetBrains_Mono'] text-[#64748B] flex justify-between pt-1 border-t border-[#1E293B]/60">
                    <span>ROLE: {b.category}</span>
                    <span>SAT: {b.saturation}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Orbit Constellation Telemetry */}
            <div className="pt-2">
              <div className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8] mb-1.5">
                ACTIVE CONSTELLATION NODES
              </div>
              <div className="space-y-1.5">
                {satellites.map((sat) => (
                  <div
                    key={sat.id}
                    className="bg-[#090D16] p-2 rounded-sm border border-[#1E293B] flex items-center justify-between text-[11px] font-['JetBrains_Mono']"
                  >
                    <div>
                      <span className="text-[#F8FAFC] font-bold block">{sat.name}</span>
                      <span className="text-[9px] text-[#64748B]">ALT: {sat.altitudeKm}km • SWATH: {sat.swathWidthKm}km</span>
                    </div>
                    <span className="text-[10px] text-[#10B981] font-semibold">
                      {sat.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Diurnal Analytics */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            <div className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8]">
              24-HOUR PLANETARY DIURNAL FRP PEAKS
            </div>

            <div className="bg-[#0D131F] border border-[#1E293B] p-3 rounded-sm space-y-2">
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#94A3B8]">
                GLOBAL RADIATIVE POWER (MW) OVER 24 HOURS
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={HOURLY_HISTOGRAM_DATA}>
                    <XAxis
                      dataKey="hour"
                      stroke="#64748B"
                      fontSize={9}
                      fontFamily="JetBrains Mono"
                    />
                    <YAxis stroke="#64748B" fontSize={9} fontFamily="JetBrains Mono" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#334155',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                    <Bar dataKey="frpTotal" fill="#F97316" radius={[2, 2, 0, 0]} name="Total FRP (MW)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] font-['Geist'] text-[#94A3B8]">
                Peak planetary burn radiance occurs during 14:00 - 16:00 solar thermal maximum.
              </div>
            </div>

            {/* Active Anomaly Count Bar */}
            <div className="bg-[#0D131F] border border-[#1E293B] p-3 rounded-sm space-y-2">
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#94A3B8]">
                ACTIVE ANOMALIES DETECTED PER PASS
              </div>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={HOURLY_HISTOGRAM_DATA}>
                    <XAxis dataKey="hour" stroke="#64748B" fontSize={9} fontFamily="JetBrains Mono" />
                    <YAxis stroke="#64748B" fontSize={9} fontFamily="JetBrains Mono" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#334155',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                    <Area type="monotone" dataKey="anomalies" stroke="#06B6D4" fill="#06B6D420" name="Hotspot Count" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

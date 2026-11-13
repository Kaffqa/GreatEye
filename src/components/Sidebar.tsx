import React from 'react';
import {
  Layers,
  Filter,
  Flame,
  Search,
  Satellite,
  Compass,
  Wind,
  CloudFog,
  Scan,
  Maximize2,
  Activity,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from 'lucide-react';
import { LayerVisibility, FilterState, SatelliteTrack, ThermalSeverity } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  layers: LayerVisibility;
  onToggleLayer: (layerKey: keyof LayerVisibility) => void;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  satellites: SatelliteTrack[];
  onFlyToRegion: (lat: number, lng: number, zoom: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  layers,
  onToggleLayer,
  filters,
  onFilterChange,
  satellites,
  onFlyToRegion,
}) => {
  const regions = [
    { name: 'Sierra Foothills, CA', lat: 39.8672, lng: -121.4398, zoom: 8, severity: 'critical' },
    { name: 'Pantanal Basin, BR', lat: -19.0125, lng: -57.6534, zoom: 8, severity: 'critical' },
    { name: 'Kimberley Ridge, AU', lat: -16.4821, lng: 125.8245, zoom: 7, severity: 'warning' },
    { name: 'Peloponnese, GR', lat: 37.3821, lng: 22.3789, zoom: 8, severity: 'warning' },
    { name: 'Fort McMurray, CA', lat: 56.7264, lng: -111.3803, zoom: 8, severity: 'elevated' },
  ];

  if (!isOpen) {
    return (
      <aside className="w-14 bg-[#0D131F] border-r border-[#1E293B] flex flex-col items-center py-3 space-y-4 select-none shrink-0 z-20 transition-all duration-200">
        <button
          onClick={onToggle}
          className="p-2 rounded-sm bg-[#111827] border border-[#1E293B] hover:border-[#06B6D4] text-[#94A3B8] hover:text-[#06B6D4] transition-colors"
          title="Expand Left Navigation"
          aria-label="Expand navigation panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-8 h-[1px] bg-[#1E293B]" />

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => onToggleLayer('viirsHotspots')}
            className={`p-2 rounded-sm border transition-colors ${
              layers.viirsHotspots
                ? 'bg-[#162032] border-[#F97316] text-[#F97316]'
                : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
            }`}
            title="VIIRS 375m Thermal Hotspots"
          >
            <Flame className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleLayer('sentinelSwir')}
            className={`p-2 rounded-sm border transition-colors ${
              layers.sentinelSwir
                ? 'bg-[#162032] border-[#06B6D4] text-[#06B6D4]'
                : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
            }`}
            title="Sentinel-2 SWIR B12/B8A"
          >
            <Scan className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleLayer('smokeAod')}
            className={`p-2 rounded-sm border transition-colors ${
              layers.smokeAod
                ? 'bg-[#162032] border-[#FBBF24] text-[#FBBF24]'
                : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
            }`}
            title="Smoke Aerosol Optical Depth"
          >
            <CloudFog className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleLayer('satelliteTracks')}
            className={`p-2 rounded-sm border transition-colors ${
              layers.satelliteTracks
                ? 'bg-[#162032] border-[#10B981] text-[#10B981]'
                : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
            }`}
            title="Satellite Orbits & Ground Tracks"
          >
            <Satellite className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-[#0D131F] border-r border-[#1E293B] flex flex-col h-full select-none shrink-0 z-20 text-xs overflow-y-auto">
      {/* Title Header */}
      <div className="h-10 border-b border-[#1E293B] px-3 flex items-center justify-between bg-[#111827]">
        <span className="font-['JetBrains_Mono'] font-medium text-[11px] tracking-wider text-[#94A3B8] uppercase flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>RECONNAISSANCE LAYERS</span>
        </span>
        <button
          onClick={onToggle}
          className="p-1 rounded-sm text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          title="Collapse Panel"
          aria-label="Collapse navigation panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Search */}
        <div>
          <label className="block text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8] mb-1">
            ANOMALY SEARCH
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search region, country, sat..."
              className="w-full h-8 pl-8 pr-7 bg-[#090D16] border border-[#1E293B] focus:border-[#06B6D4] rounded-sm text-xs font-['Geist'] text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-2 top-2 text-[#64748B] hover:text-[#F8FAFC]"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sensor Overlays */}
        <div className="space-y-2">
          <div className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
            <span>SENSOR OVERLAYS</span>
            <span className="text-[#06B6D4] font-normal">8 ACTIVE</span>
          </div>

          <div className="space-y-1.5 bg-[#090D16] p-2 rounded-sm border border-[#1E293B]">
            {/* VIIRS Hotspots */}
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-[#111827] p-1 rounded-sm transition-colors">
              <input
                type="checkbox"
                checked={layers.viirsHotspots}
                onChange={() => onToggleLayer('viirsHotspots')}
                className="w-3.5 h-3.5 rounded-sm bg-[#090D16] border border-[#334155] accent-[#F97316] cursor-pointer"
              />
              <span className="flex-1 font-['Geist'] text-[#dfe2ef]">VIIRS I-Band (375m)</span>
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            </label>

            {/* MODIS */}
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-[#111827] p-1 rounded-sm transition-colors">
              <input
                type="checkbox"
                checked={layers.modisHotspots}
                onChange={() => onToggleLayer('modisHotspots')}
                className="w-3.5 h-3.5 rounded-sm bg-[#090D16] border border-[#334155] accent-[#F97316] cursor-pointer"
              />
              <span className="flex-1 font-['Geist'] text-[#dfe2ef]">MODIS Thermal (1km)</span>
              <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
            </label>

            {/* Sentinel SWIR */}
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-[#111827] p-1 rounded-sm transition-colors">
              <input
                type="checkbox"
                checked={layers.sentinelSwir}
                onChange={() => onToggleLayer('sentinelSwir')}
                className="w-3.5 h-3.5 rounded-sm bg-[#090D16] border border-[#334155] accent-[#06B6D4] cursor-pointer"
              />
              <span className="flex-1 font-['Geist'] text-[#dfe2ef]">Sentinel-2 SWIR B12</span>
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            </label>

            {/* Heatmap */}
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-[#111827] p-1 rounded-sm transition-colors">
              <input
                type="checkbox"
                checked={layers.thermalHeatmap}
                onChange={() => onToggleLayer('thermalHeatmap')}
                className="w-3.5 h-3.5 rounded-sm bg-[#090D16] border border-[#334155] accent-[#EF4444] cursor-pointer"
              />
              <span className="flex-1 font-['Geist'] text-[#dfe2ef]">Thermal Density Grid</span>
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            </label>

            {/* Smoke AOD */}
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-[#111827] p-1 rounded-sm transition-colors">
              <input
                type="checkbox"
                checked={layers.smokeAod}
                onChange={() => onToggleLayer('smokeAod')}
                className="w-3.5 h-3.5 rounded-sm bg-[#090D16] border border-[#334155] accent-[#94A3B8] cursor-pointer"
              />
              <span className="flex-1 font-['Geist'] text-[#dfe2ef]">Smoke Aerosol (AOD)</span>
              <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
            </label>

            {/* Wind Vectors */}
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-[#111827] p-1 rounded-sm transition-colors">
              <input
                type="checkbox"
                checked={layers.windVectors}
                onChange={() => onToggleLayer('windVectors')}
                className="w-3.5 h-3.5 rounded-sm bg-[#090D16] border border-[#334155] accent-[#06B6D4] cursor-pointer"
              />
              <span className="flex-1 font-['Geist'] text-[#dfe2ef]">Surface Wind Vectors</span>
              <Wind className="w-3 h-3 text-[#06B6D4]" />
            </label>

            {/* Satellite Tracks */}
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-[#111827] p-1 rounded-sm transition-colors">
              <input
                type="checkbox"
                checked={layers.satelliteTracks}
                onChange={() => onToggleLayer('satelliteTracks')}
                className="w-3.5 h-3.5 rounded-sm bg-[#090D16] border border-[#334155] accent-[#10B981] cursor-pointer"
              />
              <span className="flex-1 font-['Geist'] text-[#dfe2ef]">Orbital Ground Tracks</span>
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            </label>
          </div>
        </div>

        {/* Severity Filter (Segmented Radio) */}
        <div>
          <label className="block text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8] mb-1.5">
            SEVERITY TIER
          </label>
          <div className="grid grid-cols-5 gap-1 bg-[#090D16] p-1 rounded-sm border border-[#1E293B]">
            {(['all', 'critical', 'warning', 'elevated', 'nominal'] as (ThermalSeverity | 'all')[]).map(
              (sev) => {
                const isActive = filters.severityFilter === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => onFilterChange({ ...filters, severityFilter: sev })}
                    className={`py-1 rounded-sm font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-[#1E293B] text-[#F8FAFC] font-bold shadow-sm'
                        : 'text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {sev === 'critical' ? 'CRIT' : sev === 'warning' ? 'WARN' : sev === 'elevated' ? 'ELEV' : sev === 'nominal' ? 'NOM' : 'ALL'}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Confidence Threshold */}
        <div>
          <div className="flex justify-between text-[10px] font-['JetBrains_Mono'] mb-1">
            <span className="text-[#94A3B8] uppercase">MIN CONFIDENCE</span>
            <span className="text-[#06B6D4]">{filters.minConfidence}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={99}
            value={filters.minConfidence}
            onChange={(e) =>
              onFilterChange({ ...filters, minConfidence: parseInt(e.target.value, 10) })
            }
            className="w-full h-1 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#06B6D4]"
          />
        </div>

        {/* Min FRP Threshold */}
        <div>
          <div className="flex justify-between text-[10px] font-['JetBrains_Mono'] mb-1">
            <span className="text-[#94A3B8] uppercase">MIN RADIATIVE POWER</span>
            <span className="text-[#F97316]">{filters.minFrp} MW</span>
          </div>
          <input
            type="range"
            min={0}
            max={600}
            step={25}
            value={filters.minFrp}
            onChange={(e) =>
              onFilterChange({ ...filters, minFrp: parseInt(e.target.value, 10) })
            }
            className="w-full h-1 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#F97316]"
          />
        </div>

        {/* Satellite Selection Filter */}
        <div>
          <label className="block text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8] mb-1">
            SATELLITE PLATFORM
          </label>
          <select
            value={filters.satelliteFilter}
            onChange={(e) => onFilterChange({ ...filters, satelliteFilter: e.target.value })}
            className="w-full h-8 px-2 bg-[#090D16] border border-[#1E293B] focus:border-[#06B6D4] rounded-sm text-xs font-['JetBrains_Mono'] text-[#F8FAFC] outline-none"
          >
            <option value="ALL">ALL CONSTELLATIONS</option>
            <option value="NOAA-20">NOAA-20 (VIIRS 375m)</option>
            <option value="Suomi NPP">Suomi NPP (VIIRS 375m)</option>
            <option value="Sentinel-2A">Sentinel-2A (MSI 20m)</option>
            <option value="Terra">Terra (MODIS 1km)</option>
            <option value="Aqua">Aqua (MODIS 1km)</option>
          </select>
        </div>

        {/* Reset Filter Button if any filter active */}
        {(filters.minConfidence !== 75 ||
          filters.minFrp !== 0 ||
          filters.severityFilter !== 'all' ||
          filters.satelliteFilter !== 'ALL' ||
          filters.searchQuery !== '') && (
          <button
            onClick={() =>
              onFilterChange({
                searchQuery: '',
                minConfidence: 75,
                minFrp: 0,
                severityFilter: 'all',
                satelliteFilter: 'ALL',
              })
            }
            className="w-full py-1.5 px-2 bg-[#162032] hover:bg-[#1E293B] border border-[#334155] rounded-sm text-[#06B6D4] text-[10px] font-['JetBrains_Mono'] flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#06B6D4]" />
            <span>RESET ALL FILTERS</span>
          </button>
        )}

        {/* Hotspot Sector Bookmarks */}
        <div>
          <label className="block text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#94A3B8] mb-1.5 flex items-center justify-between">
            <span>SECTOR BOOKMARKS</span>
            <MapPin className="w-3 h-3 text-[#06B6D4]" />
          </label>
          <div className="space-y-1">
            {regions.map((reg) => (
              <button
                key={reg.name}
                onClick={() => onFlyToRegion(reg.lat, reg.lng, reg.zoom)}
                className="w-full px-2 py-1.5 bg-[#090D16] hover:bg-[#162032] border border-[#1E293B] hover:border-[#334155] rounded-sm flex items-center justify-between text-left transition-colors"
              >
                <span className="font-['Geist'] text-[#dfe2ef] text-[11px] truncate">
                  {reg.name}
                </span>
                <span
                  className={`text-[9px] font-['JetBrains_Mono'] px-1 rounded-sm ${
                    reg.severity === 'critical'
                      ? 'bg-red-950/60 text-[#EF4444] border border-red-800/40'
                      : reg.severity === 'warning'
                      ? 'bg-orange-950/60 text-[#F97316] border border-orange-800/40'
                      : 'bg-emerald-950/60 text-[#10B981] border border-emerald-800/40'
                  }`}
                >
                  {reg.severity.substring(0, 4).toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import {
  Layers,
  Filter,
  Flame,
  Search,
  Satellite,
  Compass,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  TreePine,
  Calendar,
  Sliders,
  X,
} from 'lucide-react';
import { SpatiotemporalFilter, LayerVisibility } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../utils/i18n';
import { useBreakpoint } from '../utils/useBreakpoint';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  filter: SpatiotemporalFilter;
  onFilterChange: (newFilter: SpatiotemporalFilter) => void;
  islands: string[];
  provincesByIsland: Record<string, string[]>;
  layers: LayerVisibility;
  onToggleLayer: (layerKey: keyof LayerVisibility) => void;
  onResetFilter: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  isOpen,
  onToggle,
  filter,
  onFilterChange,
  islands,
  provincesByIsland,
  layers,
  onToggleLayer,
  onResetFilter,
}) => {
  const { theme, language } = usePreferences();
  const t = useTranslation(language);

  // Available provinces for currently selected island
  const availableProvinces = React.useMemo(() => {
    if (filter.selectedIsland === 'all') {
      const all: string[] = [];
      for (const provs of Object.values(provincesByIsland)) {
        all.push(...provs);
      }
      return Array.from(new Set(all)).sort();
    }
    return provincesByIsland[filter.selectedIsland] || [];
  }, [filter.selectedIsland, provincesByIsland]);

  const { isMobile, isTablet } = useBreakpoint();
  const isMobileOrTablet = isMobile || isTablet;

  if (!isOpen) {
    if (isMobileOrTablet) {
      return null;
    }
    return (
      <aside
        className={`w-12 border-r flex flex-col items-center py-3 space-y-4 select-none shrink-0 z-20 transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200'
            : 'bg-[#090e18] border-slate-800'
        }`}
      >
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            theme === 'light'
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-400'
          }`}
          title={t.navToggleFilter}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className={`w-6 h-[1px] ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`} />
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg cursor-pointer ${
            theme === 'light' ? 'text-slate-500 hover:text-cyan-600' : 'text-slate-400 hover:text-cyan-400'
          }`}
          title={t.filterTitle}
        >
          <Filter className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <>
      {/* Backdrop overlay for mobile & tablet */}
      {isMobileOrTablet && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-20 w-80 max-w-[85vw] lg:w-72 border-r flex flex-col h-full select-none shrink-0 text-xs overflow-y-auto transition-colors shadow-2xl lg:shadow-none animate-in slide-in-from-left duration-200 ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#080d17] border-slate-800/90 text-slate-100'
        }`}
      >
        {/* Title Header */}
        <div
          className={`h-12 border-b px-4 flex items-center justify-between sticky top-0 z-10 transition-colors ${
            theme === 'light'
              ? 'bg-slate-50/98 border-slate-200'
              : 'bg-[#080d17]/98 border-slate-800/90'
          }`}
        >
          <span
            className={`font-mono font-bold text-[11px] tracking-wider uppercase flex items-center gap-2 ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            <Filter className="w-4 h-4 text-cyan-500" />
            <span>{t.filterTitle}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onResetFilter}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
              }`}
              title={t.filterResetAll}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggle}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
              title="Tutup Panel"
            >
              {isMobileOrTablet ? <X className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

      <div className="p-4 space-y-5">
        {/* 1. Filter Rentang Waktu (Tahun) */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mb-2">
            <span
              className={`flex items-center gap-1.5 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3 text-cyan-500" />
              <span>{t.filterYearRange}</span>
            </span>
            {filter.selectedYear === 2026 && (
              <span className="text-[9px] text-cyan-500 font-semibold lowercase">
                {language === 'en' ? 'thru jul 2026' : 's/d jul 2026'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[2023, 2024, 2025, 2026].map((yr) => (
              <button
                key={yr}
                onClick={() => {
                  const newFilter = { ...filter, selectedYear: yr };
                  if (yr === 2026 && typeof filter.selectedMonth === 'number' && filter.selectedMonth > 7) {
                    newFilter.selectedMonth = 'all';
                  }
                  if (yr === 2026 && filter.selectedDate && filter.selectedDate > '2026-07-31') {
                    newFilter.selectedDate = null;
                  }
                  onFilterChange(newFilter);
                }}
                title={
                  yr === 2026
                    ? language === 'en'
                      ? 'Year 2026: Observations recorded through July 31, 2026'
                      : 'Tahun 2026: Data tercatat s/d 31 Juli 2026'
                    : `Tahun ${yr}`
                }
                className={`py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                  filter.selectedYear === yr
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : theme === 'light'
                    ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-black'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{yr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Filter Bulan */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mb-1.5">
            <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
              {t.filterMonth}
            </span>
            {filter.selectedMonth !== 'all' && (
              <button
                onClick={() => onFilterChange({ ...filter, selectedMonth: 'all' })}
                className="text-cyan-500 hover:underline cursor-pointer lowercase"
              >
                {t.filterResetMonth}
              </button>
            )}
          </div>
          <select
            value={filter.selectedMonth}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                selectedMonth: e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10),
              })
            }
            className={`w-full h-8 px-2.5 border rounded-lg text-xs font-mono outline-none focus:border-cyan-400 cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          >
            <option value="all">
              {filter.selectedYear === 2026
                ? language === 'en'
                  ? 'All Months (Jan – Jul 2026)'
                  : 'Semua Bulan (Jan – Jul 2026)'
                : language === 'en'
                ? 'All Months (Full Year)'
                : 'Semua Bulan (Jan – Des)'}
            </option>
            <option value="1">{language === 'en' ? 'January' : 'Januari'}</option>
            <option value="2">{language === 'en' ? 'February' : 'Februari'}</option>
            <option value="3">{language === 'en' ? 'March' : 'Maret'}</option>
            <option value="4">{language === 'en' ? 'April' : 'April'}</option>
            <option value="5">{language === 'en' ? 'May' : 'Mei'}</option>
            <option value="6">{language === 'en' ? 'June' : 'Juni'}</option>
            <option value="7">{language === 'en' ? 'July' : 'Juli'}</option>
            <option value="8" disabled={filter.selectedYear === 2026}>
              {language === 'en' ? 'August' : 'Agustus'} {filter.selectedYear === 2026 ? '(s/d Jul)' : ''}
            </option>
            <option value="9" disabled={filter.selectedYear === 2026}>
              {language === 'en' ? 'September' : 'September'} {filter.selectedYear === 2026 ? '(s/d Jul)' : ''}
            </option>
            <option value="10" disabled={filter.selectedYear === 2026}>
              {language === 'en' ? 'October' : 'Oktober'} {filter.selectedYear === 2026 ? '(s/d Jul)' : ''}
            </option>
            <option value="11" disabled={filter.selectedYear === 2026}>
              {language === 'en' ? 'November' : 'November'} {filter.selectedYear === 2026 ? '(s/d Jul)' : ''}
            </option>
            <option value="12" disabled={filter.selectedYear === 2026}>
              {language === 'en' ? 'December' : 'Desember'} {filter.selectedYear === 2026 ? '(s/d Jul)' : ''}
            </option>
          </select>
        </div>

        {/* 3. Filter Spesifik Tanggal Harian */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mb-1.5">
            <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
              {t.filterSpecificDate}
            </span>
            {filter.selectedDate && (
              <button
                onClick={() => onFilterChange({ ...filter, selectedDate: null })}
                className="text-rose-500 hover:underline cursor-pointer lowercase"
              >
                {t.filterResetDate}
              </button>
            )}
          </div>
          <input
            type="date"
            value={filter.selectedDate || ''}
            min={filter.selectedYear === 2023 ? '2023-01-02' : `${filter.selectedYear}-01-01`}
            max={filter.selectedYear === 2026 ? '2026-07-31' : `${filter.selectedYear}-12-31`}
            onChange={(e) => onFilterChange({ ...filter, selectedDate: e.target.value || null })}
            style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
            className={`w-full h-8 px-2.5 border rounded-lg text-xs font-mono outline-none focus:border-cyan-400 cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          />
        </div>

        {/* 4. Filter Wilayah Kepulauan */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-cyan-500" />
            <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
              {t.filterIsland}
            </span>
          </label>
          <select
            value={filter.selectedIsland}
            onChange={(e) => {
              onFilterChange({
                ...filter,
                selectedIsland: e.target.value,
                selectedProvince: 'all',
              });
            }}
            className={`w-full h-8 px-2.5 border rounded-lg text-xs font-mono outline-none focus:border-cyan-400 cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          >
            <option value="all">{t.filterIslandAll}</option>
            {islands.map((isl) => (
              <option key={isl} value={isl}>
                {isl}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Filter 38 Provinsi */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-cyan-500" />
            <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
              {t.filterProvince}
            </span>
          </label>
          <select
            value={filter.selectedProvince}
            onChange={(e) => onFilterChange({ ...filter, selectedProvince: e.target.value })}
            className={`w-full h-8 px-2.5 border rounded-lg text-xs font-mono outline-none focus:border-cyan-400 cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          >
            <option value="all">
              {t.filterProvinceAll} {filter.selectedIsland !== 'all' ? `(${filter.selectedIsland})` : ''}
            </option>
            {availableProvinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Saringan Khusus Kebakaran Vegetasi / Lahan */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            theme === 'light'
              ? 'border-emerald-200 bg-emerald-50/70'
              : 'border-emerald-900/40 bg-emerald-950/20'
          }`}
        >
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.onlyVegetation}
              onChange={(e) => onFilterChange({ ...filter, onlyVegetation: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded border-slate-400 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <div>
              <div
                className={`font-semibold text-xs flex items-center gap-1.5 ${
                  theme === 'light' ? 'text-emerald-800' : 'text-emerald-300'
                }`}
              >
                <TreePine className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {language === 'en'
                    ? 'Only Vegetation / Forest Fires'
                    : 'Hanya Kebakaran Vegetasi/Lahan'}
                </span>
              </div>
              <p
                className={`text-[10px] mt-0.5 leading-relaxed ${
                  theme === 'light' ? 'text-emerald-700/80' : 'text-slate-400'
                }`}
              >
                {language === 'en'
                  ? 'Excludes industrial gas flaring and non-forest industrial anomalies.'
                  : 'Menyingkirkan anomali gas flare industri migas dan pabrik non-hutan.'}
              </p>
            </div>
          </label>
        </div>

        {/* 7. Filter Sumber Sensor Asal */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Satellite className="w-3 h-3 text-cyan-500" />
            <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
              {language === 'en' ? 'CLUSTER SENSOR SOURCE' : 'SUMBER SENSOR KLASTER'}
            </span>
          </label>
          <select
            value={filter.sensorOrigin}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                sensorOrigin: e.target.value as any,
              })
            }
            className={`w-full h-8 px-2.5 border rounded-lg text-xs font-mono outline-none focus:border-cyan-400 cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          >
            <option value="all">
              {language === 'en' ? 'All Sensor Sources' : 'Semua Asal Sensor'}
            </option>
            <option value="Keduanya">
              {language === 'en'
                ? 'Both (Harmonized MODIS + VIIRS)'
                : 'Keduanya (Harmonisasi MODIS + VIIRS)'}
            </option>
            <option value="Hanya VIIRS">
              {language === 'en' ? 'VIIRS Only (375m)' : 'Hanya VIIRS (375m)'}
            </option>
            <option value="Hanya MODIS">
              {language === 'en' ? 'MODIS Only (1km)' : 'Hanya MODIS (1km)'}
            </option>
          </select>
        </div>

        {/* 8. Minimum FRP (MW) */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mb-1.5">
            <span
              className={`flex items-center gap-1 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500" />
              <span>{t.filterFrpThreshold}</span>
            </span>
            <span className="text-amber-500 font-bold">{filter.minFrp} MW</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            step={5}
            value={filter.minFrp}
            onChange={(e) => onFilterChange({ ...filter, minFrp: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* 9. Layer Kontrol Tampilan Peta */}
        <div
          className={`border-t pt-4 space-y-2 ${
            theme === 'light' ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <div
            className={`text-[10px] font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5 ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-500" />
            <span>{language === 'en' ? 'MAP OVERLAY LAYERS' : 'LAYER OVERLAY PETA'}</span>
          </div>

          <label
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                : 'bg-slate-900/50 hover:bg-slate-900 text-slate-300'
            }`}
          >
            <span>{language === 'en' ? 'Centroid Cluster Points' : 'Titik Klaster Centroid'}</span>
            <input
              type="checkbox"
              checked={layers.clusterPoints}
              onChange={() => onToggleLayer('clusterPoints')}
              className="accent-cyan-500 w-3.5 h-3.5"
            />
          </label>

          <label
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                : 'bg-slate-900/50 hover:bg-slate-900 text-slate-300'
            }`}
          >
            <span>{language === 'en' ? 'Anomaly Density Heatmap' : 'Heatmap Kepadatan Anomali'}</span>
            <input
              type="checkbox"
              checked={layers.thermalHeatmap}
              onChange={() => onToggleLayer('thermalHeatmap')}
              className="accent-amber-500 w-3.5 h-3.5"
            />
          </label>
        </div>
      </div>
    </aside>
    </>
  );
});

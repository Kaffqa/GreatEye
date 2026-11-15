import React from 'react';
import { Layers, ShieldCheck, Flame, Satellite, ArrowDownRight, Zap } from 'lucide-react';
import { MissionMetrics, SpatiotemporalFilter } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface TelemetryHudProps {
  metrics: MissionMetrics;
  filter: SpatiotemporalFilter;
}

export const TelemetryHud: React.FC<TelemetryHudProps> = React.memo(({ metrics, filter }) => {
  const { theme, language } = usePreferences();

  const scopeName =
    filter.selectedProvince !== 'all'
      ? filter.selectedProvince
      : filter.selectedIsland !== 'all'
      ? filter.selectedIsland
      : language === 'en'
      ? 'All Indonesia'
      : 'Seluruh Indonesia';

  // Format FRP cleanly so it never wraps or overflows
  const roundedFrp = Math.round(metrics.totalFrp);

  return (
    <div className="flex overflow-x-auto no-scrollbar snap-x gap-2 py-0.5 md:grid md:grid-cols-3 lg:grid-cols-6 md:gap-2.5 mb-2 sm:mb-3 w-full shrink-0">
      {/* 1. Raw MODIS */}
      <div
        className={`flex flex-col justify-between w-[140px] md:w-auto shrink-0 snap-start h-[82px] sm:h-[90px] p-2 sm:p-2.5 rounded-xl border shadow-sm transition-all ${
          theme === 'light'
            ? 'bg-white/98 border-blue-200 hover:border-blue-400'
            : 'bg-[#070c18]/98 border-blue-900/50 hover:border-blue-700/60'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[10px] font-mono font-semibold tracking-wider uppercase truncate ${
                theme === 'light' ? 'text-blue-700' : 'text-blue-300'
              }`}
            >
              Raw MODIS
            </span>
            <span
              className={`text-[9px] font-mono px-1 py-0.2 rounded border shrink-0 ${
                theme === 'light'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-blue-950/80 border-blue-800/50 text-blue-300'
              }`}
            >
              1 km
            </span>
          </div>
          <Satellite className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-1" />
        </div>
        <div
          className={`text-xs sm:text-sm lg:text-base xl:text-lg font-mono font-bold tracking-tight whitespace-nowrap ${
            theme === 'light' ? 'text-blue-900' : 'text-blue-200'
          }`}
        >
          {metrics.totalRawModis.toLocaleString()}
        </div>
        <div className="text-[9.5px] text-slate-500 font-mono truncate" title="Terra / Aqua NASA">
          Terra / Aqua NASA
        </div>
      </div>

      {/* 2. Raw VIIRS */}
      <div
        className={`flex flex-col justify-between w-[140px] md:w-auto shrink-0 snap-start h-[82px] sm:h-[90px] p-2 sm:p-2.5 rounded-xl border shadow-sm transition-all ${
          theme === 'light'
            ? 'bg-white/98 border-indigo-200 hover:border-indigo-400'
            : 'bg-[#070c18]/98 border-indigo-900/50 hover:border-indigo-700/60'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[10px] font-mono font-semibold tracking-wider uppercase truncate ${
                theme === 'light' ? 'text-indigo-700' : 'text-indigo-300'
              }`}
            >
              Raw VIIRS
            </span>
            <span
              className={`text-[9px] font-mono px-1 py-0.2 rounded border shrink-0 ${
                theme === 'light'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-indigo-950/80 border-indigo-800/50 text-indigo-300'
              }`}
            >
              375 m
            </span>
          </div>
          <Satellite className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-1" />
        </div>
        <div
          className={`text-xs sm:text-sm lg:text-base xl:text-lg font-mono font-bold tracking-tight whitespace-nowrap ${
            theme === 'light' ? 'text-indigo-900' : 'text-indigo-200'
          }`}
        >
          {metrics.totalRawViirs.toLocaleString()}
        </div>
        <div className="text-[9.5px] text-slate-500 font-mono truncate" title="Suomi NPP / NOAA-20">
          Suomi NPP / NOAA-20
        </div>
      </div>

      {/* 3. Total Mentah Hotspot */}
      <div
        className={`flex flex-col justify-between w-[140px] md:w-auto shrink-0 snap-start h-[82px] sm:h-[90px] p-2 sm:p-2.5 rounded-xl border shadow-sm transition-all ${
          theme === 'light'
            ? 'bg-white/98 border-amber-200 hover:border-amber-400'
            : 'bg-[#070c18]/98 border-amber-900/50 hover:border-amber-700/60'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span
            className={`text-[10px] font-mono font-semibold tracking-wider uppercase truncate ${
              theme === 'light' ? 'text-amber-700' : 'text-amber-300'
            }`}
          >
            {language === 'en' ? 'Total Raw' : 'Total Mentah'}
          </span>
          <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
        </div>
        <div
          className={`text-xs sm:text-sm lg:text-base xl:text-lg font-mono font-bold tracking-tight whitespace-nowrap ${
            theme === 'light' ? 'text-amber-900' : 'text-amber-200'
          }`}
        >
          {metrics.totalRawHotspots.toLocaleString()}
        </div>
        <div
          className="text-[9.5px] text-slate-500 font-mono truncate"
          title={language === 'en' ? 'Accumulated 2 Satellites' : 'Akumulasi 2 Satelit'}
        >
          {language === 'en' ? 'Accumulated 2 Satellites' : 'Akumulasi 2 Satelit'}
        </div>
      </div>

      {/* 4. Klaster Bersih DBSCAN (Hero Card) */}
      <div
        className={`flex flex-col justify-between w-[140px] md:w-auto shrink-0 snap-start h-[82px] sm:h-[90px] p-2 sm:p-2.5 rounded-xl border shadow-md transition-all ${
          theme === 'light'
            ? 'bg-cyan-50/90 border-cyan-400 shadow-cyan-100 hover:border-cyan-500'
            : 'bg-[#071322]/98 border-cyan-500/60 shadow-cyan-950/50 hover:border-cyan-400'
        }`}
      >
        <div
          className={`flex items-center justify-between ${
            theme === 'light' ? 'text-cyan-800' : 'text-cyan-300'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping shrink-0" />
            <span
              className={`text-[10px] font-mono font-bold tracking-wider uppercase truncate ${
                theme === 'light' ? 'text-cyan-800' : 'text-cyan-300'
              }`}
            >
              {language === 'en' ? 'Clean Clusters' : 'Klaster Bersih'}
            </span>
          </div>
          <Layers className="w-3.5 h-3.5 text-cyan-500 shrink-0 ml-1" />
        </div>
        <div
          className={`text-xs sm:text-sm lg:text-base xl:text-lg font-mono font-extrabold tracking-tight whitespace-nowrap ${
            theme === 'light' ? 'text-cyan-900' : 'text-cyan-200'
          }`}
        >
          {metrics.totalCleanClusters.toLocaleString()}
        </div>
        <div
          className={`text-[9.5px] font-mono truncate font-medium ${
            theme === 'light' ? 'text-cyan-700' : 'text-cyan-400/90'
          }`}
          title="Harmonisasi DBSCAN"
        >
          {language === 'en' ? 'DBSCAN Harmonized' : 'Harmonisasi DBSCAN'}
        </div>
      </div>

      {/* 5. Tingkat Reduksi Duplikasi (%) */}
      <div
        className={`flex flex-col justify-between w-[140px] md:w-auto shrink-0 snap-start h-[82px] sm:h-[90px] p-2 sm:p-2.5 rounded-xl border shadow-sm transition-all ${
          theme === 'light'
            ? 'bg-white/98 border-emerald-200 hover:border-emerald-400'
            : 'bg-[#070c18]/98 border-emerald-900/50 hover:border-emerald-700/60'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span
            className={`text-[10px] font-mono font-semibold tracking-wider uppercase truncate ${
              theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'
            }`}
          >
            {language === 'en' ? 'Duplication Cut' : 'Reduksi Duplikasi'}
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
        </div>
        <div
          className={`text-xs sm:text-sm lg:text-base xl:text-lg font-mono font-bold flex items-center gap-1 tracking-tight whitespace-nowrap ${
            theme === 'light' ? 'text-emerald-800' : 'text-emerald-300'
          }`}
        >
          <span>{metrics.reductionRatePct}%</span>
          <ArrowDownRight className="w-4 h-4 text-emerald-500 shrink-0" />
        </div>
        <div
          className="text-[9.5px] text-slate-500 font-mono truncate"
          title={language === 'en' ? 'Eliminated Overlaps' : 'Double-Count Tereliminasi'}
        >
          {language === 'en' ? 'Eliminated Overlaps' : 'Double-Count Tereliminasi'}
        </div>
      </div>

      {/* 6. Total Energi Termal FRP */}
      <div
        className={`flex flex-col justify-between w-[140px] md:w-auto shrink-0 snap-start h-[82px] sm:h-[90px] p-2 sm:p-2.5 rounded-xl border shadow-sm transition-all ${
          theme === 'light'
            ? 'bg-white/98 border-rose-200 hover:border-rose-400'
            : 'bg-[#070c18]/98 border-rose-900/50 hover:border-rose-700/60'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span
            className={`text-[10px] font-mono font-semibold tracking-wider uppercase truncate ${
              theme === 'light' ? 'text-rose-700' : 'text-rose-300'
            }`}
          >
            {language === 'en' ? 'Total FRP Energy' : 'Total Energi FRP'}
          </span>
          <Zap className="w-3.5 h-3.5 text-rose-500 shrink-0 ml-1" />
        </div>
        <div
          className={`text-xs sm:text-sm lg:text-base xl:text-lg font-mono font-bold tracking-tight whitespace-nowrap flex items-baseline ${
            theme === 'light' ? 'text-rose-900' : 'text-rose-200'
          }`}
          title={`${metrics.totalFrp.toLocaleString()} MW`}
        >
          <span>{roundedFrp.toLocaleString()}</span>
          <span className="text-[10px] font-mono font-normal text-rose-500 ml-1 shrink-0">
            MW
          </span>
        </div>
        <div className="text-[9.5px] text-slate-500 font-mono truncate" title={scopeName}>
          {scopeName}
        </div>
      </div>
    </div>
  );
});

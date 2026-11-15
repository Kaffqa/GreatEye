import React from 'react';
import { Calendar, Flame, AlertCircle } from 'lucide-react';
import { IndeksHarian, SpatiotemporalFilter } from '../types';
import { buildFireCalendarMatrix } from '../utils/analytics';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../utils/i18n';

interface FireCalendarMatrixProps {
  indeksList: IndeksHarian[];
  filter: SpatiotemporalFilter;
  onSelectYearMonth: (year: number, month: number | 'all') => void;
}

export const FireCalendarMatrix: React.FC<FireCalendarMatrixProps> = React.memo(({
  indeksList,
  filter,
  onSelectYearMonth,
}) => {
  const { theme, language } = usePreferences();
  const t = useTranslation(language);

  const { years, matrix } = React.useMemo(() => buildFireCalendarMatrix(indeksList), [indeksList]);

  const monthLabels =
    language === 'en'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  // Helper for thermal color ramp
  const getCellBg = (intensity: number, hasHighAnomaly: boolean, isSelected: boolean) => {
    if (isSelected) {
      return 'border-2 border-cyan-500 ring-2 ring-cyan-500/30';
    }
    if (intensity === 0) {
      return theme === 'light'
        ? 'bg-slate-100 border-slate-200 text-slate-400'
        : 'bg-slate-900/60 border-slate-800 text-slate-600';
    }
    if (intensity < 0.15) {
      return theme === 'light'
        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
        : 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400';
    }
    if (intensity < 0.35) {
      return theme === 'light'
        ? 'bg-amber-50 border-amber-300 text-amber-800'
        : 'bg-amber-950/50 border-amber-800/40 text-amber-300';
    }
    if (intensity < 0.65) {
      return theme === 'light'
        ? 'bg-orange-100 border-orange-400 text-orange-900'
        : 'bg-orange-950/70 border-orange-700/50 text-orange-200';
    }
    return theme === 'light'
      ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
      : 'bg-rose-900/80 border-rose-600/70 text-rose-100 shadow-md shadow-rose-900/40';
  };

  return (
    <div
      className={`rounded-2xl p-4 border font-mono text-xs transition-colors ${
        theme === 'light'
          ? 'bg-white/98 border-slate-200 text-slate-800 shadow-sm'
          : 'bg-[#070c18]/98 border-slate-800/90 text-slate-100'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-500" />
          <h3
            className={`text-xs font-bold tracking-wider uppercase ${
              theme === 'light' ? 'text-slate-800' : 'text-slate-200'
            }`}
          >
            {language === 'en'
              ? 'Fire Calendar Matrix (2023 – Jul 2026)'
              : 'Kalender Matriks Kebakaran (2023 – Jul 2026)'}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="inline-block w-2.5 h-2.5 rounded bg-emerald-500" />{' '}
          {language === 'en' ? 'Low' : 'Rendah'}
          <span className="inline-block w-2.5 h-2.5 rounded bg-amber-500" />{' '}
          {language === 'en' ? 'Mod' : 'Sedang'}
          <span className="inline-block w-2.5 h-2.5 rounded bg-rose-500" />{' '}
          {language === 'en' ? 'Crit' : 'Kritis'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-1 text-[11px] text-slate-400 text-left w-12">
                {language === 'en' ? 'Yr' : 'Thn'}
              </th>
              {monthLabels.map((m) => (
                <th key={m} className="p-1 text-[10px] text-slate-400">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year) => {
              const cells = matrix[year] || [];
              const isYearSelected = filter.selectedYear === year;

              return (
                <tr key={year} className="group">
                  <td className="p-1 text-left">
                    <button
                      onClick={() => onSelectYearMonth(year, 'all')}
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        isYearSelected && filter.selectedMonth === 'all'
                          ? 'bg-cyan-500 text-black'
                          : theme === 'light'
                          ? 'text-slate-700 hover:text-cyan-600'
                          : 'text-slate-300 hover:text-cyan-400'
                      }`}
                    >
                      {year}
                    </button>
                  </td>
                  {cells.map((cell) => {
                    const isSelected =
                      filter.selectedYear === year && filter.selectedMonth === cell.month;
                    return (
                      <td key={cell.month} className="p-1">
                        <button
                          onClick={() => onSelectYearMonth(year, cell.month)}
                          title={`${cell.monthName} ${year}: ${cell.totalKejadian.toLocaleString()} ${
                            language === 'en' ? 'Clusters' : 'Klaster'
                          }, FRP: ${Math.round(cell.totalFrp)} MW, Max Z: ${cell.maxZScore.toFixed(2)}`}
                          className={`w-full h-8 rounded-lg border text-[10px] flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer relative ${getCellBg(
                            cell.intensity,
                            cell.hasHighAnomaly,
                            isSelected
                          )}`}
                        >
                          {cell.totalKejadian > 0 ? (
                            <>
                              <span className="font-semibold leading-none">
                                {cell.totalKejadian > 999
                                  ? `${(cell.totalKejadian / 1000).toFixed(1)}k`
                                  : cell.totalKejadian}
                              </span>
                              {cell.hasHighAnomaly && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                              )}
                            </>
                          ) : (
                            <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-700'}>-</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 text-right flex items-center justify-end gap-1">
        <AlertCircle className="w-3 h-3 text-rose-500" />
        <span>
          {language === 'en'
            ? 'Pulsing red dot indicates months with critical anomaly days (Z ≥ 2.0). Click cell to filter.'
            : 'Titik merah berkedip menandai bulan dengan anomali kritis (Z ≥ 2.0). Klik sel untuk filter.'}
        </span>
      </div>
    </div>
  );
});

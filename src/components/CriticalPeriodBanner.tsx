import React from 'react';
import { AlertTriangle, TrendingUp, Calendar, Zap, BellRing } from 'lucide-react';
import { IndeksHarian, SpatiotemporalFilter } from '../types';
import { detectCriticalPeriods } from '../utils/analytics';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../utils/i18n';

interface CriticalPeriodBannerProps {
  indeksList: IndeksHarian[];
  filter: SpatiotemporalFilter;
  onSelectDate: (date: string) => void;
}

export const CriticalPeriodBanner: React.FC<CriticalPeriodBannerProps> = React.memo(({
  indeksList,
  filter,
  onSelectDate,
}) => {
  const { theme, language } = usePreferences();
  const t = useTranslation(language);

  const { top3Months, top10Days } = React.useMemo(() => {
    return detectCriticalPeriods(indeksList, filter.selectedYear);
  }, [indeksList, filter.selectedYear]);

  // Check if current date filter or today has high anomaly
  const activeDayRecord = React.useMemo(() => {
    if (filter.selectedDate) {
      return indeksList.find((d) => d.tanggal === filter.selectedDate) || null;
    }
    // Check if any day in selected month has anomaly
    if (filter.selectedMonth !== 'all') {
      const monthRows = indeksList.filter(
        (d) => d.tahun === filter.selectedYear && d.bulan === filter.selectedMonth
      );
      return monthRows.find((d) => d.anomali_tinggi || d.z_anomali >= 2.0) || null;
    }
    return null;
  }, [indeksList, filter.selectedDate, filter.selectedYear, filter.selectedMonth]);

  const isCriticalAlert = activeDayRecord && (activeDayRecord.anomali_tinggi || activeDayRecord.z_anomali >= 2.0);

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Dynamic Red Emergency Banner when in High Anomaly State */}
      {isCriticalAlert && (
        <div
          className={`p-3.5 rounded-xl border shadow-lg transition-all ${
            theme === 'light'
              ? 'border-rose-300 bg-rose-50 shadow-rose-100 text-slate-800'
              : 'border-rose-500/60 bg-gradient-to-br from-[#1c080d] via-[#090d16] to-[#1c080d] shadow-rose-950/40 text-slate-100'
          }`}
        >
          {/* Header Row: Indicator, Label & Z-Score Pill */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                {language === 'en' ? 'EARLY ANOMALY WARNING' : 'PERINGATAN DINI ANOMALI'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-[10px] text-rose-500 font-bold whitespace-nowrap">
              Z: +{activeDayRecord.z_anomali.toFixed(2)}σ
            </span>
          </div>

          {/* Date & Anomaly Type */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              {activeDayRecord.tanggal}
            </span>
            <span className="text-[10px] text-rose-500/80">
              {language === 'en' ? 'Extreme Spike (≥ 2.0σ)' : 'Lonjakan Ekstrem (≥ 2.0σ)'}
            </span>
          </div>

          {/* Clean 2-Column Telemetry Badges */}
          <div
            className={`grid grid-cols-2 gap-2 pt-1.5 border-t ${
              theme === 'light' ? 'border-rose-200' : 'border-rose-900/40'
            }`}
          >
            <div
              className={`rounded-lg px-2.5 py-1 flex items-baseline justify-between border ${
                theme === 'light' ? 'bg-white border-rose-200' : 'bg-rose-950/40 border-rose-800/40'
              }`}
            >
              <span className="text-[10px] text-slate-500">
                {language === 'en' ? 'Clusters:' : 'Klaster:'}
              </span>
              <span className="text-xs font-bold text-rose-600">
                {activeDayRecord.kejadian.toLocaleString()}
              </span>
            </div>
            <div
              className={`rounded-lg px-2.5 py-1 flex items-baseline justify-between border ${
                theme === 'light' ? 'bg-white border-rose-200' : 'bg-rose-950/40 border-rose-800/40'
              }`}
            >
              <span className="text-[10px] text-slate-500">FRP:</span>
              <span className="text-xs font-bold text-amber-500">
                {Math.round(activeDayRecord.frp_harmonis).toLocaleString()}{' '}
                <span className="text-[9px] font-normal text-slate-400">MW</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Critical Period Analytics: Top 3 Months & Top 10 Days */}
      <div
        className={`rounded-2xl p-4 border transition-colors ${
          theme === 'light'
            ? 'bg-white/98 border-slate-200 text-slate-800 shadow-sm'
            : 'bg-[#070c18]/98 border-slate-800/90 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <h3
              className={`text-xs font-bold tracking-wider uppercase ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              {language === 'en'
                ? `Critical Period Detection (${filter.selectedYear})`
                : `Deteksi Periode Kritis (${filter.selectedYear})`}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            {language === 'en' ? 'Dry Season Peak' : 'Puncak Musim Kemarau'}
          </span>
        </div>

        {/* Top 3 Active Months */}
        <div className="mb-4">
          <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {language === 'en'
                ? 'Top 3 Active Months (Highest Cluster Accumulation):'
                : '3 Bulan Teraktif (Akumulasi Klaster Tertinggi):'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {top3Months.map((m, idx) => (
              <div
                key={`${m.year}-${m.month}`}
                className={`p-2 rounded-xl border text-center transition-colors ${
                  theme === 'light'
                    ? 'border-amber-200 bg-amber-50/60'
                    : 'border-amber-900/40 bg-amber-950/20'
                }`}
              >
                <div className="text-[10px] text-amber-500 uppercase font-semibold">
                  {language === 'en' ? `Rank #${idx + 1}` : `Peringkat #${idx + 1}`}
                </div>
                <div
                  className={`text-xs font-bold mt-0.5 ${
                    theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {m.monthName} {m.year}
                </div>
                <div className="text-xs font-bold text-amber-500 mt-1">
                  {m.totalKejadian.toLocaleString()}{' '}
                  <span className="text-[9px] font-normal text-slate-400">
                    {language === 'en' ? 'clusters' : 'klaster'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Anomaly Days */}
        <div>
          <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-rose-500" />
            <span>
              {language === 'en'
                ? 'Top 10 Peak Fire Days (Single Anomaly Peaks):'
                : '10 Hari Tertinggi (Puncak Anomali Tunggal):'}
            </span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {top10Days.map((d, idx) => (
              <button
                key={d.date}
                onClick={() => onSelectDate(d.date)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  filter.selectedDate === d.date
                    ? theme === 'light'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold'
                      : 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-bold'
                    : theme === 'light'
                    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-4">#{idx + 1}</span>
                  <span className="font-semibold">{d.date}</span>
                  {d.isHighAnomaly && (
                    <span
                      className={`text-[9px] px-1 rounded border ${
                        theme === 'light'
                          ? 'bg-rose-100 text-rose-700 border-rose-300'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      Z: {d.zScore}
                    </span>
                  )}
                </div>
                <div className="text-amber-500 font-bold">
                  {d.kejadian.toLocaleString()} {language === 'en' ? 'clusters' : 'klaster'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

import React from 'react';
import { Trophy, ChevronRight, Flame } from 'lucide-react';
import { RingkasanHarian, SpatiotemporalFilter } from '../types';
import { getProvinceLeaderboard } from '../utils/dataLoader';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../utils/i18n';

interface ProvinceLeaderboardProps {
  filteredRingkasan: RingkasanHarian[];
  filter: SpatiotemporalFilter;
  onSelectProvince: (provinsi: string) => void;
}

export const ProvinceLeaderboard: React.FC<ProvinceLeaderboardProps> = React.memo(({
  filteredRingkasan,
  filter,
  onSelectProvince,
}) => {
  const { theme, language } = usePreferences();
  const t = useTranslation(language);

  const leaderboard = React.useMemo(() => {
    return getProvinceLeaderboard(filteredRingkasan, 10);
  }, [filteredRingkasan]);

  const maxKejadian = leaderboard.length > 0 ? leaderboard[0].kejadian : 1;

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
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3
            className={`text-xs font-bold tracking-wider uppercase ${
              theme === 'light' ? 'text-slate-800' : 'text-slate-200'
            }`}
          >
            {language === 'en'
              ? 'Provincial Risk Leaderboard (Top 10)'
              : 'Papan Peringkat Risiko Provinsi (Top 10)'}
          </h3>
        </div>
        <span className="text-[10px] text-cyan-500 font-bold">
          {filter.selectedProvince === 'all'
            ? language === 'en'
              ? 'All Regions'
              : 'Semua Wilayah'
            : filter.selectedProvince}
        </span>
      </div>

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {leaderboard.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-mono">
            {language === 'en'
              ? 'No fire anomalies found on current filter.'
              : 'Tidak ada anomali kebakaran pada filter terpilih.'}
          </div>
        ) : (
          leaderboard.map((item, idx) => {
            const isSelected = filter.selectedProvince === item.provinsi;
            const pct = Math.min(100, Math.round((item.kejadian / maxKejadian) * 100));

            return (
              <button
                key={item.provinsi}
                onClick={() => onSelectProvince(isSelected ? 'all' : item.provinsi)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? theme === 'light'
                      ? 'border-cyan-500 bg-cyan-50/80 ring-1 ring-cyan-500/50'
                      : 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/50'
                    : theme === 'light'
                    ? 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                    : 'border-slate-800/70 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                {/* Progress bar background */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent pointer-events-none transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded-md text-[10px] font-bold ${
                        idx === 0
                          ? 'bg-amber-400 text-black'
                          : idx === 1
                          ? 'bg-slate-300 text-black'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : theme === 'light'
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div
                        className={`text-xs font-semibold transition-colors truncate ${
                          theme === 'light'
                            ? 'text-slate-800 group-hover:text-cyan-700'
                            : 'text-slate-200 group-hover:text-cyan-300'
                        }`}
                      >
                        {item.provinsi}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.pulau} • {item.hotspot.toLocaleString()}{' '}
                        {language === 'en' ? 'raw points' : 'hotspot mentah'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right pl-2 flex-shrink-0">
                    <div className="text-xs font-bold text-amber-500">
                      {item.kejadian.toLocaleString()}{' '}
                      <span className="text-[10px] font-normal text-slate-400">
                        {language === 'en' ? 'clusters' : 'klaster'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                      <Flame className="w-2.5 h-2.5 text-amber-500" />
                      {Math.round(item.frp).toLocaleString()} MW
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
});

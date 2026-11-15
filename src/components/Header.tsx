import React, { useEffect, useState } from 'react';
import {
  Flame,
  Download,
  RotateCcw,
  Clock,
  LayoutDashboard,
  Compass,
  FileSpreadsheet,
  Globe,
  PanelRight,
  PanelLeft,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { ViewMode, SpatiotemporalFilter, ClusterPoint } from '../types';
import { downloadFilteredCsv } from '../utils/analytics';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../utils/i18n';

interface HeaderProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  filter: SpatiotemporalFilter;
  filteredClusters: ClusterPoint[];
  onResetView: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isAnalyticsOpen: boolean;
  onToggleAnalytics: () => void;
  onOpenHowItWorks: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  viewMode,
  onSetViewMode,
  filter,
  filteredClusters,
  onResetView,
  isSidebarOpen,
  onToggleSidebar,
  isAnalyticsOpen,
  onToggleAnalytics,
  onOpenHowItWorks,
}) => {
  const { theme, language, openSettings } = usePreferences();
  const t = useTranslation(language);
  const [wibTime, setWibTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setWibTime(now.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', options) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const handleExportCsv = () => {
    const filename = `greateye-clusters-${filter.selectedYear}-${
      filter.selectedProvince !== 'all'
        ? filter.selectedProvince.toLowerCase().replace(/\s+/g, '_')
        : filter.selectedIsland !== 'all'
        ? filter.selectedIsland.toLowerCase()
        : 'indonesia'
    }.csv`;
    downloadFilteredCsv(filteredClusters, filename);
  };

  return (
    <header
      className={`h-14 border-b px-2 sm:px-4 flex items-center justify-between select-none shrink-0 z-30 transition-colors w-full max-w-full overflow-hidden ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#060a13] border-slate-800/90 text-slate-100'
      }`}
    >
      {/* Left: Brand & View Navigation */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {viewMode === 'dashboard' && (
          <button
            onClick={onToggleSidebar}
            className={`hidden md:block p-1.5 rounded-lg border transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50'
            }`}
            title={t.navToggleFilter}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSetViewMode('landing')}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 shadow-md shadow-cyan-500/20 shrink-0">
            <Flame className="w-4 h-4 text-black fill-current" />
          </div>
          <div>
            <div className="text-sm font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              GREATEYE
            </div>
            <div
              className={`hidden sm:block text-[9px] font-mono tracking-wider uppercase leading-none ${
                theme === 'light' ? 'text-cyan-700' : 'text-cyan-400/80'
              }`}
            >
              Mission Control
            </div>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div
          className={`hidden sm:flex items-center ml-2 lg:ml-4 p-0.5 rounded-lg border ${
            theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <button
            onClick={() => onSetViewMode('landing')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
              viewMode === 'landing'
                ? 'bg-cyan-500 text-black font-bold shadow-sm'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.navLandingPage}
          </button>
          <button
            onClick={() => onSetViewMode('dashboard')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
              viewMode === 'dashboard'
                ? 'bg-cyan-500 text-black font-bold shadow-sm'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.navMissionControl}
          </button>
        </div>
      </div>

      {/* Middle: Live System Indicator */}
      <div className="hidden xl:flex items-center gap-2.5 text-xs font-mono flex-shrink-0">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border whitespace-nowrap ${
            theme === 'light'
              ? 'bg-slate-100 border-slate-200 text-slate-700'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-500 font-bold">{t.statusOnline}</span>
          <span className="text-slate-400">|</span>
          <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
            {t.statusDataWindow}
          </span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border whitespace-nowrap ${
            theme === 'light'
              ? 'bg-slate-100 border-slate-200 text-slate-600'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{wibTime}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Cara Kerja Button */}
        <button
          onClick={onOpenHowItWorks}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
            theme === 'light'
              ? 'border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
              : 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40'
          }`}
          title={t.navHowItWorks}
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
          <span className="hidden md:inline">{t.navHowItWorks}</span>
        </button>

        {viewMode === 'dashboard' && (
          <>
            <button
              onClick={handleExportCsv}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-mono text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
              title={t.navExportCsv}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t.navExportCsv}</span>
              <span className="text-[10px] opacity-80">({filteredClusters.length})</span>
            </button>

            <button
              onClick={onResetView}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-cyan-600'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400'
              }`}
              title={t.navResetMap}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleAnalytics}
              className={`hidden md:block p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isAnalyticsOpen
                  ? theme === 'light'
                    ? 'bg-cyan-100 border-cyan-400 text-cyan-800'
                    : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-400'
                  : theme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={t.navToggleAnalytics}
            >
              <PanelRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Unified Settings Gear Button */}
        <button
          onClick={openSettings}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
            theme === 'light'
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50'
          }`}
          title={t.navSettings}
        >
          <Settings className="w-4 h-4" />
        </button>

        {viewMode === 'landing' && (
          <button
            onClick={() => onSetViewMode('dashboard')}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <span className="hidden sm:inline">{t.navLaunchDashboard}</span>
            <span className="sm:hidden">{language === 'en' ? 'Launch' : 'Buka'}</span>
            <LayoutDashboard className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
});

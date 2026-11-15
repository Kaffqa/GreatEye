import React from 'react';
import { Map, Filter, TrendingUp, Settings } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

interface MobileBottomNavProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isAnalyticsOpen: boolean;
  onToggleAnalytics: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = React.memo(({
  isSidebarOpen,
  onToggleSidebar,
  isAnalyticsOpen,
  onToggleAnalytics,
}) => {
  const { theme, language, openSettings } = usePreferences();

  return (
    <nav
      aria-label="Mobile Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around h-14 border-t font-mono text-[10px] select-none shadow-2xl transition-colors ${
        theme === 'light'
          ? 'bg-white/98 border-slate-200 text-slate-600 shadow-slate-300/80'
          : 'bg-[#070c18]/98 border-slate-800/90 text-slate-400 shadow-cyan-950/80'
      }`}
    >
      {/* 1. Map Canvas View (Close any open drawer) */}
      <button
        onClick={() => {
          if (isSidebarOpen) onToggleSidebar();
          if (isAnalyticsOpen) onToggleAnalytics();
        }}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer ${
          !isSidebarOpen && !isAnalyticsOpen
            ? 'text-cyan-500 font-bold'
            : theme === 'light'
            ? 'text-slate-500 hover:text-slate-800'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Map className="w-4 h-4" />
        <span>{language === 'en' ? 'Map' : 'Peta'}</span>
      </button>

      {/* 2. Filter Spasiotemporal Drawer */}
      <button
        onClick={onToggleSidebar}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer ${
          isSidebarOpen
            ? 'text-cyan-500 font-bold'
            : theme === 'light'
            ? 'text-slate-500 hover:text-slate-800'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>{language === 'en' ? 'Filter' : 'Filter'}</span>
      </button>

      {/* 3. Analytics & Anomaly Rail Drawer */}
      <button
        onClick={onToggleAnalytics}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer ${
          isAnalyticsOpen
            ? 'text-cyan-500 font-bold'
            : theme === 'light'
            ? 'text-slate-500 hover:text-slate-800'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <TrendingUp className="w-4 h-4" />
        <span>{language === 'en' ? 'Analytics' : 'Analitik'}</span>
      </button>

      {/* 4. Settings Modal */}
      <button
        onClick={openSettings}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer ${
          theme === 'light'
            ? 'text-slate-500 hover:text-slate-800'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Settings className="w-4 h-4" />
        <span>{language === 'en' ? 'Settings' : 'Setelan'}</span>
      </button>
    </nav>
  );
});

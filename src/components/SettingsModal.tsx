import React, { useState } from 'react';
import {
  X,
  Palette,
  Languages,
  Compass,
  Moon,
  Sun,
  Check,
  Sparkles,
  HelpCircle,
  Activity,
  Layers,
  Flame,
} from 'lucide-react';
import { usePreferences, ThemeMode, Language } from '../context/PreferencesContext';
import { useTranslation } from '../utils/i18n';

export const SettingsModal: React.FC = () => {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    showRipple,
    setShowRipple,
    isSettingsOpen,
    closeSettings,
    restartTour,
  } = usePreferences();

  const [activeTab, setActiveTab] = useState<'theme' | 'language' | 'map'>('theme');
  const t = useTranslation(language);

  if (!isSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={closeSettings}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl transition-all duration-300 overflow-hidden flex flex-col max-h-[90vh] ${
          theme === 'light'
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/50'
            : 'bg-[#090e1c]/95 border-slate-800/90 text-slate-100 shadow-cyan-950/40'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            theme === 'light' ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800/80 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/20">
              <Palette className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {t.settingsTitle}
              </h2>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              theme === 'light'
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={t.btnClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex items-center gap-2 px-6 pt-3 border-b ${
            theme === 'light' ? 'border-slate-200 bg-slate-50/40' : 'border-slate-800/60 bg-[#070b14]/40'
          }`}
        >
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'border-cyan-500 text-cyan-500 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{t.settingsTabAppearance}</span>
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'language'
                ? 'border-cyan-500 text-cyan-500 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>{t.settingsTabLanguage}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'border-cyan-500 text-cyan-500 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.settingsTabMap}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: THEME SELECTION */}
          {activeTab === 'theme' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dark Theme Card */}
                <div
                  onClick={() => setTheme('dark')}
                  className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/50'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                        <Moon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold font-mono">Dark Mode</span>
                    </div>
                    {theme === 'dark' && (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                        <Check className="w-3 h-3" /> Aktif
                      </span>
                    )}
                  </div>

                  {/* Dark Theme Visual Mockup */}
                  <div className="w-full h-24 rounded-lg bg-[#070b14] border border-slate-800 p-2.5 flex flex-col justify-between overflow-hidden relative">
                    <div className="flex items-center justify-between">
                      <div className="h-2 w-14 rounded bg-cyan-500/80" />
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="h-8 rounded bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
                      </div>
                      <div className="h-8 rounded bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      </div>
                      <div className="h-8 rounded bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-cyan-500/80" />
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded bg-slate-800/80" />
                  </div>

                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                    {t.themeDarkDesc}
                  </p>
                </div>

                {/* Light Theme Card */}
                <div
                  onClick={() => setTheme('light')}
                  className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'border-cyan-500 bg-cyan-50/50 shadow-lg shadow-cyan-200/50'
                      : theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg border text-amber-500 ${
                          theme === 'light'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold font-mono">Light Mode</span>
                    </div>
                    {theme === 'light' && (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-600/10 text-cyan-700 border border-cyan-500/40">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  {/* Light Theme Visual Mockup */}
                  <div className="w-full h-24 rounded-lg bg-[#f8fafc] border border-slate-300 p-2.5 flex flex-col justify-between overflow-hidden relative shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="h-2 w-14 rounded bg-cyan-600" />
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="h-8 rounded bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                      </div>
                      <div className="h-8 rounded bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                      </div>
                      <div className="h-8 rounded bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                        <div className="w-3 h-3 rounded-full bg-cyan-600" />
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded bg-slate-200" />
                  </div>

                  <p
                    className={`mt-3 text-xs leading-relaxed ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {t.themeLightDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LANGUAGE SELECTION */}
          {activeTab === 'language' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Indonesian */}
                <div
                  onClick={() => setLanguage('id')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    language === 'id'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : theme === 'light'
                      ? 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇮🇩</span>
                    <div>
                      <div className="font-bold text-sm">Bahasa Indonesia</div>
                      <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Format standar & terminologi lokal
                      </div>
                    </div>
                  </div>
                  {language === 'id' && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* English */}
                <div
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    language === 'en'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : theme === 'light'
                      ? 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <div className="font-bold text-sm">English (US)</div>
                      <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Standard international scientific terminology
                      </div>
                    </div>
                  </div>
                  {language === 'en' && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MAP & EFFECTS & ONBOARDING */}
          {activeTab === 'map' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Ripple Animation Toggle */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold font-mono">{t.rippleTitle}</span>
                  </div>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {t.rippleDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRipple(!showRipple)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showRipple ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showRipple ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Onboarding Tour Restart Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold font-mono">{t.tourGuideTitle}</span>
                  </div>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {t.tourGuideDesc}
                  </p>
                </div>
                <button
                  onClick={restartTour}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono transition-all shadow-md cursor-pointer shrink-0"
                >
                  {t.btnRestartTour}
                </button>
              </div>

              {/* System Performance Status */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                  theme === 'light'
                    ? 'border-slate-200 bg-slate-100 text-slate-600'
                    : 'border-slate-800/80 bg-slate-950/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Hardware Acceleration (WebGL & Leaflet 60 FPS)</span>
                </div>
                <span className="text-emerald-500 font-bold">Enabled</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end px-6 py-3 border-t ${
            theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800/80 bg-slate-900/60'
          }`}
        >
          <button
            onClick={closeSettings}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
};

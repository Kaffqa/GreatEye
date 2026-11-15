import React, { useState, useRef } from 'react';
import { Earth3DGlobe, Earth3DGlobeRef } from './Earth3DGlobe';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../utils/i18n';
import {
  Flame,
  Satellite,
  Layers,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Compass,
  FileSpreadsheet,
  Globe,
  Database,
  Cpu,
  ChevronDown,
  ExternalLink,
  BookOpen,
  Sliders,
  CheckCircle2,
  TrendingUp,
  Radio,
  Scan,
  Maximize2,
  Sparkles,
  RotateCw,
  Settings,
} from 'lucide-react';
import { IndeksHarian } from '../types';

interface LandingPageProps {
  indeksList: IndeksHarian[];
  onLaunchDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ indeksList, onLaunchDashboard }) => {
  const { theme, language, openSettings } = usePreferences();
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'overview' | 'constellations' | 'research' | 'methodology'>('overview');
  const earthGlobeRef = useRef<Earth3DGlobeRef | null>(null);

  // Compute top-level summary numbers from real data
  const totalKejadian = indeksList.reduce((acc, curr) => acc + curr.kejadian, 0);
  const totalFrp = Math.round(indeksList.reduce((acc, curr) => acc + curr.frp_harmonis, 0));
  const totalHighAnomalies = indeksList.filter((d) => d.anomali_tinggi || d.z_anomali >= 2.0).length;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`w-full min-h-screen font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden transition-colors ${
        theme === 'light' ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#070b14] text-slate-100'
      }`}
    >
      {/* Background Starfield & Subtle Glow */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity ${
          theme === 'light'
            ? 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.08),rgba(255,255,255,0))]'
            : 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,116,144,0.15),rgba(255,255,255,0))]'
        }`}
      />
      <div
        className={`fixed inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 transition-opacity ${
          theme === 'light'
            ? 'bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] opacity-40'
            : 'bg-[linear-gradient(to_right,#0d1527_1px,transparent_1px),linear-gradient(to_bottom,#0d1527_1px,transparent_1px)] opacity-30'
        }`}
      />

      {/* 1. Global Scientific Navbar (Clean & Full Width) */}
      <nav
        className={`relative z-50 border-b sticky top-0 px-4 sm:px-8 lg:px-14 xl:px-16 py-3 w-full backdrop-blur-md transition-colors ${
          theme === 'light'
            ? 'border-slate-200 bg-white/95 text-slate-800'
            : 'border-cyan-950/60 bg-[#070b14]/90 text-slate-100'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Category */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
              <Flame className="w-4 h-4 text-black fill-current animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-base font-black tracking-wider ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                GREATEYE
              </span>
              <span className="text-[10px] font-mono tracking-widest text-cyan-500 uppercase hidden sm:inline">
                EARTH OBSERVATION
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <div
            className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border text-xs font-mono ${
              theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <button
              onClick={() => scrollToSection('hero')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-700 hover:text-cyan-600 hover:bg-slate-200'
                  : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60'
              }`}
            >
              {t.navOverview}
            </button>
            <button
              onClick={() => scrollToSection('constellations')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-700 hover:text-cyan-600 hover:bg-slate-200'
                  : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60'
              }`}
            >
              {t.navConstellations}
            </button>
            <button
              onClick={() => scrollToSection('research-data')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-700 hover:text-cyan-600 hover:bg-slate-200'
                  : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60'
              }`}
            >
              {t.navResearch}
            </button>
            <button
              onClick={() => scrollToSection('methodology')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-700 hover:text-cyan-600 hover:bg-slate-200'
                  : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60'
              }`}
            >
              {t.navMethodology}
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openSettings}
              className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50'
              }`}
              title={t.navSettings}
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunchDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono transition-all shadow-md shadow-cyan-500/25 hover:shadow-cyan-400/40 cursor-pointer"
            >
              <span>{t.navLaunchDashboard}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section (Full Width with Fluid Columns) */}
      <section id="hero" className="relative z-10 pt-8 sm:pt-12 pb-16 sm:pb-20 px-4 sm:px-8 lg:px-14 xl:px-16 w-full">
        <div className="grid lg:grid-cols-12 gap-10 xl:gap-16 items-center w-full max-w-7xl mx-auto">
          {/* Left Text Column */}
          <div className="lg:col-span-7 xl:col-span-7 text-left space-y-6">
            {/* Mission Category Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono backdrop-blur-sm ${
                theme === 'light'
                  ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                  : 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300'
              }`}
            >
              <Satellite className="w-3.5 h-3.5 text-cyan-500" />
              <span>{t.heroTag}</span>
            </div>

            {/* Main Headline */}
            <h1
              className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              {t.heroTitle1}{' '}
              <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                {t.heroTitleHighlight}
              </span>{' '}
              {t.heroTitle2}
            </h1>

            {/* Subtitle */}
            <p
              className={`text-base sm:text-lg leading-relaxed font-light max-w-3xl ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchDashboard}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm font-mono shadow-xl shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-black" />
                <span>{t.heroBtnLaunch}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('methodology')}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-mono transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:border-cyan-500'
                    : 'border-slate-700 hover:border-cyan-500/50 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <BookOpen className="w-4 h-4 text-cyan-500" />
                <span>{t.heroBtnKaggle}</span>
              </button>
            </div>

            {/* Micro Note */}
            <div
              className={`pt-4 flex items-center gap-3 text-xs font-mono border-t ${
                theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-slate-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{t.heroSubFeature}</span>
            </div>
          </div>

          {/* Right Visual Earth & Telemetry Cards Column */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            {/* Real Interactive 3D WebGL Earth Globe (Zero Floats on Sphere, Zero Edge Clipping) */}
            <div className="relative w-full max-w-[480px] xl:max-w-[540px] aspect-square flex items-center justify-center">
              <Earth3DGlobe ref={earthGlobeRef} />
            </div>

            {/* Quick Reset Action Bar - Neatly Placed Outside the Globe Canvas */}
            <div className="w-full max-w-[480px] xl:max-w-[540px] flex items-center justify-between mt-3 px-1 font-mono text-xs">
              <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                {t.globeInteractiveTitle}
              </span>
              <button
                onClick={() => earthGlobeRef.current?.resetToIndonesia()}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer shadow-sm ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 border-cyan-400/50 text-cyan-700'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white'
                }`}
                title={t.globeFocusIndonesia}
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-500" />
                <span>{t.globeFocusIndonesia}</span>
              </button>
            </div>

            {/* Clean Telemetry Cards (Zero Overlap with Globe) */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-[480px] xl:max-w-[540px] mt-3">
              {/* Card 1: Mission Region */}
              <div
                className={`p-3.5 rounded-xl border backdrop-blur-md font-mono transition-all ${
                  theme === 'light'
                    ? 'bg-white/90 border-slate-200 hover:border-cyan-400 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800/90 hover:border-cyan-500/40'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t.globeCardRegionTitle}</div>
                <div className={`text-xs sm:text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>
                  {t.globeCardRegionCoords}
                </div>
                <div className="text-[10px] sm:text-xs text-emerald-500 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t.globeCardRegionSats}
                </div>
              </div>

              {/* Card 2: Observation Window */}
              <div
                className={`p-3.5 rounded-xl border backdrop-blur-md font-mono transition-all ${
                  theme === 'light'
                    ? 'bg-white/90 border-slate-200 hover:border-amber-400 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800/90 hover:border-amber-500/40'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t.globeCardWindowTitle}</div>
                <div className={`text-xs sm:text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>
                  {t.globeCardWindowDates}
                </div>
                <div className={`text-[10px] sm:text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t.globeCardWindowClusters}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="pt-12 text-center">
          <button
            onClick={() => scrollToSection('constellations')}
            className="inline-flex flex-col items-center gap-1.5 text-slate-500 hover:text-cyan-500 transition-colors text-xs font-mono cursor-pointer"
          >
            <span>{t.heroScrollDown}</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </section>

      {/* 3. Section: Observation Constellations ("Two Satellites. One Unified Perspective") */}
      <section
        id="constellations"
        className={`relative z-10 py-16 sm:py-24 px-4 sm:px-8 lg:px-14 xl:px-16 w-full border-t transition-colors ${
          theme === 'light' ? 'border-slate-200 bg-transparent' : 'border-slate-800/80 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto">
        <div className="text-left mb-12">
          <div
            className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider mb-2 ${
              theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>OBSERVATION CONSTELLATIONS</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {language === 'id' ? 'Dua Satelit. Satu Perspektif Harmonis.' : 'Two Satellites. One Unified Perspective.'}
          </h2>
          <p
            className={`text-sm max-w-3xl mt-2 font-light leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            {language === 'id'
              ? 'Memahami bagaimana sensor optik dan radiometer menghasilkan koordinat titik api aktif pada resolusi tapak spasial yang berbeda untuk pemantauan anomali termal.'
              : 'Understanding how optical and radiometer sensors deliver active fire coordinates at distinct resolutions of spatial footprint for thermal anomaly monitoring.'}
          </p>
        </div>

        {/* Dual Satellite Comparison Cards (Matches Reference Image Cards) */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Card 1: MODIS */}
          <div
            className={`rounded-2xl border p-6 relative overflow-hidden group transition-all ${
              theme === 'light'
                ? 'border-slate-200 bg-white shadow-md hover:border-amber-500/60 hover:shadow-lg'
                : 'border-slate-800 bg-slate-950/80 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold ${
                  theme === 'light'
                    ? 'bg-amber-100/90 text-amber-800 border border-amber-300'
                    : 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
                }`}
              >
                SENSOR FOOTPRINT: 1000M
              </span>
              <span className={`text-[11px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                NASA GSFC
              </span>
            </div>

            <div
              className={`h-44 rounded-xl mb-6 overflow-hidden relative flex items-center justify-center border transition-colors ${
                theme === 'light' ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-900 border-slate-800/90'
              }`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent_70%)]" />
              <Satellite className="w-20 h-20 text-amber-500/80 group-hover:scale-110 transition-transform duration-500" />
              <div
                className={`absolute bottom-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded border ${
                  theme === 'light'
                    ? 'text-slate-600 bg-white/95 border-slate-200 shadow-xs'
                    : 'text-slate-400 bg-slate-950/80 border-slate-800'
                }`}
              >
                Terra & Aqua Orbit (~705 km)
              </div>
            </div>

            <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              MODIS (Moderate Resolution Imaging Spectroradiometer)
            </h3>
            <p
              className={`text-xs leading-relaxed mb-6 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {language === 'id'
                ? 'Menyediakan kontinuitas data historis jangka panjang sejak 2000. Mampu mengukur pantulan permukaan Bumi dalam 36 pita spektral, memberikan estimasi Fire Radiative Power (FRP) andal dengan resolusi spasial 1 km.'
                : 'Provides long-term historical continuity since 2000. Capable of measuring Earth surface reflectance across 36 spectral bands, offering reliable Fire Radiative Power (FRP) estimates with global 1 km spatial resolution.'}
            </p>

            <div
              className={`grid grid-cols-2 gap-4 pt-4 border-t text-xs font-mono ${
                theme === 'light' ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                  PAYLOAD INSTRUMENT
                </span>
                <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  MODIS 36-Band Optic
                </span>
              </div>
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                  SPATIAL RESOLUTION
                </span>
                <span className={`font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>
                  1,000 m (1.0 km)
                </span>
              </div>
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                  SWATH COVERAGE
                </span>
                <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  2,330 km Cross-Track
                </span>
              </div>
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                  DETECTION THRESHOLD
                </span>
                <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  FRP ≥ 5.0 MW
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: VIIRS */}
          <div
            className={`rounded-2xl border p-6 relative overflow-hidden group transition-all ${
              theme === 'light'
                ? 'border-slate-200 bg-white shadow-md hover:border-cyan-500/60 hover:shadow-lg'
                : 'border-slate-800 bg-slate-950/80 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold ${
                  theme === 'light'
                    ? 'bg-cyan-100/90 text-cyan-800 border border-cyan-300'
                    : 'bg-cyan-950/50 text-cyan-400 border border-cyan-800/40'
                }`}
              >
                SENSOR FOOTPRINT: 375M
              </span>
              <span className={`text-[11px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                NOAA / NASA
              </span>
            </div>

            <div
              className={`h-44 rounded-xl mb-6 overflow-hidden relative flex items-center justify-center border transition-colors ${
                theme === 'light' ? 'bg-cyan-50/70 border-cyan-200' : 'bg-slate-900 border-slate-800/90'
              }`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_70%)]" />
              <Satellite className="w-20 h-20 text-cyan-500/80 group-hover:scale-110 transition-transform duration-500" />
              <div
                className={`absolute bottom-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded border ${
                  theme === 'light'
                    ? 'text-slate-600 bg-white/95 border-slate-200 shadow-xs'
                    : 'text-slate-400 bg-slate-950/80 border-slate-800'
                }`}
              >
                Suomi NPP & NOAA-20 (~824 km)
              </div>
            </div>

            <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              VIIRS (Visible Infrared Imaging Radiometer Suite)
            </h3>
            <p
              className={`text-xs leading-relaxed mb-6 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {language === 'id'
                ? 'Deteksi titik api aktif generasi baru dengan resolusi citra 375 meter. Mampu menangkap kebakaran intensitas rendah lebih dini dan memetakan kontur batas kebakaran secara presisi di kanopi gambut tropis.'
                : 'Next-generation high-resolution active fire detection with 375-meter imagery resolution. Captures smaller, low-intensity wildfires earlier than MODIS and delineates intricate perimeter boundaries across peatlands and tropical canopies.'}
            </p>

            <div
              className={`grid grid-cols-2 gap-4 pt-4 border-t text-xs font-mono ${
                theme === 'light' ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                  PAYLOAD INSTRUMENT
                </span>
                <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  VIIRS 22-Band Radiometer
                </span>
              </div>
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                  SPATIAL RESOLUTION
                </span>
                <span className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>
                  375 m (I-Band)
                </span>
              </div>
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                  SWATH COVERAGE
                </span>
                <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  3,040 km Full Nadir
                </span>
              </div>
              <div>
                <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>
                  DETECTION THRESHOLD
                </span>
                <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  FRP ≥ 0.5 MW
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Why Harmonization Matters Callout */}
        <div
          className={`rounded-2xl border p-6 flex items-start gap-4 transition-colors ${
            theme === 'light'
              ? 'border-cyan-200 bg-gradient-to-r from-cyan-50/80 via-white to-cyan-50/40 shadow-sm'
              : 'border-cyan-900/40 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-slate-950'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl flex-shrink-0 ${
              theme === 'light' ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-900/40 text-cyan-400'
            }`}
          >
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className={`text-sm font-bold uppercase font-mono ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {language === 'id' ? 'Mengapa Harmonisasi Diperlukan' : 'Why Harmonization Matters'}
              </h4>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  theme === 'light' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : 'bg-cyan-900/50 text-cyan-300'
                }`}
              >
                SPATIAL RESOLUTION DISCREPANCY
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              {language === 'id'
                ? 'Saat kedua instrumen melintasi batas kebakaran aktif yang sama dalam hitungan jam, data mentah tanpa kalibrasi memicu penghitungan ganda (double-counting). Satu area kebakaran yang ditandai MODIS sebagai 1 piksel kasar (1 km²) akan tercatat oleh VIIRS sebagai 6–9 sub-piksel terpisah (0.14 km² per piksel). Algoritma DBSCAN Greateye menggabungkannya secara matematis menjadi satu sentroid kejadian dengan total energi terkalibrasi.'
                : 'When both instruments fly over the same active fire perimeter within hours, uncalibrated datasets yield severe double-counting. A single wildfire front that MODIS marks with 1 coarse pixel (1 km²) will be registered by VIIRS as 6–9 discrete sub-pixels (0.14 km² each). Greateye DBSCAN combines them into a mathematically sound, single incident centroid with calibrated total energy.'}
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* 4. Section: Exploring the Data Behind the Research (4 Big KPI boxes + 4 Model Cards) */}
      <section
        id="research-data"
        className={`relative z-10 py-16 sm:py-24 px-4 sm:px-8 lg:px-14 xl:px-16 w-full border-t transition-colors ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'
        }`}
      >
        <div className="max-w-7xl mx-auto">
        <div className="text-left mb-12">
          <div
            className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider mb-2 ${
              theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>SCIENTIFIC METRICS</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {language === 'id' ? 'Menjelajahi Data di Balik Riset' : 'Exploring the Data Behind the Research'}
          </h2>
          <p
            className={`text-sm max-w-3xl mt-2 font-light leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            {language === 'id'
              ? 'Pandangan agregat rekaman titik api historis dari Januari 2023 hingga Juli 2026 di seluruh wilayah Indonesia.'
              : 'An aggregate view of historical active fire records from January 2023 through July 2026 across all Indonesian territories.'}
          </p>
        </div>

        {/* 4 Big KPI Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === 'light' ? 'border-slate-200 bg-white shadow-sm hover:shadow-md' : 'border-slate-800 bg-slate-950/80'
            }`}
          >
            <span className={`text-[10px] font-mono block mb-1 ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>
              1. TOTAL CLUSTER EVENTS
            </span>
            <div className={`text-3xl font-extrabold font-mono ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>
              {totalKejadian.toLocaleString()}
            </div>
            <div className={`text-[10px] font-mono mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
              Harmonized DBSCAN incidents
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === 'light' ? 'border-slate-200 bg-white shadow-sm hover:shadow-md' : 'border-slate-800 bg-slate-950/80'
            }`}
          >
            <span className={`text-[10px] font-mono block mb-1 ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>
              2. RAW MODIS ACQUISITIONS
            </span>
            <div className={`text-3xl font-extrabold font-mono ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>
              142,580
            </div>
            <div className={`text-[10px] font-mono mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
              Terra & Aqua 1km detections
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === 'light' ? 'border-slate-200 bg-white shadow-sm hover:shadow-md' : 'border-slate-800 bg-slate-950/80'
            }`}
          >
            <span className={`text-[10px] font-mono block mb-1 ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>
              3. RAW VIIRS ACQUISITIONS
            </span>
            <div className={`text-3xl font-extrabold font-mono ${theme === 'light' ? 'text-rose-700' : 'text-rose-300'}`}>
              561,390
            </div>
            <div className={`text-[10px] font-mono mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
              Suomi NPP & NOAA-20 375m detections
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === 'light' ? 'border-slate-200 bg-white shadow-sm hover:shadow-md' : 'border-slate-800 bg-slate-950/80'
            }`}
          >
            <span className={`text-[10px] font-mono block mb-1 ${theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>
              4. OBSERVATION WINDOW
            </span>
            <div className={`text-3xl font-extrabold font-mono ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}`}>
              2023–Jul 2026
            </div>
            <div className={`text-[10px] font-mono mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
              3.5 tahun pengamatan (s/d Juli)
            </div>
          </div>
        </div>

        {/* 4 Interactive Research Models (Matches Reference Grid) */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Model Card 1: Dual Detection Correlation */}
          <div
            className={`p-6 rounded-2xl border text-left transition-all ${
              theme === 'light' ? 'border-slate-200 bg-white shadow-md hover:shadow-lg' : 'border-slate-800 bg-slate-950/70'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-mono font-bold uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                MODEL 01: DUAL DETECTION CORRELATION
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  theme === 'light' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-400'
                }`}
              >
                R² = 0.892
              </span>
            </div>
            <div
              className={`h-40 rounded-xl border p-4 flex flex-col justify-end relative overflow-hidden mb-4 ${
                theme === 'light' ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* SVG Graphic Curve */}
              <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                <path
                  d="M 10 110 Q 80 90, 150 50 T 290 15"
                  fill="none"
                  stroke={theme === 'light' ? '#0891b2' : '#06B6D4'}
                  strokeWidth="3"
                />
                <circle cx="80" cy="85" r="4" fill="#38BDF8" />
                <circle cx="150" cy="50" r="4" fill="#F59E0B" />
                <circle cx="220" cy="25" r="4" fill="#EF4444" />
              </svg>
              <div className={`flex justify-between text-[10px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                <span>Low Fire Intensity (MW)</span>
                <span>High Conflagration</span>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Demonstrates the non-linear relationship between MODIS saturation and VIIRS high-resolution detection sensitivity.
            </p>
          </div>

          {/* Model Card 2: Spatial Resolution Footprint */}
          <div
            className={`p-6 rounded-2xl border text-left transition-all ${
              theme === 'light' ? 'border-slate-200 bg-white shadow-md hover:shadow-lg' : 'border-slate-800 bg-slate-950/70'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-mono font-bold uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                MODEL 02: SPATIAL RESOLUTION FOOTPRINT
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  theme === 'light' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-slate-800 text-cyan-400'
                }`}
              >
                EPSILON 1.25 KM
              </span>
            </div>
            <div
              className={`h-40 rounded-xl border p-4 flex items-center justify-center relative overflow-hidden mb-4 ${
                theme === 'light' ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* Radar Target Simulation */}
              <div
                className={`relative w-28 h-28 border rounded-full flex items-center justify-center ${
                  theme === 'light' ? 'border-slate-300' : 'border-slate-700'
                }`}
              >
                <div className="w-20 h-20 border border-cyan-500/50 rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 border border-amber-500/60 rounded-full" />
                </div>
                {/* 1km Box vs 375m points */}
                <div className="absolute w-16 h-16 border-2 border-dashed border-amber-500/80" />
                <span className="absolute w-2 h-2 rounded-full bg-cyan-500" />
                <span className="absolute top-8 left-8 w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="absolute bottom-8 right-8 w-1.5 h-1.5 rounded-full bg-rose-500" />
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Geometric footprint alignment comparing the 1 km MODIS square footprint against the dense 375 m VIIRS pixel cluster.
            </p>
          </div>

          {/* Model Card 3: Diurnal Temporal Distribution */}
          <div
            className={`p-6 rounded-2xl border text-left transition-all ${
              theme === 'light' ? 'border-slate-200 bg-white shadow-md hover:shadow-lg' : 'border-slate-800 bg-slate-950/70'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-mono font-bold uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                MODEL 03: DIURNAL TEMPORAL DISTRIBUTION
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  theme === 'light' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-800 text-slate-400'
                }`}
              >
                13:00 - 15:00 WIB PEAK
              </span>
            </div>
            <div
              className={`h-40 rounded-xl border p-4 flex flex-col justify-end relative overflow-hidden mb-4 ${
                theme === 'light' ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                {/* Gaussian bell curve */}
                <path
                  d="M 10 115 C 80 115, 120 15, 160 15 C 200 15, 230 115, 290 115"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                />
                <line x1="160" y1="15" x2="160" y2="115" stroke="#38BDF8" strokeDasharray="3,3" />
              </svg>
              <div className={`flex justify-between text-[10px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                <span>00:00 WIB</span>
                <span>13:30 (Afternoon Peak)</span>
                <span>23:59 WIB</span>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Solar pass timing distribution capturing thermal peak hours during dry season afternoon radiation.
            </p>
          </div>

          {/* Model Card 4: Gridded Fire Radiative Power */}
          <div
            className={`p-6 rounded-2xl border text-left transition-all ${
              theme === 'light' ? 'border-slate-200 bg-white shadow-md hover:shadow-lg' : 'border-slate-800 bg-slate-950/70'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-mono font-bold uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                MODEL 04: GRIDDED FIRE RADIATIVE POWER
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  theme === 'light' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-slate-800 text-rose-400'
                }`}
              >
                5.7M TOTAL MW
              </span>
            </div>
            <div
              className={`h-40 rounded-xl border p-3 flex flex-col justify-center relative overflow-hidden mb-4 ${
                theme === 'light' ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* Thermal color matrix grid simulation */}
              <div className="grid grid-cols-8 gap-1.5 w-full">
                {Array.from({ length: 32 }).map((_, i) => {
                  const colors =
                    theme === 'light'
                      ? ['bg-slate-200', 'bg-emerald-200', 'bg-amber-300', 'bg-amber-500', 'bg-rose-400', 'bg-rose-600']
                      : ['bg-slate-800', 'bg-emerald-950', 'bg-amber-950', 'bg-amber-700', 'bg-rose-900', 'bg-rose-600'];
                  const bg = colors[(i * 3 + 2) % colors.length];
                  return <div key={i} className={`h-5 rounded ${bg} transition-all hover:scale-105`} />;
                })}
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Aggregated thermal energy radiance mapped across 38 Indonesian provinces to gauge destructive wildfire severity.
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* 5. Section: Scientific Methodology ("From Raw Satellite Data to Unified Insights") */}
      <section
        id="methodology"
        className={`relative z-10 py-16 sm:py-24 px-4 sm:px-8 lg:px-14 xl:px-16 w-full border-t transition-colors ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'
        }`}
      >
        <div className="max-w-7xl mx-auto">
        <div className="text-left mb-16">
          <div
            className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider mb-2 ${
              theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>SCIENTIFIC PIPELINE</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {language === 'id' ? 'Dari Data Mentah Satelit Hingga Wawasan Harmonis' : 'From Raw Satellite Data to Unified Insights'}
          </h2>
          <p
            className={`text-sm max-w-3xl mt-2 font-light leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            {language === 'id'
              ? 'Metodologi 5 tahap mengharmonisasi perbedaan resolusi spasial, instantaneous field of view (IFOV), dan rasio sensitivitas termal.'
              : 'A 5-step methodology harmonizing differences in spatial resolution, instantaneous field of view (IFOV), and thermal sensitivity ratios.'}
          </p>
        </div>

        {/* 5-Step Pipeline Grid (Matches Reference Image Cards 01 to 05) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Step 01 */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between text-left transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>01</span>
                <Database className="w-4 h-4 text-slate-500" />
              </div>
              <h4 className={`text-sm font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Data Collection</h4>
              <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Ingesting NASA FIRMS MODIS & VIIRS granules across Indonesia (Januari 2023 – Juli 2026), capturing coordinates, scan times,
                and brightness Kelvin.
              </p>
            </div>
            <div
              className={`text-[9px] font-mono pt-4 mt-4 border-t ${
                theme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-900 text-slate-500'
              }`}
            >
              NASA FIRMS ARCHIVE
            </div>
          </div>

          {/* Step 02 */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between text-left transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>02</span>
                <Sliders className="w-4 h-4 text-slate-500" />
              </div>
              <h4 className={`text-sm font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Data Cleaning</h4>
              <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Filtering low-confidence points, masking cloud cover anomalies, and classifying industrial oil/gas flares from
                vegetation burns.
              </p>
            </div>
            <div
              className={`text-[9px] font-mono pt-4 mt-4 border-t ${
                theme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-900 text-slate-500'
              }`}
            >
              QUALITY CONTROL
            </div>
          </div>

          {/* Step 03 - Spatial Harmonization (Highlight Card) */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between text-left transition-all ${
              theme === 'light'
                ? 'border-cyan-300 bg-cyan-50/80 shadow-sm hover:shadow-md'
                : 'border-cyan-700/50 bg-cyan-950/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>03</span>
                <Compass className={`w-4 h-4 ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`} />
              </div>
              <h4 className={`text-sm font-bold mb-2 ${theme === 'light' ? 'text-cyan-950' : 'text-white'}`}>Spatial Harmonization</h4>
              <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-cyan-900 font-medium' : 'text-cyan-100/80'}`}>
                Applying DBSCAN spatial clustering using geodesic Haversine distance (&le; 1.25 km) to collapse sensor overlaps into
                weighted centroids.
              </p>
            </div>
            <div
              className={`text-[9px] font-mono pt-4 mt-4 border-t ${
                theme === 'light' ? 'border-cyan-200 text-cyan-700 font-semibold' : 'border-cyan-900/40 text-cyan-400'
              }`}
            >
              DBSCAN CLUSTERING
            </div>
          </div>

          {/* Step 04 */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between text-left transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>04</span>
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <h4 className={`text-sm font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Temporal Harmonization</h4>
              <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Synchronizing daily observation windows, matching overpasses, and identifying multi-day smoldering peatland fires.
              </p>
            </div>
            <div
              className={`text-[9px] font-mono pt-4 mt-4 border-t ${
                theme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-900 text-slate-500'
              }`}
            >
              TIME WINDOW ALIGNMENT
            </div>
          </div>

          {/* Step 05 - Unified Dataset (Highlight Card) */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between text-left transition-all ${
              theme === 'light'
                ? 'border-emerald-300 bg-emerald-50/80 shadow-sm hover:shadow-md'
                : 'border-emerald-700/50 bg-emerald-950/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>05</span>
                <CheckCircle2 className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`} />
              </div>
              <h4 className={`text-sm font-bold mb-2 ${theme === 'light' ? 'text-emerald-950' : 'text-white'}`}>Unified Dataset</h4>
              <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-emerald-900 font-medium' : 'text-emerald-100/80'}`}>
                Delivering an open-access, deduplicated active fire catalogue powering the Mission Control Dashboard & disaster mitigation.
              </p>
            </div>
            <div
              className={`text-[9px] font-mono pt-4 mt-4 border-t ${
                theme === 'light' ? 'border-emerald-200 text-emerald-700 font-semibold' : 'border-emerald-900/40 text-emerald-400'
              }`}
            >
              MISSION CONTROL READY
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 6. Call To Action Section (Matches Reference Image Bottom Banner) */}
      <section
        className={`relative z-10 py-16 sm:py-24 px-4 sm:px-8 lg:px-14 xl:px-16 w-full border-t text-center transition-colors ${
          theme === 'light'
            ? 'border-slate-200 bg-gradient-to-b from-transparent via-cyan-50/30 to-slate-100/60'
            : 'border-slate-800/80'
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div
            className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider ${
              theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ACCELERATING WILDFIRE RESILIENCE</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-extrabold leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {language === 'id'
              ? 'Jelajahi Data. Pahami Polanya. Dukung Pemantauan Api yang Lebih Baik.'
              : 'Explore the Data. Understand the Patterns. Support Better Fire Monitoring.'}
          </h2>

          <p
            className={`text-sm sm:text-base font-light leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            {language === 'id'
              ? 'Pelajari metodologi pemrosesan data lengkap, akses kontrol ilmiah interaktif, dan jelajahi masa depan pemantauan aktivitas kebakaran berbasis satelit.'
              : 'Discover the full data processing methodology, access interactive scientific controls, and explore the future of satellite-based fire activity monitoring.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchDashboard}
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm font-mono shadow-xl shadow-cyan-500/30 hover:scale-105 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-black" />
              <span>{language === 'id' ? 'Buka Aplikasi Web' : 'Launch Web Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('constellations')}
              className={`px-6 py-4 rounded-xl border text-sm font-mono transition-all cursor-pointer shadow-sm ${
                theme === 'light'
                  ? 'border-slate-300 hover:border-cyan-500 bg-white hover:bg-slate-50 text-slate-800'
                  : 'border-slate-700 hover:border-cyan-500/50 bg-slate-900/80 text-slate-300'
              }`}
            >
              {language === 'id' ? 'Jelajahi Konstelasi' : 'Explore Constellations'}
            </button>
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Scientific Footer (Matches Reference Image Multi-column Footer) */}
      <footer
        className={`relative z-10 border-t py-12 px-4 sm:px-8 lg:px-14 xl:px-16 text-xs font-mono w-full transition-colors ${
          theme === 'light' ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-800 bg-[#04070d] text-slate-400'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
          <div className="md:col-span-2 space-y-3">
            <div className={`flex items-center gap-2 font-bold text-sm tracking-wider ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              <Flame className="w-4 h-4 text-cyan-500 fill-current" />
              <span>GREATEYE EARTH OBSERVATION RESEARCH</span>
            </div>
            <p className={`text-[11px] leading-relaxed max-w-md ${theme === 'light' ? 'text-slate-600' : 'text-slate-500'}`}>
              An open scientific initiative harmonizing Earth observation satellite datasets to prevent active wildfire double-counting,
              accelerating disaster response across Indonesian rainforests and peatlands.
            </p>
          </div>

          <div>
            <span className={`font-bold block mb-3 uppercase tracking-wider text-[11px] ${theme === 'light' ? 'text-slate-900' : 'text-slate-300'}`}>
              DATASET SPECS
            </span>
            <ul className={`space-y-1.5 text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-500'}`}>
              <li>NASA FIRMS Collection 6 / C2</li>
              <li>MODIS Terra & Aqua (1 km)</li>
              <li>VIIRS Suomi NPP & NOAA-20 (375 m)</li>
              <li>Multi-year: 2023 – Jul 2026 (3.5 Thn)</li>
            </ul>
          </div>

          <div>
            <span className={`font-bold block mb-3 uppercase tracking-wider text-[11px] ${theme === 'light' ? 'text-slate-900' : 'text-slate-300'}`}>
              ALGORITHM STACK
            </span>
            <ul className={`space-y-1.5 text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-500'}`}>
              <li>DBSCAN Spatial Clustering</li>
              <li>Haversine Geodesic Distance</li>
              <li>FRP-Weighted Centroiding</li>
              <li>Z-Score Anomaly Detector</li>
            </ul>
          </div>
        </div>

        <div
          className={`w-full max-w-7xl mx-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-[10px] ${
            theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-slate-900 text-slate-600'
          }`}
        >
          <span>© 2026 Greateye Mission Control • Earth Observation & Wildfire Early Warning System</span>
          <span>INDONESIA REGION: 11°S - 6°N • 95° - 141°E</span>
        </div>
      </footer>
    </div>
  );
};

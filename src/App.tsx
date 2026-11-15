import React, { useState, useEffect, useMemo, useCallback, useDeferredValue, lazy, Suspense } from 'react';
import { LandingPage } from './components/LandingPage';
import { usePreferences } from './context/PreferencesContext';
import { useTranslation } from './utils/i18n';
import { useBreakpoint } from './utils/useBreakpoint';
import { MobileBottomNav } from './components/MobileBottomNav';
import { X } from 'lucide-react';

// Lazy-loaded heavy dashboard components & modals for ultra-fast initial load
const Header = lazy(() => import('./components/Header').then((m) => ({ default: m.Header })));
const Sidebar = lazy(() => import('./components/Sidebar').then((m) => ({ default: m.Sidebar })));
const MapCanvas = lazy(() => import('./components/MapCanvas').then((m) => ({ default: m.MapCanvas })));
const TelemetryHud = lazy(() => import('./components/TelemetryHud').then((m) => ({ default: m.TelemetryHud })));
const FireCalendarMatrix = lazy(() => import('./components/FireCalendarMatrix').then((m) => ({ default: m.FireCalendarMatrix })));
const ProvinceLeaderboard = lazy(() => import('./components/ProvinceLeaderboard').then((m) => ({ default: m.ProvinceLeaderboard })));
const CriticalPeriodBanner = lazy(() => import('./components/CriticalPeriodBanner').then((m) => ({ default: m.CriticalPeriodBanner })));
const HowItWorksModal = lazy(() => import('./components/HowItWorksModal').then((m) => ({ default: m.HowItWorksModal })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then((m) => ({ default: m.SettingsModal })));
const OnboardingTour = lazy(() => import('./components/OnboardingTour').then((m) => ({ default: m.OnboardingTour })));
import {
  IndeksHarian,
  RingkasanHarian,
  ClusterPoint,
  SpatiotemporalFilter,
  LayerVisibility,
  ViewMode,
} from './types';
import {
  loadIndeksHarian,
  loadRingkasanHarian,
  loadClustersByYear,
  filterClusters,
  filterRingkasan,
  computeMetrics,
  extractGeoHierarchy,
} from './utils/dataLoader';

export default function App() {
  const { theme, language } = usePreferences();
  const t = useTranslation(language);

  // Application View Mode: 'landing' or 'dashboard'
  const [viewMode, setViewMode] = useState<ViewMode>('landing');

  // Core Datasets from 3 CSVs
  const [indeksList, setIndeksList] = useState<IndeksHarian[]>([]);
  const [ringkasanList, setRingkasanList] = useState<RingkasanHarian[]>([]);
  const [yearlyClusters, setYearlyClusters] = useState<ClusterPoint[]>([]);
  const [isLoadingClusters, setIsLoadingClusters] = useState<boolean>(false);

  // Spatiotemporal Filter
  const [filter, setFilter] = useState<SpatiotemporalFilter>({
    selectedYear: 2023,
    selectedMonth: 'all',
    selectedDate: null,
    selectedIsland: 'all',
    selectedProvince: 'all',
    onlyVegetation: false,
    sensorOrigin: 'all',
    minFrp: 0,
  });

  // Layer Toggles
  const [layers, setLayers] = useState<LayerVisibility>({
    clusterPoints: true,
    thermalHeatmap: true,
    showKeduanya: true,
    showViirsOnly: true,
    showModisOnly: true,
    provincialBoundaries: true,
  });

  // Selected Cluster Point on Map
  const [selectedCluster, setSelectedCluster] = useState<ClusterPoint | null>(null);

  // UI Panels (Adaptive default based on viewport width: closed on mobile/tablet to give map maximum room)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024;
    return true;
  });
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1280;
    return true;
  });
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);

  // Programmatic FlyTo coordinate
  const [flyToTarget, setFlyToTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
    timestamp: number;
  } | null>(null);

  // 1. Initial Data Fetch on Mount
  useEffect(() => {
    async function initData() {
      const [idx, ring] = await Promise.all([loadIndeksHarian(), loadRingkasanHarian()]);
      setIndeksList(idx);
      setRingkasanList(ring);
    }
    initData();
  }, []);

  // 2. Fetch Clusters whenever selectedYear changes
  useEffect(() => {
    let isCurrent = true;
    async function fetchClusters() {
      setIsLoadingClusters(true);
      const points = await loadClustersByYear(filter.selectedYear);
      if (isCurrent) {
        setYearlyClusters(points);
        setIsLoadingClusters(false);
      }
    }
    fetchClusters();
    return () => {
      isCurrent = false;
    };
  }, [filter.selectedYear]);

  // Extract Geographic Hierarchy (Islands & Provinces)
  const { islands, provincesByIsland } = useMemo(() => {
    return extractGeoHierarchy(ringkasanList);
  }, [ringkasanList]);

  // Deferred filter for heavy computational work to prevent UI input lag
  const deferredFilter = useDeferredValue(filter);

  // Filtered Regional Data for Leaderboard & Metrics
  const filteredRingkasan = useMemo(() => {
    return filterRingkasan(ringkasanList, deferredFilter);
  }, [ringkasanList, deferredFilter]);

  // Filtered Clusters for Leaflet Map
  const filteredClusters = useMemo(() => {
    return filterClusters(yearlyClusters, deferredFilter);
  }, [yearlyClusters, deferredFilter]);

  // Aggregated HUD Metrics
  const metrics = useMemo(() => {
    return computeMetrics(filteredRingkasan);
  }, [filteredRingkasan]);

  // Handlers (Wrapped in useCallback for rock-solid React.memo stability)
  const handleToggleLayer = useCallback((layerKey: keyof LayerVisibility) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilter({
      selectedYear: 2023,
      selectedMonth: 'all',
      selectedDate: null,
      selectedIsland: 'all',
      selectedProvince: 'all',
      onlyVegetation: false,
      sensorOrigin: 'all',
      minFrp: 0,
    });
    setFlyToTarget({ lat: -0.7893, lng: 113.9213, zoom: 5, timestamp: Date.now() });
  }, []);

  const handleSelectYearMonth = useCallback((year: number, month: number | 'all') => {
    setFilter((prev) => ({
      ...prev,
      selectedYear: year,
      selectedMonth: month,
      selectedDate: null,
    }));
  }, []);

  const handleSelectProvince = useCallback((provinsi: string) => {
    setFilter((prev) => ({
      ...prev,
      selectedProvince: provinsi,
    }));

    setFlyToTarget((prev) => {
      // Find representative point if available
      return { lat: -0.7893, lng: 113.9213, zoom: 7, timestamp: Date.now() };
    });
  }, []);

  const handleSelectDate = useCallback((date: string) => {
    setFilter((prev) => ({
      ...prev,
      selectedDate: date,
    }));
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleToggleAnalytics = useCallback(() => {
    setIsAnalyticsOpen((prev) => !prev);
  }, []);

  const handleOpenHowItWorks = useCallback(() => {
    setIsHowItWorksOpen(true);
  }, []);

  // If in Landing Page mode, render Landing Page
  if (viewMode === 'landing') {
    return (
      <div
        className={`w-full min-h-screen overflow-x-hidden transition-colors ${
          theme === 'light' ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#070b14] text-slate-100'
        }`}
      >
        <LandingPage
          indeksList={indeksList}
          onLaunchDashboard={() => setViewMode('dashboard')}
        />
        <Suspense fallback={null}>
          <HowItWorksModal
            isOpen={isHowItWorksOpen}
            onClose={() => setIsHowItWorksOpen(false)}
          />
          <SettingsModal />
        </Suspense>
      </div>
    );
  }

  // Dashboard / Mission Control View
  return (
    <div
      className={`flex flex-col h-screen h-[100dvh] w-full max-w-full overflow-hidden font-sans selection:bg-cyan-500 selection:text-black transition-colors ${
        theme === 'light' ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#050811] text-slate-100'
      }`}
    >
      <Suspense
        fallback={
          <div className="flex-1 flex flex-col items-center justify-center bg-[#070b14] text-cyan-400 font-mono gap-4">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs tracking-widest uppercase animate-pulse">
              Memuat Sistem Mission Control Greateye...
            </div>
          </div>
        }
      >
        {/* Top Mission Control Header */}
        <Header
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          filter={filter}
          filteredClusters={filteredClusters}
          onResetView={handleResetFilter}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          isAnalyticsOpen={isAnalyticsOpen}
          onToggleAnalytics={handleToggleAnalytics}
          onOpenHowItWorks={handleOpenHowItWorks}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden relative w-full min-w-0">
          {/* Left Filter Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={handleToggleSidebar}
            filter={filter}
            onFilterChange={setFilter}
          islands={islands}
          provincesByIsland={provincesByIsland}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onResetFilter={handleResetFilter}
        />

        {/* Center: HUD Telemetry + Map Canvas */}
        <main
          className={`flex-1 min-w-0 relative flex flex-col h-full overflow-hidden p-2 sm:p-3 pb-16 md:pb-3 transition-colors ${
            theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#070b14]'
          }`}
        >
          {/* Top HUD Telemetry Counters */}
          <TelemetryHud metrics={metrics} filter={filter} />

          {/* Map Area */}
          <div
            className={`flex-1 relative rounded-2xl overflow-hidden border shadow-2xl transition-colors ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            {isLoadingClusters && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-cyan-400 font-mono text-xs">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
                <span>
                  {language === 'en'
                    ? `Loading Cluster Data ${filter.selectedYear} (~${yearlyClusters.length || '30k+'} points)...`
                    : `Memuat Data Klaster ${filter.selectedYear} (~${yearlyClusters.length || '30k+'} titik)...`}
                </span>
              </div>
            )}

            <MapCanvas
              clusters={filteredClusters}
              selectedCluster={selectedCluster}
              onSelectCluster={setSelectedCluster}
              layers={layers}
              flyToTarget={flyToTarget}
              isSidebarOpen={isSidebarOpen}
              isAnalyticsOpen={isAnalyticsOpen}
              onResetFilter={handleResetFilter}
            />
          </div>

          {/* Bottom Focus & Data Strip */}
          <div
            className={`h-6 mt-1 flex items-center justify-between text-[10px] font-mono px-2 overflow-hidden w-full ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <div className="truncate shrink-0 max-w-[55%]">
              {language === 'en' ? 'FOCUS' : 'FOKUS'}:{' '}
              {filter.selectedProvince !== 'all'
                ? filter.selectedProvince
                : filter.selectedIsland !== 'all'
                ? filter.selectedIsland
                : 'INDONESIA'}{' '}
              • {filter.selectedYear}
            </div>
            <div className="truncate text-right">
              {filteredClusters.length.toLocaleString()}{' '}
              <span className="hidden sm:inline">
                {language === 'en' ? 'ACTIVE CLUSTERS DISPLAYED' : 'KLASTER AKTIF DITAMPILKAN'}
              </span>
              <span className="sm:hidden">
                {language === 'en' ? 'clusters' : 'klaster'}
              </span>
            </div>
          </div>
        </main>

        {/* Right Analytical Rail: Responsive Slide-Over Drawer on Mobile/Tablet & Inline on Desktop */}
        {isAnalyticsOpen && (
          <>
            {/* Backdrop overlay for mobile & tablet (< lg) */}
            <div
              onClick={handleToggleAnalytics}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-in fade-in duration-200"
            />
            <aside
              className={`fixed lg:relative inset-y-0 right-0 z-50 lg:z-10 w-88 sm:w-96 max-w-[90vw] lg:w-84 xl:w-96 border-l flex flex-col h-full overflow-y-auto p-3 space-y-3 shrink-0 transition-colors shadow-2xl lg:shadow-none animate-in slide-in-from-right duration-200 ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#080d17] border-slate-800/90'
              }`}
            >
              {/* Mobile/Tablet Drawer Header with Close Button */}
              <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{language === 'en' ? 'ANALYTICS & ANOMALY RADAR' : 'RADAR ANALITIK & ANOMALI'}</span>
                </div>
                <button
                  onClick={handleToggleAnalytics}
                  className="p-1 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Tutup Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Early Warning Banner */}
              <CriticalPeriodBanner
                indeksList={indeksList}
                filter={filter}
                onSelectDate={handleSelectDate}
              />

              {/* Calendar Heatmap Matrix */}
              <FireCalendarMatrix
                indeksList={indeksList}
                filter={filter}
                onSelectYearMonth={handleSelectYearMonth}
              />

              {/* High-Risk Province Leaderboard */}
              <ProvinceLeaderboard
                filteredRingkasan={filteredRingkasan}
                filter={filter}
                onSelectProvince={handleSelectProvince}
              />
            </aside>
          </>
        )}
      </div>

      {/* Mobile Native Bottom Navigation Bar */}
      <MobileBottomNav
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        isAnalyticsOpen={isAnalyticsOpen}
        onToggleAnalytics={handleToggleAnalytics}
      />

      {/* How It Works Explanatory Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      {/* Unified Settings Modal */}
      <SettingsModal />

      {/* Onboarding Feature Tour */}
      <OnboardingTour viewMode={viewMode} />
      </Suspense>
    </div>
  );
}

import { Language } from '../context/PreferencesContext';

export interface TranslationDictionary {
  // Navigation & Header
  navOverview: string;
  navConstellations: string;
  navResearch: string;
  navMethodology: string;
  navLaunchDashboard: string;
  navLandingPage: string;
  navMissionControl: string;
  navSettings: string;
  navHowItWorks: string;
  navExportCsv: string;
  navResetMap: string;
  navToggleFilter: string;
  navToggleAnalytics: string;
  statusOnline: string;
  statusDataWindow: string;

  // Landing Page Hero
  heroTag: string;
  heroTitle1: string;
  heroTitleHighlight: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroBtnLaunch: string;
  heroBtnKaggle: string;
  heroSubFeature: string;
  heroScrollDown: string;

  // Landing 3D Globe
  globeInteractiveTitle: string;
  globeFocusIndonesia: string;
  globeCardRegionTitle: string;
  globeCardRegionCoords: string;
  globeCardRegionSats: string;
  globeCardWindowTitle: string;
  globeCardWindowDates: string;
  globeCardWindowClusters: string;

  // Landing Constellations & Methodology
  constellationsTitle: string;
  constellationsSubtitle: string;
  modisHeading: string;
  modisResolution: string;
  viirsHeading: string;
  viirsResolution: string;
  researchTitle: string;
  researchSubtitle: string;
  methodologyTitle: string;
  methodologySubtitle: string;

  // Sidebar Filters
  filterTitle: string;
  filterYearRange: string;
  filterYear2026ThruJul: string;
  filterMonth: string;
  filterMonthAll: string;
  filterResetMonth: string;
  filterSpecificDate: string;
  filterSelectDate: string;
  filterResetDate: string;
  filterIsland: string;
  filterIslandAll: string;
  filterProvince: string;
  filterProvinceAll: string;
  filterVegetation: string;
  filterVegetationAll: string;
  filterFrpThreshold: string;
  filterFrpMin: string;
  filterFrpAll: string;
  filterResetAll: string;

  // Telemetry HUD
  hudRaw1km: string;
  hudRaw375m: string;
  hudTotalRaw: string;
  hudHarmonizedCentroid: string;
  hudReduction: string;
  hudTotalFrp: string;
  hudClustersUnit: string;
  hudPointsUnit: string;

  // Map Dock & Controls
  dockCluster: string;
  dockHeatmap: string;
  dockSatellite: string;
  dockVectorDark: string;
  dockVectorLight: string;
  dockLegend: string;
  dockFpsSmooth: string;
  dockShortcuts: string;
  mapEmptyTitle: string;
  mapEmptyDesc: string;
  mapEmptyReset: string;

  // Analytics Panel
  earlyWarningBadge: string;
  earlyWarningTitle: string;
  earlyWarningDesc: string;
  earlyWarningCritical: string;
  calendarMatrixTitle: string;
  calendarMatrixSub: string;
  calendarMatrixHint: string;
  topMonthsTitle: string;
  topDaysTitle: string;
  leaderboardTitle: string;
  leaderboardSub: string;

  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  settingsTabAppearance: string;
  settingsTabLanguage: string;
  settingsTabMap: string;
  themeDarkTitle: string;
  themeDarkDesc: string;
  themeLightTitle: string;
  themeLightDesc: string;
  langIndonesian: string;
  langEnglish: string;
  rippleTitle: string;
  rippleDesc: string;
  tourGuideTitle: string;
  tourGuideDesc: string;
  btnRestartTour: string;
  btnClose: string;

  // Onboarding Tour
  tourStep1Title: string;
  tourStep1Content: string;
  tourStep2Title: string;
  tourStep2Content: string;
  tourStep3Title: string;
  tourStep3Content: string;
  tourBtnNext: string;
  tourBtnPrev: string;
  tourBtnFinish: string;
  tourBtnSkip: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  id: {
    // Nav & Header
    navOverview: 'IKHTISAR',
    navConstellations: 'KONSTELASI SATELIT',
    navResearch: 'DATA RISET',
    navMethodology: 'METODOLOGI',
    navLaunchDashboard: 'Buka Mission Control',
    navLandingPage: 'Halaman Depan',
    navMissionControl: 'Mission Control',
    navSettings: 'Pengaturan Sistem',
    navHowItWorks: 'Cara Kerja Sistem',
    navExportCsv: 'Unduh CSV',
    navResetMap: 'Reset Peta ke Indonesia',
    navToggleFilter: 'Toggle Panel Filter',
    navToggleAnalytics: 'Toggle Panel Analitik',
    statusOnline: 'AKTIF',
    statusDataWindow: 'DATA NASA 2023 – JUL 2026',

    // Hero
    heroTag: 'OBSERVASI BUMI / ANALISIS KEBAKARAN SATELIT',
    heroTitle1: 'Memahami Aktivitas',
    heroTitleHighlight: 'Kebakaran Bumi',
    heroTitle2: 'Melalui Data Satelit.',
    heroSubtitle:
      'Menjembatani disparitas resolusi spasial MODIS dan VIIRS menjadi satu observasi harmonis titik api Indonesia, dinamika emisi karbon, dan lonjakan anomali kekeringan musiman.',
    heroBtnLaunch: 'Buka Aplikasi Web',
    heroBtnKaggle: 'Dokumentasi Riset Kaggle',
    heroSubFeature:
      'Klasterisasi spasiotemporal harmonis dengan deteksi anomali spasial berbasis densitas (DBSCAN) dan harmonisasi grid spasial.',
    heroScrollDown: 'GULIR UNTUK MENJELAJAHI RISET',

    // 3D Globe
    globeInteractiveTitle: 'Orbit Interaktif 3D',
    globeFocusIndonesia: 'Pusatkan ke Indonesia',
    globeCardRegionTitle: 'WILAYAH MISI',
    globeCardRegionCoords: '11°LS – 6°LU • 95° – 141°BT',
    globeCardRegionSats: 'Terra & Aqua • Aktif Harian',
    globeCardWindowTitle: 'RENTANG PENGAMATAN',
    globeCardWindowDates: '01 JAN 2023 – 31 JUL 2026',
    globeCardWindowClusters: '298,464 Klaster Harmonisasi',

    // Constellations & Methodology
    constellationsTitle: 'Konstelasi Pengamatan Termal Satelit',
    constellationsSubtitle:
      'Harmonisasi fusi data multi-sensor dari sensor optik dan inframerah gelombang menengah (MWIR).',
    modisHeading: 'MODIS (Terra & Aqua)',
    modisResolution: 'Resolusi Spasial 1 km • Baseline Sejarah Sejak 2000',
    viirsHeading: 'VIIRS (Suomi-NPP & NOAA-20/21)',
    viirsResolution: 'Resolusi Spasial 375 m • Deteksi Api Dini Resolusi Tinggi',
    researchTitle: 'Metrik Statistik Riset Multi-Tahun',
    researchSubtitle: 'Datafire spasial harmonis komprehensif seluruh pulau di Indonesia.',
    methodologyTitle: '5 Tahapan Harmonisasi Spasiotemporal',
    methodologySubtitle: 'Pipeline deterministik pengolahan data mentah NASA FIRMS.',

    // Sidebar
    filterTitle: 'FILTER SPASIOTEMPORAL',
    filterYearRange: 'RENTANG TAHUN PENGAMATAN',
    filterYear2026ThruJul: '2026 (s/d Jul)',
    filterMonth: 'FILTER BULAN',
    filterMonthAll: 'Semua Bulan (1 Tahun Penuh)',
    filterResetMonth: 'reset bulan',
    filterSpecificDate: 'TANGGAL SPESIFIK',
    filterSelectDate: 'Pilih Tanggal',
    filterResetDate: 'Hapus filter tanggal',
    filterIsland: 'WILAYAH KEPULAUAN',
    filterIslandAll: 'Seluruh Pulau di Indonesia',
    filterProvince: '38 PROVINSI INDONESIA',
    filterProvinceAll: 'Semua Provinsi',
    filterVegetation: 'TIPE TUTUPAN LAHAN',
    filterVegetationAll: 'Semua Tutupan Lahan',
    filterFrpThreshold: 'AMBANG BATAS DAYA TERMAL (FRP)',
    filterFrpMin: 'Min FRP',
    filterFrpAll: 'Semua Tingkat Energi (> 0 MW)',
    filterResetAll: 'Reset Semua Filter',

    // Telemetry HUD
    hudRaw1km: 'Titik Mentah 1km (MODIS)',
    hudRaw375m: 'Titik Mentah 375m (VIIRS)',
    hudTotalRaw: 'Total Titik Mentah',
    hudHarmonizedCentroid: 'Klaster Centroid Harmonisasi',
    hudReduction: 'Reduksi Duplikasi Spasial',
    hudTotalFrp: 'Total Daya Radiasi (FRP)',
    hudClustersUnit: 'klaster',
    hudPointsUnit: 'titik',

    // Map Dock & Controls
    dockCluster: 'Klaster Titik',
    dockHeatmap: 'Heatmap Densitas',
    dockSatellite: 'Citra Satelit',
    dockVectorDark: 'Vektor Gelap',
    dockVectorLight: 'Vektor Terang',
    dockLegend: 'Legenda Peta',
    dockFpsSmooth: '60 FPS Halus',
    dockShortcuts: 'Episentrum Cepat',
    mapEmptyTitle: 'Tidak Ada Anomali Titik Api',
    mapEmptyDesc: 'Tidak ada klaster kebakaran yang cocok dengan parameter filter spasiotemporal saat ini.',
    mapEmptyReset: 'Atur Ulang Filter',

    // Analytics Panel
    earlyWarningBadge: 'PERINGATAN DINI KRITIS',
    earlyWarningTitle: 'Lonjakan Anomali Kebakaran Terdeteksi',
    earlyWarningDesc: 'Kondisi anomali berada di atas ambang batas deviasi 2.0σ dari baseline historis.',
    earlyWarningCritical: 'Ambang Kritis ≥ 2.0',
    calendarMatrixTitle: 'Matriks Kalender Kejadian Kebakaran',
    calendarMatrixSub: 'Distribusi frekuensi mingguan sepanjang tahun',
    calendarMatrixHint: 'Klik sel untuk memfilter hari spesifik',
    topMonthsTitle: '3 Bulan Paling Rawan',
    topDaysTitle: '10 Hari Puncak Kebakaran Terparah',
    leaderboardTitle: 'Peringkat 10 Provinsi Teraktif',
    leaderboardSub: 'Berdasarkan frekuensi klaster kejadian bersih',

    // Settings Modal
    settingsTitle: 'Pengaturan Preferensi Sistem',
    settingsSubtitle: 'Kustomisasi tampilan, bahasa navigasi, dan efek visual Mission Control.',
    settingsTabAppearance: 'Tampilan & Tema',
    settingsTabLanguage: 'Bahasa (Language)',
    settingsTabMap: 'Peta & Panduan',
    themeDarkTitle: 'Dark Mode (Deep Space)',
    themeDarkDesc: 'Palet gelap kontras tinggi dirancang untuk kenyamanan pengamatan satelit malam hari.',
    themeLightTitle: 'Light Mode (Clean Science Lab)',
    themeLightDesc: 'Palet terang bersih dengan kontras optimal untuk analisis data siang hari.',
    langIndonesian: 'Bahasa Indonesia (ID)',
    langEnglish: 'English (US)',
    rippleTitle: 'Animasi Gelombang Episentrum',
    rippleDesc: 'Menampilkan efek riak gelombang konsentris saat melompat ke episentrum kebakaran utama.',
    tourGuideTitle: 'Panduan Pengguna Baru',
    tourGuideDesc: 'Jalankan kembali tur interaktif sorotan fitur utama Mission Control.',
    btnRestartTour: 'Mulai Ulang Panduan',
    btnClose: 'Tutup Pengaturan',

    // Onboarding Tour
    tourStep1Title: 'Filter Spasiotemporal Lengkap',
    tourStep1Content:
      'Gunakan panel filter ini untuk memfilter data menurut tahun (2023–2026), bulan, tanggal harian spesifik, batas pulau/provinsi, hingga ambang batas daya termal FRP.',
    tourStep2Title: 'Dock Kontrol & Visualisasi Peta',
    tourStep2Content:
      'Ganti tampilan peta antara Klaster Centroid berbobot, Heatmap intensitas termal, citra satelit NASA, serta lompat instan ke hotspot Riau, OKI Sumsel, dan Kalteng.',
    tourStep3Title: 'Analisis Anomali & Kalender Dinamis',
    tourStep3Content:
      'Pantau peringatan dini El Niño Z-Score, telusuri matriks kalender interaktif tahunan, dan evaluasi peringkat 10 provinsi terdampak kebakaran.',
    tourBtnNext: 'Selanjutnya',
    tourBtnPrev: 'Sebelumnya',
    tourBtnFinish: 'Mengerti, Mulai Eksplorasi',
    tourBtnSkip: 'Lewati Panduan',
  },

  en: {
    // Nav & Header
    navOverview: 'OVERVIEW',
    navConstellations: 'SATELLITE CONSTELLATIONS',
    navResearch: 'RESEARCH DATA',
    navMethodology: 'METHODOLOGY',
    navLaunchDashboard: 'Launch Mission Control',
    navLandingPage: 'Landing Page',
    navMissionControl: 'Mission Control',
    navSettings: 'System Preferences',
    navHowItWorks: 'How System Works',
    navExportCsv: 'Export CSV',
    navResetMap: 'Reset Map to Indonesia',
    navToggleFilter: 'Toggle Filter Panel',
    navToggleAnalytics: 'Toggle Analytics Panel',
    statusOnline: 'ONLINE',
    statusDataWindow: 'NASA DATA 2023 – JUL 2026',

    // Hero
    heroTag: 'EARTH OBSERVATION / SATELLITE FIRE ANALYSIS',
    heroTitle1: 'Understanding Earth’s',
    heroTitleHighlight: 'Burning Activity',
    heroTitle2: 'Through Satellite Data.',
    heroSubtitle:
      'Bridging the spatial resolution mismatch of MODIS and VIIRS active fire observations into a unified, calibrated perspective of Indonesia wildfire dynamics, carbon emissions, and seasonal dry anomalies.',
    heroBtnLaunch: 'Launch Web Application',
    heroBtnKaggle: 'Kaggle Research Docs',
    heroSubFeature:
      'Harmonized spatiotemporal clustering with density-based spatial anomaly detection (DBSCAN) and spatial grid harmonization.',
    heroScrollDown: 'SCROLL TO EXPLORE RESEARCH',

    // 3D Globe
    globeInteractiveTitle: 'Interactive 3D Orbit',
    globeFocusIndonesia: 'Focus on Indonesia',
    globeCardRegionTitle: 'MISSION REGION',
    globeCardRegionCoords: '11°S – 6°N • 95° – 141°E',
    globeCardRegionSats: 'Terra & Aqua • Active Daily',
    globeCardWindowTitle: 'OBSERVATION WINDOW',
    globeCardWindowDates: '01 JAN 2023 – 31 JUL 2026',
    globeCardWindowClusters: '298,464 Harmonized Clusters',

    // Constellations & Methodology
    constellationsTitle: 'Satellite Thermal Observation Constellations',
    constellationsSubtitle:
      'Multi-sensor data fusion harmonization of optical and mid-wave infrared (MWIR) sensors.',
    modisHeading: 'MODIS (Terra & Aqua)',
    modisResolution: '1 km Spatial Resolution • Historical Baseline Since 2000',
    viirsHeading: 'VIIRS (Suomi-NPP & NOAA-20/21)',
    viirsResolution: '375 m Spatial Resolution • High-Resolution Early Fire Detection',
    researchTitle: 'Multi-Year Research Statistical Metrics',
    researchSubtitle: 'Comprehensive harmonized spatial fire data across all Indonesian islands.',
    methodologyTitle: '5-Stage Spatiotemporal Harmonization',
    methodologySubtitle: 'Deterministic pipeline processing raw NASA FIRMS observations.',

    // Sidebar
    filterTitle: 'SPATIOTEMPORAL FILTER',
    filterYearRange: 'OBSERVATION YEAR RANGE',
    filterYear2026ThruJul: '2026 (thru Jul)',
    filterMonth: 'MONTH FILTER',
    filterMonthAll: 'All Months (Full Year)',
    filterResetMonth: 'reset month',
    filterSpecificDate: 'SPECIFIC DATE',
    filterSelectDate: 'Select Date',
    filterResetDate: 'Clear date filter',
    filterIsland: 'ISLAND REGION',
    filterIslandAll: 'All Islands in Indonesia',
    filterProvince: '38 INDONESIAN PROVINCES',
    filterProvinceAll: 'All Provinces',
    filterVegetation: 'LAND COVER TYPE',
    filterVegetationAll: 'All Land Covers',
    filterFrpThreshold: 'FIRE RADIATIVE POWER (FRP) THRESHOLD',
    filterFrpMin: 'Min FRP',
    filterFrpAll: 'All Energy Levels (> 0 MW)',
    filterResetAll: 'Reset All Filters',

    // Telemetry HUD
    hudRaw1km: 'Raw Points 1km (MODIS)',
    hudRaw375m: 'Raw Points 375m (VIIRS)',
    hudTotalRaw: 'Total Raw Points',
    hudHarmonizedCentroid: 'Harmonized Centroid Clusters',
    hudReduction: 'Spatial Duplication Reduction',
    hudTotalFrp: 'Total Fire Radiative Power (FRP)',
    hudClustersUnit: 'clusters',
    hudPointsUnit: 'points',

    // Map Dock & Controls
    dockCluster: 'Cluster Points',
    dockHeatmap: 'Density Heatmap',
    dockSatellite: 'Satellite Imagery',
    dockVectorDark: 'Dark Vector',
    dockVectorLight: 'Light Vector',
    dockLegend: 'Map Legend',
    dockFpsSmooth: '60 FPS Smooth',
    dockShortcuts: 'Quick Epicenters',
    mapEmptyTitle: 'No Fire Anomalies Found',
    mapEmptyDesc: 'No fire clusters matched the current spatiotemporal filter parameters.',
    mapEmptyReset: 'Reset Filter',

    // Analytics Panel
    earlyWarningBadge: 'CRITICAL EARLY WARNING',
    earlyWarningTitle: 'Fire Anomaly Spike Detected',
    earlyWarningDesc: 'Anomaly state exceeds 2.0σ critical deviation threshold from historical baseline.',
    earlyWarningCritical: 'Critical Threshold ≥ 2.0',
    calendarMatrixTitle: 'Fire Incident Calendar Matrix',
    calendarMatrixSub: 'Weekly frequency distribution throughout the year',
    calendarMatrixHint: 'Click a cell to filter specific day',
    topMonthsTitle: 'Top 3 High-Risk Months',
    topDaysTitle: 'Top 10 Peak Fire Days',
    leaderboardTitle: 'Top 10 Active Provinces Ranking',
    leaderboardSub: 'Ranked by net cluster incident frequency',

    // Settings Modal
    settingsTitle: 'System Preferences',
    settingsSubtitle: 'Customize display themes, language localization, and Mission Control visual effects.',
    settingsTabAppearance: 'Appearance & Theme',
    settingsTabLanguage: 'Language',
    settingsTabMap: 'Map & Walkthrough',
    themeDarkTitle: 'Dark Mode (Deep Space)',
    themeDarkDesc: 'High-contrast dark palette designed for comfortable satellite observation.',
    themeLightTitle: 'Light Mode (Clean Science Lab)',
    themeLightDesc: 'Clean bright palette with optimal contrast for daytime scientific data analysis.',
    langIndonesian: 'Bahasa Indonesia (ID)',
    langEnglish: 'English (US)',
    rippleTitle: 'Epicenter Ripple Wave Animation',
    rippleDesc: 'Displays concentric pulsing ripples when jumping to major wildfire epicenters.',
    tourGuideTitle: 'Onboarding Walkthrough',
    tourGuideDesc: 'Relaunch the interactive feature tour highlighting Mission Control capabilities.',
    btnRestartTour: 'Restart Tour Guide',
    btnClose: 'Close Settings',

    // Onboarding Tour
    tourStep1Title: 'Comprehensive Spatiotemporal Filter',
    tourStep1Content:
      'Filter observations by multi-year range (2023–2026), month, specific calendar date, island/province boundaries, and FRP thermal thresholds.',
    tourStep2Title: 'Map Visualization & Dock Controls',
    tourStep2Content:
      'Toggle seamlessly between weighted centroid clusters, thermal density heatmaps, and NASA satellite imagery, with instant jumps to high-activity hotspots.',
    tourStep3Title: 'Anomaly Analytics & Dynamic Calendar',
    tourStep3Content:
      'Track real-time El Niño early warnings, inspect the annual calendar frequency matrix, and analyze provincial leaderboard rankings.',
    tourBtnNext: 'Next',
    tourBtnPrev: 'Previous',
    tourBtnFinish: 'Understood, Start Exploring',
    tourBtnSkip: 'Skip Tour',
  },
};

export const useTranslation = (lang: Language) => {
  return translations[lang] || translations.id;
};

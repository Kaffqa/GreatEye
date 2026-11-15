import { IndeksHarian, ClusterPoint } from '../types';

export interface MonthMatrixCell {
  year: number;
  month: number;
  monthName: string;
  totalKejadian: number;
  totalFrp: number;
  avgZScore: number;
  maxZScore: number;
  hasHighAnomaly: boolean;
  intensity: number; // 0 to 1 normalized
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Build 12 Months x 4 Years Fire Heatmap Matrix
 */
export function buildFireCalendarMatrix(indeksList: IndeksHarian[]): {
  years: number[];
  matrix: Record<number, MonthMatrixCell[]>;
  maxKejadian: number;
} {
  const years = [2023, 2024, 2025, 2026];
  const matrix: Record<number, MonthMatrixCell[]> = {};
  let overallMaxKejadian = 1;

  for (const year of years) {
    matrix[year] = Array.from({ length: 12 }, (_, i) => ({
      year,
      month: i + 1,
      monthName: MONTH_NAMES[i],
      totalKejadian: 0,
      totalFrp: 0,
      avgZScore: 0,
      maxZScore: 0,
      hasHighAnomaly: false,
      intensity: 0,
    }));
  }

  for (const row of indeksList) {
    const y = row.tahun;
    const m = row.bulan;
    if (matrix[y] && matrix[y][m - 1]) {
      const cell = matrix[y][m - 1];
      cell.totalKejadian += row.kejadian;
      cell.totalFrp += row.frp_harmonis;
      if (row.z_anomali > cell.maxZScore) {
        cell.maxZScore = row.z_anomali;
      }
      if (row.anomali_tinggi || row.z_anomali >= 2.0) {
        cell.hasHighAnomaly = true;
      }
      if (cell.totalKejadian > overallMaxKejadian) {
        overallMaxKejadian = cell.totalKejadian;
      }
    }
  }

  // Normalize intensity
  for (const year of years) {
    for (const cell of matrix[year]) {
      cell.intensity = overallMaxKejadian > 0 ? Math.min(1, cell.totalKejadian / overallMaxKejadian) : 0;
    }
  }

  return { years, matrix, maxKejadian: overallMaxKejadian };
}

/**
 * Deteksi Periode Kritis Otomatis (3 Bulan Teraktif & 10 Hari Tertinggi)
 */
export function detectCriticalPeriods(
  indeksList: IndeksHarian[],
  selectedYear?: number
): {
  top3Months: { year: number; month: number; monthName: string; totalKejadian: number; totalFrp: number }[];
  top10Days: { date: string; kejadian: number; frp: number; zScore: number; isHighAnomaly: boolean }[];
} {
  const filtered = selectedYear
    ? indeksList.filter((d) => d.tahun === selectedYear)
    : indeksList;

  // 1. Group by Year + Month
  const monthMap = new Map<string, { year: number; month: number; monthName: string; totalKejadian: number; totalFrp: number }>();
  for (const row of filtered) {
    const key = `${row.tahun}-${row.bulan}`;
    const existing = monthMap.get(key) || {
      year: row.tahun,
      month: row.bulan,
      monthName: MONTH_NAMES[row.bulan - 1],
      totalKejadian: 0,
      totalFrp: 0,
    };
    existing.totalKejadian += row.kejadian;
    existing.totalFrp += row.frp_harmonis;
    monthMap.set(key, existing);
  }

  const top3Months = Array.from(monthMap.values())
    .sort((a, b) => b.totalKejadian - a.totalKejadian)
    .slice(0, 3);

  // 2. Top 10 Days by Kejadian
  const top10Days = [...filtered]
    .sort((a, b) => b.kejadian - a.kejadian)
    .slice(0, 10)
    .map((d) => ({
      date: d.tanggal,
      kejadian: d.kejadian,
      frp: Math.round(d.frp_harmonis * 10) / 10,
      zScore: Math.round(d.z_anomali * 100) / 100,
      isHighAnomaly: d.anomali_tinggi || d.z_anomali >= 2.0,
    }));

  return { top3Months, top10Days };
}

/**
 * Generator Unduh CSV Dinamis
 */
export function downloadFilteredCsv(clusters: ClusterPoint[], filename: string) {
  const headers = [
    'cluster_id',
    'date_wib',
    'n_hotspot',
    'n_modis',
    'lat',
    'lon',
    'frp_total',
    'frp_maks',
    'persen_type0',
    'n_viirs',
    'sumber',
    'provinsi',
    'pulau',
  ];

  const rows = clusters.map((c) => [
    c.id,
    c.d,
    c.nh,
    c.nm,
    c.lat,
    c.lon,
    c.frp,
    c.frpm,
    c.vegP,
    c.nv,
    `"${c.s}"`,
    `"${c.pr}"`,
    `"${c.pu}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

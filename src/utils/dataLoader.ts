import { IndeksHarian, RingkasanHarian, ClusterPoint, SpatiotemporalFilter, MissionMetrics } from '../types';

let cachedIndeks: IndeksHarian[] | null = null;
let cachedRingkasan: RingkasanHarian[] | null = null;
const cachedClusters: Record<number, ClusterPoint[]> = {};

/**
 * Fetch Indeks Harian (~60 KB)
 */
export async function loadIndeksHarian(): Promise<IndeksHarian[]> {
  if (cachedIndeks) return cachedIndeks;
  try {
    const res = await fetch('/data/indeks_harian.json');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    cachedIndeks = await res.json();
    return cachedIndeks!;
  } catch (err) {
    console.error('Failed to load indeks_harian.json', err);
    return [];
  }
}

/**
 * Fetch Ringkasan Harian Wilayah (~1.9 MB)
 */
export async function loadRingkasanHarian(): Promise<RingkasanHarian[]> {
  if (cachedRingkasan) return cachedRingkasan;
  try {
    const res = await fetch('/data/ringkasan_harian.json');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    cachedRingkasan = await res.json();
    return cachedRingkasan!;
  } catch (err) {
    console.error('Failed to load ringkasan_harian.json', err);
    return [];
  }
}

/**
 * Fetch Cluster Points by Year (Lazy loaded & cached in memory)
 * Supports ultra-compact flat array deserialization
 */
export async function loadClustersByYear(year: number): Promise<ClusterPoint[]> {
  if (cachedClusters[year]) return cachedClusters[year];
  try {
    const res = await fetch(`/data/clusters_${year}.json`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const rawData = await res.json();

    let data: ClusterPoint[];
    if (Array.isArray(rawData) && rawData.length > 0 && Array.isArray(rawData[0])) {
      // Unpack compact flat array [id, d, nh, nm, lat, lon, frp, frpm, vegP, nv, s, pr, pu]
      const len = rawData.length;
      data = new Array(len);
      for (let i = 0; i < len; i++) {
        const t = rawData[i];
        data[i] = {
          id: t[0],
          d: t[1],
          nh: t[2],
          nm: t[3],
          lat: t[4],
          lon: t[5],
          frp: t[6],
          frpm: t[7],
          vegP: t[8],
          nv: t[9],
          s: t[10],
          pr: t[11],
          pu: t[12],
        };
      }
    } else {
      data = rawData;
    }

    cachedClusters[year] = data;
    return data;
  } catch (err) {
    console.error(`Failed to load clusters_${year}.json`, err);
    return [];
  }
}

/**
 * Filter Clusters based on UI state (Optimized evaluation order)
 */
export function filterClusters(
  allClusters: ClusterPoint[],
  filter: SpatiotemporalFilter
): ClusterPoint[] {
  const onlyVeg = filter.onlyVegetation;
  const minFrp = filter.minFrp;
  const selOrigin = filter.sensorOrigin;
  const selIsland = filter.selectedIsland;
  const selProv = filter.selectedProvince;
  const selMonth = filter.selectedMonth;
  const selDate = filter.selectedDate;

  return allClusters.filter((c) => {
    // 1. Cheapest number comparison first
    if (minFrp > 0 && c.frp < minFrp) return false;

    // 2. Boolean vegetation flag
    if (onlyVeg && c.vegP < 0.5) return false;

    // 3. String sensor origin
    if (selOrigin !== 'all' && c.s !== selOrigin) return false;

    // 4. Exact date check (if present)
    if (selDate && c.d !== selDate) return false;

    // 5. Month filter
    if (selMonth !== 'all') {
      const month = parseInt(c.d.substring(5, 7), 10);
      if (month !== selMonth) return false;
    }

    // 6. Island filter
    if (selIsland !== 'all' && c.pu !== selIsland) return false;

    // 7. Province filter
    if (selProv !== 'all' && c.pr !== selProv) return false;

    return true;
  });
}

/**
 * Filter Ringkasan Harian (Optimized)
 */
export function filterRingkasan(
  ringkasan: RingkasanHarian[],
  filter: SpatiotemporalFilter
): RingkasanHarian[] {
  const yearStr = filter.selectedYear.toString();
  const onlyVeg = filter.onlyVegetation;
  const selIsland = filter.selectedIsland;
  const selProv = filter.selectedProvince;
  const selMonth = filter.selectedMonth;
  const selDate = filter.selectedDate;

  return ringkasan.filter((r) => {
    if (!r.tanggal.startsWith(yearStr)) return false;
    if (onlyVeg && r.veg !== 1) return false;
    if (selDate && r.tanggal !== selDate) return false;

    if (selMonth !== 'all') {
      const month = parseInt(r.tanggal.substring(5, 7), 10);
      if (month !== selMonth) return false;
    }

    if (selIsland !== 'all' && r.pulau !== selIsland) return false;
    if (selProv !== 'all' && r.provinsi !== selProv) return false;

    return true;
  });
}

/**
 * Compute HUD Telemetry Metrics
 */
export function computeMetrics(filteredRingkasan: RingkasanHarian[]): MissionMetrics {
  let totalRawModis = 0;
  let totalRawViirs = 0;
  let totalRawHotspots = 0;
  let totalCleanClusters = 0;
  let totalFrp = 0;

  for (let i = 0; i < filteredRingkasan.length; i++) {
    const r = filteredRingkasan[i];
    totalRawModis += r.n_modis;
    totalRawViirs += r.n_viirs;
    totalRawHotspots += r.hotspot;
    totalCleanClusters += r.kejadian;
    totalFrp += r.frp;
  }

  const reductionRatePct =
    totalRawHotspots > 0
      ? Math.max(0, Math.round(((totalRawHotspots - totalCleanClusters) / totalRawHotspots) * 1000) / 10)
      : 0;

  return {
    totalRawModis,
    totalRawViirs,
    totalRawHotspots,
    totalCleanClusters,
    reductionRatePct,
    totalFrp: Math.round(totalFrp * 10) / 10,
    criticalDaysCount: 0,
  };
}

/**
 * Top Provinces Leaderboard
 */
export function getProvinceLeaderboard(
  filteredRingkasan: RingkasanHarian[],
  limit = 10
): { provinsi: string; pulau: string; kejadian: number; hotspot: number; frp: number }[] {
  const map = new Map<string, { provinsi: string; pulau: string; kejadian: number; hotspot: number; frp: number }>();

  for (let i = 0; i < filteredRingkasan.length; i++) {
    const r = filteredRingkasan[i];
    if (r.provinsi === 'Luar poligon provinsi') continue;
    const existing = map.get(r.provinsi);
    if (!existing) {
      map.set(r.provinsi, {
        provinsi: r.provinsi,
        pulau: r.pulau,
        kejadian: r.kejadian,
        hotspot: r.hotspot,
        frp: r.frp,
      });
    } else {
      existing.kejadian += r.kejadian;
      existing.hotspot += r.hotspot;
      existing.frp += r.frp;
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.kejadian - a.kejadian)
    .slice(0, limit);
}

/**
 * Get Unique Islands and Provinces
 */
export function extractGeoHierarchy(ringkasan: RingkasanHarian[]): {
  islands: string[];
  provincesByIsland: Record<string, string[]>;
} {
  const islandsSet = new Set<string>();
  const provMap = new Map<string, Set<string>>();

  for (let i = 0; i < ringkasan.length; i++) {
    const r = ringkasan[i];
    if (r.pulau && r.pulau !== 'Luar poligon provinsi') {
      islandsSet.add(r.pulau);
      if (!provMap.has(r.pulau)) {
        provMap.set(r.pulau, new Set());
      }
      if (r.provinsi && r.provinsi !== 'Luar poligon provinsi') {
        provMap.get(r.pulau)!.add(r.provinsi);
      }
    }
  }

  const provincesByIsland: Record<string, string[]> = {};
  for (const [island, provs] of provMap.entries()) {
    provincesByIsland[island] = Array.from(provs).sort();
  }

  return {
    islands: Array.from(islandsSet).sort(),
    provincesByIsland,
  };
}

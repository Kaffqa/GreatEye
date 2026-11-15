import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rawDir = path.resolve('data_raw');
const dataDir = path.resolve('public/data');

async function processIndeksHarian() {
  console.log('Processing indeks_harian...');
  const filePath = path.join(rawDir, 'indeks_harian_kejadian_2023_2026.csv');
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const records: any[] = [];
  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }
    if (!line.trim()) continue;
    const parts = line.split(',');
    records.push({
      tanggal: parts[0],
      kejadian: parseInt(parts[1], 10),
      frp_harmonis: parseFloat(parts[2]),
      data_lengkap: parts[3] === 'True',
      kejadian_valid: parseFloat(parts[4]),
      z_anomali: parseFloat(parts[5]),
      anomali_tinggi: parts[6] === 'True',
      tahun: parseInt(parts[7], 10),
      bulan: parseInt(parts[8], 10),
      hari: parseInt(parts[9], 10),
    });
  }

  fs.writeFileSync(path.join(dataDir, 'indeks_harian.json'), JSON.stringify(records));
  console.log(`Saved indeks_harian.json with ${records.length} records.`);
}

async function processRingkasanHarian() {
  console.log('Processing ringkasan_harian...');
  const filePath = path.join(rawDir, 'ringkasan_harian_2023_2026.csv');
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const records: any[] = [];
  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }
    if (!line.trim()) continue;
    const parts = line.split(',');
    records.push({
      tanggal: parts[0],
      provinsi: parts[1],
      pulau: parts[2],
      veg: parseInt(parts[3], 10),
      kejadian: parseInt(parts[4], 10),
      hotspot: parseInt(parts[5], 10),
      n_modis: parseInt(parts[6], 10),
      n_viirs: parseInt(parts[7], 10),
      keduanya: parseInt(parts[8], 10),
      frp: parseFloat(parts[9]),
    });
  }

  fs.writeFileSync(path.join(dataDir, 'ringkasan_harian.json'), JSON.stringify(records));
  console.log(`Saved ringkasan_harian.json with ${records.length} records.`);
}

/**
 * Compact Flat-Array Format to eliminate 70% payload size
 * [id, d, nh, nm, lat, lon, frp, frpm, vegP, nv, s, pr, pu]
 */
async function processKejadianKebakaranCompact() {
  console.log('Processing kejadian_kebakaran into compact flat arrays...');
  const filePath = path.join(rawDir, 'kejadian_kebakaran_2023_2026.csv');
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const yearRecords: Record<string, any[]> = {
    '2023': [],
    '2024': [],
    '2025': [],
    '2026': [],
  };

  let isHeader = true;
  let count = 0;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }
    if (!line.trim()) continue;
    // cluster_id,date_wib,n_hotspot,n_modis,lat,lon,frp_total,frp_maks,persen_type0,n_viirs,sumber,provinsi,pulau
    const parts = line.split(',');
    const date = parts[1];
    const year = date.substring(0, 4);

    // Compact flat tuple: 0:id, 1:date, 2:nh, 3:nm, 4:lat, 5:lon, 6:frp, 7:frpm, 8:vegP, 9:nv, 10:sumber, 11:prov, 12:pulau
    const recordTuple = [
      parts[0], // id
      parts[1], // date
      parseInt(parts[2], 10), // nh
      parseInt(parts[3], 10), // nm
      Math.round(parseFloat(parts[4]) * 10000) / 10000, // lat (4 decimals ~ 11m precision)
      Math.round(parseFloat(parts[5]) * 10000) / 10000, // lon
      Math.round(parseFloat(parts[6]) * 10) / 10, // frp
      Math.round(parseFloat(parts[7]) * 10) / 10, // frpm
      parseFloat(parts[8]), // vegP
      parseInt(parts[9], 10), // nv
      parts[10], // s
      parts[11], // pr
      parts[12], // pu
    ];

    if (yearRecords[year]) {
      yearRecords[year].push(recordTuple);
    } else {
      yearRecords[year] = [recordTuple];
    }
    count++;
  }

  for (const [year, recs] of Object.entries(yearRecords)) {
    const outPath = path.join(dataDir, `clusters_${year}.json`);
    fs.writeFileSync(outPath, JSON.stringify(recs));
    const stats = fs.statSync(outPath);
    console.log(`Saved compact clusters_${year}.json with ${recs.length} points (${(stats.size / 1024 / 1024).toFixed(2)} MB).`);
  }
  console.log(`Total cluster points processed: ${count}`);
}

async function run() {
  await processIndeksHarian();
  await processRingkasanHarian();
  await processKejadianKebakaranCompact();
  console.log('All compact data processing finished successfully!');
}

run().catch(console.error);

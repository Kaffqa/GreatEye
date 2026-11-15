import React from 'react';
import {
  X,
  Flame,
  Satellite,
  Compass,
  Layers,
  Activity,
  AlertTriangle,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#080d1a] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/80 overflow-hidden text-slate-100 font-sans">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono tracking-wide">
                CARA KERJA SISTEM & ARSITEKTUR GREATEYE
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">
                Panduan Operasional & Metodologi Harmonisasi Multi-Sensor Satelit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Section 1: Alur 3 Sumber Data CSV */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <h4 className="text-sm font-bold text-cyan-300 uppercase font-mono mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>1. Alur 3 Tingkat Data CSV (Three-Tier Architecture)</span>
            </h4>
            <p className="text-slate-400 leading-relaxed mb-4">
              Greateye membagi data historis Januari 2023 – Juli 2026 (rentang 02 Jan 2023 – 31 Jul 2026) ke dalam 3 tingkatan data terpisah agar komputasi di peramban tetap
              ringan, instan, dan bebas *lag*:
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                  CSV 3 • INDEKS NASIONAL (100 KB)
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Memuat ringkasan harian seluruh Indonesia. Menghidupkan <strong>Kalender Matriks 12x4</strong>, <strong>Top 3 Bulan Teraktif</strong>, dan pemicu <strong>Early Warning (Z-Score)</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950">
                <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">
                  CSV 1 • RINGKASAN WILAYAH (1.9 MB)
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Agregasi harian per Pulau dan 38 Provinsi. Menghidupkan <strong>Papan Peringkat Risiko (Leaderboard)</strong>, penghitung <strong>Raw MODIS vs VIIRS</strong>, serta sakelar <strong>Hanya Vegetasi</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">
                  CSV 2 • KLASTER TITIK SPASIAL (33 MB)
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Titik koordinat centroid klaster hasil DBSCAN. Dipartisi per tahun untuk di-render pada <strong>Peta Leaflet Canvas</strong> dan generator <strong>Ekspor CSV Dinamis</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Algoritma Klasterisasi DBSCAN */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <h4 className="text-sm font-bold text-amber-300 uppercase font-mono mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>2. Algoritma Klasterisasi Spasial DBSCAN (Penyelesaian Double-Counting)</span>
            </h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Ketika satelit MODIS (1 km) dan VIIRS (375 m) melintasi area yang sama, sensor mendeteksi titik yang bertumpukan.
              DBSCAN menggabungkan titik tersebut jika:
            </p>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-300 list-disc list-inside mb-4">
              <li>Jarak geodesik bola bumi (Haversine) antara titik &le; 1.25 km (Epsilon).</li>
              <li>Waktu deteksi berada dalam jendela kalender harian yang sama (&Delta;t &le; 24 jam).</li>
            </ul>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
              Titik Pusat (Centroid) = &sum;(FRP_i &times; Lat_i) / &sum;FRP_i , &sum;(FRP_i &times; Lon_i) / &sum;FRP_i
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Hasilnya: Koordinat klaster merefleksikan episentrum api terkuat, dan menghasilkan tag sensor transparan
              (Keduanya, Hanya VIIRS, atau Hanya MODIS).
            </p>
          </div>

          {/* Section 3: Deteksi Dini & Early Warning Z-Score */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <h4 className="text-sm font-bold text-rose-400 uppercase font-mono mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>3. Sistem Peringatan Dini (Early Warning Anomaly Z-Score)</span>
            </h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Setiap hari dihitung skor anomali statistik terhadap rata-rata historis (&mu;) dan standar deviasi (&sigma;):
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-rose-300">
              Z = (Kejadian_Hari_Ini - &mu;) / &sigma; &ge; 2.0 (Ambang Lonjakan Ekstrem)
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Jika nilai Z &ge; 2.0 (atau flag <code>anomali_tinggi == True</code>), sistem langsung mengibarkan spanduk merah darurat
              di panel kanan untuk mengingatkan tim penanggulangan bencana.
            </p>
          </div>

          {/* Section 4: Tips Navigasi Antarmuka */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <h4 className="text-sm font-bold text-emerald-300 uppercase font-mono mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>4. Cara Menggunakan Fitur Interaktif Dasbor</span>
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">📅 Klik Sel Kalender Matriks</span>
                <span className="text-slate-400">
                  Mengklik salah satu kotak bulan di matriks 12x4 akan langsung memfilter seluruh peta dan metrik ke bulan & tahun tersebut.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">🏆 Klik Peringkat Provinsi</span>
                <span className="text-slate-400">
                  Mengklik nama provinsi di Leaderboard otomatis menerbangkan peta (*flyTo*) ke provinsi tersebut.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">🌲 Sakelar "Hanya Vegetasi"</span>
                <span className="text-slate-400">
                  Mengaktifkan sakelar ini menyaring anomali industri migas dan cerobong pabrik, menyisakan murni kebakaran hutan/lahan.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">📥 Unduh CSV Dinamis</span>
                <span className="text-slate-400">
                  Tombol di Header mengekspor file CSV klaster bersih sesuai filter aktif saat itu untuk keperluan analisis riset.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs cursor-pointer transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

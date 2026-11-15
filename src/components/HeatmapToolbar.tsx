import React from 'react';
import {
  Flame,
  Zap,
  Sliders,
  Palette,
  Compass,
  MapPin,
  X,
} from 'lucide-react';
import { HeatmapConfig, HeatmapGradientPreset } from '../types';

interface HeatmapSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeatmapConfig;
  onChangeConfig: (newConfig: HeatmapConfig) => void;
  onQuickJump: (target: { lat: number; lng: number; zoom: number; timestamp: number }) => void;
}

// 5 Indonesian Epicenters for Wildfire and Peatland Fires
const INDONESIA_EPICENTERS = [
  { name: 'Riau (Gambut)', lat: 1.48, lng: 101.85, zoom: 8, label: 'Pesisir Riau' },
  { name: 'Sumsel (OKI)', lat: -3.45, lng: 104.9, zoom: 8, label: 'Ogan Komering Ilir' },
  { name: 'Kalbar (Ketapang)', lat: -1.58, lng: 109.95, zoom: 8, label: 'Ketapang & Kubu Raya' },
  { name: 'Kalteng (Palangka)', lat: -2.4, lng: 114.1, zoom: 8, label: 'Palangka & Pulang Pisau' },
  { name: 'Papua (Merauke)', lat: -7.95, lng: 139.8, zoom: 8, label: 'Savana Merauke' },
];

export const HeatmapSettingsPopover: React.FC<HeatmapSettingsPopoverProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onQuickJump,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-3.5 rounded-2xl bg-[#070c18]/98 border border-cyan-500/50 shadow-2xl shadow-cyan-950/90 w-80 max-w-[calc(100vw-2rem)] font-mono text-xs space-y-3 pointer-events-auto animate-fadeIn"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <span className="font-bold text-slate-100 text-[11px] tracking-wider uppercase">
            Pengaturan Heatmap
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Tutup Pengaturan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Weight Mode Switcher */}
      <div>
        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider mb-1.5">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Basis Pembobotan</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => onChangeConfig({ ...config, weightMode: 'frp' })}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              config.weightMode === 'frp'
                ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Energi FRP (MW)
          </button>
          <button
            onClick={() => onChangeConfig({ ...config, weightMode: 'frequency' })}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              config.weightMode === 'frequency'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Frekuensi Titik
          </button>
        </div>
      </div>

      {/* 2. Radius Slider */}
      <div>
        <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
          <span className="flex items-center gap-1 uppercase tracking-wider">
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>Radius Sebaran</span>
          </span>
          <span className="font-bold text-cyan-300">{config.radius} px</span>
        </div>
        <input
          type="range"
          min="15"
          max="50"
          step="1"
          value={config.radius}
          onChange={(e) =>
            onChangeConfig({
              ...config,
              radius: parseInt(e.target.value, 10),
              blur: Math.round(parseInt(e.target.value, 10) * 0.6),
            })
          }
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
        />
      </div>

      {/* 3. Gradient Presets */}
      <div>
        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider mb-1.5">
          <span className="flex items-center gap-1">
            <Palette className="w-3 h-3 text-emerald-400" />
            <span>Palet Warna Suhu</span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'nasa', label: 'NASA FIRMS', bar: 'from-cyan-400 via-amber-400 to-rose-500' },
            { id: 'inferno', label: 'Inferno', bar: 'from-purple-600 via-pink-500 to-amber-300' },
            { id: 'gambut', label: 'Gambut', bar: 'from-teal-600 via-amber-600 to-red-700' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() =>
                onChangeConfig({
                  ...config,
                  gradientPreset: p.id as HeatmapGradientPreset,
                })
              }
              className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                config.gradientPreset === p.id
                  ? 'border-cyan-400 bg-cyan-950/50 text-white font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`h-1.5 w-full rounded bg-gradient-to-r ${p.bar} mb-1`} />
              <span className="text-[9px] block truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Indonesian Episentrum Karhutla Quick-Jump */}
      <div>
        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider mb-1.5">
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-400" />
            <span>Episentrum Kritis Indonesia</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {INDONESIA_EPICENTERS.map((epi) => (
            <button
              key={epi.name}
              onClick={() => {
                onQuickJump({
                  lat: epi.lat,
                  lng: epi.lng,
                  zoom: epi.zoom,
                  timestamp: Date.now(),
                });
                onClose();
              }}
              className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400 hover:text-cyan-300 transition-all text-[9.5px] text-slate-300 cursor-pointer truncate"
              title={epi.label}
            >
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="truncate">{epi.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Thermal Intensity Scale Bar */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
          <span>Rendah</span>
          <span>Sedang</span>
          <span>Tinggi</span>
          <span className="text-rose-400 font-bold">Kritis</span>
        </div>
        <div
          className={`h-2 w-full rounded-full ${
            config.gradientPreset === 'nasa'
              ? 'bg-gradient-to-r from-cyan-400 via-amber-400 via-orange-500 to-rose-600'
              : config.gradientPreset === 'inferno'
              ? 'bg-gradient-to-r from-purple-800 via-pink-600 via-amber-500 to-yellow-300'
              : 'bg-gradient-to-r from-teal-800 via-amber-600 via-red-600 to-rose-900'
          }`}
        />
      </div>
    </div>
  );
};

// Backward-compatible alias
export const HeatmapToolbar = HeatmapSettingsPopover;

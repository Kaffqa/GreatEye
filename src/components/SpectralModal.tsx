import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Scan,
  Layers,
  Activity,
  Sliders,
  Flame,
  Info,
  Maximize,
  Download,
} from 'lucide-react';
import { Hotspot } from '../types';
import { formatLatLon } from '../utils/geo';

interface SpectralModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHotspot: Hotspot | null;
  hotspots?: Hotspot[];
  onSelectHotspot?: (h: Hotspot) => void;
}

export const SpectralModal: React.FC<SpectralModalProps> = ({
  isOpen,
  onClose,
  selectedHotspot,
  hotspots,
  onSelectHotspot,
}) => {
  const [bandCombination, setBandCombination] = useState<'SWIR_FALSE_COLOR' | 'NATURAL_COLOR' | 'NBR_BURN_SEVERITY' | 'THERMAL_INFRARED'>('SWIR_FALSE_COLOR');
  const [contrastBoost, setContrastBoost] = useState<number>(1.2);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !selectedHotspot) return null;

  // Normalized Burn Ratio calculation simulation
  const nirReflectance = 0.42;
  const swirReflectance = selectedHotspot.swirReflectance;
  const nbrValue = ((nirReflectance - swirReflectance) / (nirReflectance + swirReflectance)).toFixed(3);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-[#090D16]/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl bg-[#111827] border border-[#334155] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="h-12 bg-[#0D131F] border-b border-[#1E293B] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Scan className="w-4 h-4 text-[#06B6D4]" />
            <div>
              <span className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC]">
                MULTI-SPECTRAL RADIOMETRIC ANALYZER
              </span>
              <span className="text-[10px] font-['JetBrains_Mono'] text-[#94A3B8] ml-2">
                SENTINEL-2 / VIIRS HIGH-RES RECONNAISSANCE
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
            title="Close Analyzer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left 2 Cols: False-Color Multi-spectral Visualizer */}
          <div className="md:col-span-2 space-y-3">
            <div className="relative aspect-video bg-[#090D16] border border-[#1E293B] rounded-sm overflow-hidden flex items-center justify-center group">
              {/* Synthetic Multi-Spectral Image Canvas */}
              <div
                className="absolute inset-0 w-full h-full flex items-center justify-center"
                style={{
                  background:
                    bandCombination === 'SWIR_FALSE_COLOR'
                      ? 'radial-gradient(circle at 55% 45%, #ef4444 0%, #f97316 20%, #7c2d12 40%, #1e1b4b 75%, #090d16 100%)'
                      : bandCombination === 'THERMAL_INFRARED'
                      ? 'radial-gradient(circle at 55% 45%, #ffffff 0%, #fbbf24 15%, #ef4444 35%, #4c1d95 65%, #050505 100%)'
                      : bandCombination === 'NBR_BURN_SEVERITY'
                      ? 'radial-gradient(circle at 55% 45%, #7f1d1d 0%, #b45309 30%, #15803d 70%, #064e3b 100%)'
                      : 'radial-gradient(circle at 50% 50%, #475569 0%, #334155 45%, #1e293b 80%, #090d16 100%)',
                  filter: `contrast(${contrastBoost})`,
                }}
              >
                {/* Active Fire Core Reticle */}
                <div className="relative w-24 h-24 border border-[#06B6D4]/60 rounded-full flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                  <div className="absolute -top-3 text-[9px] font-['JetBrains_Mono'] text-[#06B6D4] bg-[#090D16]/80 px-1 border border-[#06B6D4]/40">
                    FRP PEAK {selectedHotspot.frp} MW
                  </div>
                </div>
              </div>

              {/* Overlay Grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

              {/* Viewport Metadata Badges */}
              <div className="absolute top-2 left-2 bg-[#090D16]/90 border border-[#1E293B] px-2 py-1 rounded-sm text-[10px] font-['JetBrains_Mono'] text-[#dfe2ef]">
                <span>BAND: {bandCombination.replace(/_/g, ' ')}</span>
              </div>

              <div className="absolute bottom-2 left-2 bg-[#090D16]/90 border border-[#1E293B] px-2 py-1 rounded-sm text-[10px] font-['JetBrains_Mono'] text-[#94A3B8]">
                <span>CTR: {formatLatLon(selectedHotspot.lat, selectedHotspot.lng)}</span>
              </div>
            </div>

            {/* Band Combination Selector */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#0D131F] p-1.5 rounded-sm border border-[#1E293B] text-[10px] font-['JetBrains_Mono']">
              <button
                onClick={() => setBandCombination('SWIR_FALSE_COLOR')}
                className={`py-1.5 px-2 rounded-sm uppercase tracking-wider text-center transition-colors ${
                  bandCombination === 'SWIR_FALSE_COLOR'
                    ? 'bg-[#1E293B] text-[#F97316] font-bold border border-[#334155]'
                    : 'text-[#94A3B8] hover:text-[#dfe2ef]'
                }`}
              >
                SWIR (B12/8A/4)
              </button>
              <button
                onClick={() => setBandCombination('THERMAL_INFRARED')}
                className={`py-1.5 px-2 rounded-sm uppercase tracking-wider text-center transition-colors ${
                  bandCombination === 'THERMAL_INFRARED'
                    ? 'bg-[#1E293B] text-[#EF4444] font-bold border border-[#334155]'
                    : 'text-[#94A3B8] hover:text-[#dfe2ef]'
                }`}
              >
                LWIR THERMAL
              </button>
              <button
                onClick={() => setBandCombination('NBR_BURN_SEVERITY')}
                className={`py-1.5 px-2 rounded-sm uppercase tracking-wider text-center transition-colors ${
                  bandCombination === 'NBR_BURN_SEVERITY'
                    ? 'bg-[#1E293B] text-[#10B981] font-bold border border-[#334155]'
                    : 'text-[#94A3B8] hover:text-[#dfe2ef]'
                }`}
              >
                NBR INDEX
              </button>
              <button
                onClick={() => setBandCombination('NATURAL_COLOR')}
                className={`py-1.5 px-2 rounded-sm uppercase tracking-wider text-center transition-colors ${
                  bandCombination === 'NATURAL_COLOR'
                    ? 'bg-[#1E293B] text-[#06B6D4] font-bold border border-[#334155]'
                    : 'text-[#94A3B8] hover:text-[#dfe2ef]'
                }`}
              >
                NATURAL VIS
              </button>
            </div>
          </div>

          {/* Right Col: Spectral Telemetry & Radiometric Breakdown */}
          <div className="space-y-3 text-xs">
            {/* Target Summary with Quick Switcher */}
            <div className="bg-[#0D131F] border border-[#1E293B] p-2.5 rounded-sm space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-['JetBrains_Mono'] text-[#94A3B8]">
                <span>SELECT INCIDENT TARGET:</span>
                <span className="text-[#F97316] font-bold">{selectedHotspot.frp} MW</span>
              </div>
              {hotspots && onSelectHotspot ? (
                <select
                  value={selectedHotspot.id}
                  onChange={(e) => {
                    const match = hotspots.find((h) => h.id === e.target.value);
                    if (match) onSelectHotspot(match);
                  }}
                  className="w-full h-8 px-2 bg-[#090D16] border border-[#1E293B] focus:border-[#06B6D4] rounded-sm text-xs font-['Space_Grotesk'] font-bold text-[#F8FAFC] outline-none"
                >
                  {hotspots.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.region})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC]">
                  {selectedHotspot.name}
                </span>
              )}
              <span className="text-[10px] font-['JetBrains_Mono'] text-[#06B6D4] block">
                {selectedHotspot.id} • {selectedHotspot.satellite} ({selectedHotspot.instrument})
              </span>
            </div>

            {/* NBR Burn Severity Index */}
            <div className="bg-[#0D131F] border border-[#1E293B] p-2.5 rounded-sm space-y-1">
              <div className="flex justify-between items-center text-[10px] font-['JetBrains_Mono']">
                <span className="text-[#94A3B8]">NBR (BURN SEVERITY):</span>
                <span className="text-[#EF4444] font-bold">{nbrValue}</span>
              </div>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#10B981] via-[#FBBF24] to-[#EF4444] h-full"
                  style={{ width: `${Math.min(100, Math.max(0, (parseFloat(nbrValue) + 1) * 50))}%` }}
                />
              </div>
              <span className="text-[9px] font-['Geist'] text-[#64748B] block">
                High post-fire burn scar damage detected across vegetation canopy.
              </span>
            </div>

            {/* Band Reflectance Table */}
            <div className="bg-[#0D131F] border border-[#1E293B] p-2.5 rounded-sm space-y-2 text-[10px] font-['JetBrains_Mono']">
              <span className="text-[#94A3B8] uppercase block">RADIATIVE SPECTRAL BANDS</span>
              <div className="space-y-1">
                <div className="flex justify-between py-0.5 border-b border-[#1E293B]">
                  <span className="text-[#dfe2ef]">B12 (2.19 µm SWIR):</span>
                  <span className="text-[#F97316] font-bold">{(selectedHotspot.swirReflectance * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#1E293B]">
                  <span className="text-[#dfe2ef]">B8A (865 nm NIR):</span>
                  <span className="text-[#10B981] font-bold">42.0%</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#1E293B]">
                  <span className="text-[#dfe2ef]">I4 (3.74 µm MWIR):</span>
                  <span className="text-[#EF4444] font-bold">{selectedHotspot.brightnessTemp} K</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[#dfe2ef]">AEROSOL AOD:</span>
                  <span className="text-[#FBBF24] font-bold">{selectedHotspot.smokeAod}</span>
                </div>
              </div>
            </div>

            {/* Contrast Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-['JetBrains_Mono'] mb-1">
                <span className="text-[#94A3B8]">CONTRAST ENHANCEMENT:</span>
                <span className="text-[#06B6D4]">{contrastBoost.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={2.0}
                step={0.1}
                value={contrastBoost}
                onChange={(e) => setContrastBoost(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#06B6D4]"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-10 bg-[#0D131F] border-t border-[#1E293B] px-4 flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#94A3B8]">
          <span>CALIBRATED WITH USGS EROS / COPERNICUS HUB</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] rounded-sm transition-colors cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

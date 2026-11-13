import React, { useEffect, useState } from 'react';
import { Play, Pause, FastForward, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { HOURLY_HISTOGRAM_DATA } from '../data/mockData';

interface TimelineScrubberProps {
  timeOffsetHours: number;
  onTimeOffsetChange: (offset: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  timeOffsetHours,
  onTimeOffsetChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
}) => {
  // Tick points: -24h, -18h, -12h, -6h, 0h (NOW)
  const ticks = [
    { offset: -24, label: '-24h UTC' },
    { offset: -18, label: '-18h UTC' },
    { offset: -12, label: '-12h UTC' },
    { offset: -6, label: '-6h UTC' },
    { offset: 0, label: 'NOW (LIVE)' },
  ];

  // Calculate simulated UTC time string for current scrubber position
  const getScrubbedTimeString = () => {
    const now = new Date();
    const scrubbed = new Date(now.getTime() + timeOffsetHours * 3600 * 1000);
    return scrubbed.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
  };

  return (
    <div className="h-16 bg-[#0D131F] border-t border-[#1E293B] px-4 flex items-center justify-between select-none shrink-0 z-20 text-xs">
      {/* Left: Playback Controls */}
      <div className="flex items-center space-x-2 shrink-0 pr-4 border-r border-[#1E293B]">
        <button
          onClick={onTogglePlay}
          className={`h-8 w-8 rounded-sm flex items-center justify-center transition-colors ${
            isPlaying
              ? 'bg-[#06B6D4] text-[#090D16] shadow-sm'
              : 'bg-[#111827] text-[#dfe2ef] border border-[#1E293B] hover:border-[#06B6D4]'
          }`}
          title={isPlaying ? 'Pause Temporal Simulation' : 'Play Historical Progression'}
          aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>

        {/* Speed multiplier toggle */}
        <button
          onClick={() => {
            const next = playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 5 : 1;
            onChangeSpeed(next);
          }}
          className="h-8 px-2 rounded-sm bg-[#111827] border border-[#1E293B] hover:border-[#334155] text-[#94A3B8] hover:text-[#06B6D4] font-['JetBrains_Mono'] text-[10px] font-semibold flex items-center space-x-1"
          title="Toggle Simulation Speed"
        >
          <FastForward className="w-3 h-3" />
          <span>{playbackSpeed}X</span>
        </button>

        {/* Reset to live */}
        <button
          onClick={() => onTimeOffsetChange(0)}
          className={`h-8 px-2 rounded-sm border text-[10px] font-['JetBrains_Mono'] transition-colors ${
            timeOffsetHours === 0
              ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/40'
              : 'bg-[#111827] text-[#94A3B8] border-[#1E293B] hover:text-[#dfe2ef]'
          }`}
          title="Jump to Current Live Satellite Pass"
        >
          LIVE
        </button>
      </div>

      {/* Center: Slider Track with Thermal Histogram Bars and Ticks */}
      <div className="flex-1 px-6 flex flex-col justify-center">
        {/* Current Scrub Indicator */}
        <div className="flex justify-between items-center text-[10px] font-['JetBrains_Mono'] mb-1">
          <div className="flex items-center space-x-2 text-[#94A3B8]">
            <Clock className="w-3 h-3 text-[#06B6D4]" />
            <span>ORBITAL TEMPORAL SCRUBBER:</span>
            <span className="text-[#06B6D4] font-semibold">{getScrubbedTimeString()}</span>
          </div>
          <span className="text-[#F97316]">
            {timeOffsetHours === 0 ? 'REALTIME TELEMETRY' : `${timeOffsetHours}h OFFSET`}
          </span>
        </div>

        {/* Histogram Mini-Bars aligned with slider */}
        <div className="relative w-full h-3 flex items-end justify-between px-1 mb-0.5 opacity-60">
          {HOURLY_HISTOGRAM_DATA.map((d, idx) => {
            const heightPct = Math.max(15, (d.frpTotal / 5840) * 100);
            return (
              <div
                key={idx}
                className="w-1.5 bg-[#F97316] rounded-t-[1px] transition-all hover:bg-[#06B6D4]"
                style={{ height: `${heightPct}%` }}
                title={`${d.hour}: ${d.frpTotal} MW`}
              />
            );
          })}
        </div>

        {/* Interactive Range Input with custom cyan scrubber hairline */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={-24}
            max={0}
            step={0.5}
            value={timeOffsetHours}
            onChange={(e) => onTimeOffsetChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#1E293B] rounded-sm appearance-none cursor-ew-resize accent-[#06B6D4]"
          />
        </div>

        {/* Ticks and Labels below */}
        <div className="flex justify-between text-[9px] font-['JetBrains_Mono'] text-[#64748B] mt-1">
          {ticks.map((t) => (
            <button
              key={t.offset}
              onClick={() => onTimeOffsetChange(t.offset)}
              className={`hover:text-[#06B6D4] transition-colors ${
                Math.abs(timeOffsetHours - t.offset) < 1 ? 'text-[#06B6D4] font-bold' : ''
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Mode & Constellation Sync Status */}
      <div className="hidden md:flex items-center space-x-3 shrink-0 pl-4 border-l border-[#1E293B] text-[10px] font-['JetBrains_Mono']">
        <div>
          <span className="text-[#64748B] block">ORBIT SYNCHRONIZATION</span>
          <span className="text-[#10B981] font-bold">2.44 GHz DOWNLINK</span>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Play, Pause } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const TimelineSlider: React.FC = () => {
  const { timeRange, maxTimeRange, setTimeRange } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = setInterval(() => {
        // Advance both start and end by 5 seconds per tick (simulated playback speed)
        const duration = timeRange[1] - timeRange[0];
        const nextEnd = Math.min(maxTimeRange[1], timeRange[1] + 5000);
        const nextStart = Math.max(maxTimeRange[0], nextEnd - duration);
        
        setTimeRange([nextStart, nextEnd]);
        
        if (nextEnd >= maxTimeRange[1]) {
          setIsPlaying(false);
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRange, maxTimeRange, setTimeRange]);

  const minTs = maxTimeRange[0];
  const maxTs = maxTimeRange[1];

  if (minTs === maxTs || maxTs === 0) {
    return null; // Hide if no data or range
  }

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[600px] bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700/50 shadow-2xl flex items-center gap-6 z-20">
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center text-white transition-colors flex-shrink-0 shadow-lg"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
      </button>

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
          <span>{formatTime(timeRange[0] - minTs)}</span>
          <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            Window: {formatTime(timeRange[1] - timeRange[0])}
          </span>
          <span>{formatTime(timeRange[1] - minTs)}</span>
        </div>
        
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={timeRange}
          min={minTs}
          max={maxTs}
          step={1000} // 1 second steps
          onValueChange={(val) => setTimeRange(val as [number, number])}
        >
          <Slider.Track className="bg-slate-700 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-indigo-500 rounded-full h-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </Slider.Track>
          <Slider.Thumb 
            className="block w-4 h-4 bg-white shadow-md rounded-full hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-shadow cursor-grab active:cursor-grabbing" 
            aria-label="Start time"
          />
          <Slider.Thumb 
            className="block w-4 h-4 bg-white shadow-md rounded-full hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-shadow cursor-grab active:cursor-grabbing" 
            aria-label="End time"
          />
        </Slider.Root>
      </div>
    </div>
  );
};

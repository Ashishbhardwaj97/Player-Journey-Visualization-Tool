import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useTelemetryData } from '../hooks/useTelemetryData';

export const CanvasMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { currentMap, currentMatch, activeEvents, heatmapType, timeRange, setMaxTimeRange } = useAppStore();
  const { data, loading, error } = useTelemetryData();

  // Effect to calculate maxTimeRange when data or match changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const matchData = currentMatch 
      ? data.filter(d => d.m_id === currentMatch)
      : data;

    if (matchData.length === 0) return;

    let minTs = Infinity;
    let maxTs = -Infinity;
    
    for (let i = 0; i < matchData.length; i++) {
      const ts = matchData[i].ts;
      if (ts < minTs) minTs = ts;
      if (ts > maxTs) maxTs = ts;
    }
    
    if (minTs !== Infinity && maxTs !== -Infinity) {
      setMaxTimeRange([minTs, maxTs]);
    }
  }, [data, currentMatch, setMaxTimeRange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The coordinate system from pipeline.py generates pixel_x and pixel_y
    // which assume a 1024x1024 resolution.
    const VIRTUAL_SIZE = 1024;
    canvas.width = VIRTUAL_SIZE;
    canvas.height = VIRTUAL_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, VIRTUAL_SIZE, VIRTUAL_SIZE);

    const matchData = currentMatch 
      ? data.filter(d => d.m_id === currentMatch)
      : data;

    // Filter by time window
    const filteredData = matchData.filter(d => d.ts >= timeRange[0] && d.ts <= timeRange[1]);

    if (heatmapType !== 'none') {
      // HEATMAP RENDERING MODE
      ctx.globalCompositeOperation = 'screen';
      
      const heatmapPoints: { x: number, y: number }[] = [];
      
      filteredData.forEach(d => {
        if (d.x === null || d.y === null) return;
        
        if (heatmapType === 'traffic' && (d.event === 'Position' || d.event === 'BotPosition')) {
          heatmapPoints.push({ x: d.x, y: d.y });
        } else if (heatmapType === 'kills' && (d.event === 'Kill' || d.event === 'BotKill')) {
          heatmapPoints.push({ x: d.x, y: d.y });
        } else if (heatmapType === 'deaths' && (d.event === 'Killed' || d.event === 'BotKilled' || d.event === 'KilledByStorm')) {
          heatmapPoints.push({ x: d.x, y: d.y });
        }
      });

      let colorStr = '0, 255, 255'; // Cyan for traffic
      if (heatmapType === 'kills') colorStr = '255, 50, 50'; // Red for kills
      else if (heatmapType === 'deaths') colorStr = '255, 150, 0'; // Orange for deaths

      heatmapPoints.forEach(p => {
        const radius = heatmapType === 'traffic' ? 20 : 40;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        const intensity = heatmapType === 'traffic' ? 0.05 : 0.2;
        grad.addColorStop(0, `rgba(${colorStr}, ${intensity})`);
        grad.addColorStop(1, `rgba(${colorStr}, 0)`);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      ctx.globalCompositeOperation = 'source-over'; // reset to default
      return;
    }

    // STANDARD RENDERING MODE
    // Group positions by user for drawing paths
    const userPaths = new Map<string, { x: number, y: number, is_human: boolean }[]>();
    
    // Arrays for markers
    const kills: { x: number, y: number, is_human: boolean }[] = [];
    const deaths: { x: number, y: number, is_human: boolean }[] = [];
    const loots: { x: number, y: number, is_human: boolean }[] = [];
    const stormDeaths: { x: number, y: number, is_human: boolean }[] = [];

    // Process data
    filteredData.forEach((d) => {
      if (d.x === null || d.y === null) return;

      const evtType = d.event;

      if (evtType === 'Position' || evtType === 'BotPosition') {
        if (!userPaths.has(d.u_id)) {
          userPaths.set(d.u_id, []);
        }
        userPaths.get(d.u_id)!.push({ x: d.x, y: d.y, is_human: d.is_human });
      } else if ((evtType === 'Kill' || evtType === 'BotKill') && activeEvents.has('Kill')) {
        kills.push({ x: d.x, y: d.y, is_human: d.is_human });
      } else if ((evtType === 'Killed' || evtType === 'BotKilled') && activeEvents.has('Killed')) {
        deaths.push({ x: d.x, y: d.y, is_human: d.is_human });
      } else if (evtType === 'Loot' && activeEvents.has('Loot')) {
        loots.push({ x: d.x, y: d.y, is_human: d.is_human });
      } else if (evtType === 'KilledByStorm' && activeEvents.has('KilledByStorm')) {
        stormDeaths.push({ x: d.x, y: d.y, is_human: d.is_human });
      }
    });

    // 1. Draw Paths
    userPaths.forEach((path, _uid) => {
      if (path.length < 2) return;
      
      const isHuman = path[0].is_human;
      
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }

      if (isHuman) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)'; // Cyan/Blue for humans
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)'; // Red/Rose for bots
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]); // Dashed line for bots
      }
      ctx.stroke();
    });

    // Reset line dash for markers
    ctx.setLineDash([]);

    // 2. Draw Markers
    const drawMarker = (items: typeof kills, color: string, type: 'circle' | 'square' | 'cross') => {
      items.forEach((item) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        
        // Slightly fade bot markers
        ctx.globalAlpha = item.is_human ? 1.0 : 0.5;
        
        const size = item.is_human ? 6 : 4;

        ctx.beginPath();
        if (type === 'circle') {
          ctx.arc(item.x, item.y, size, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        } else if (type === 'square') {
          ctx.rect(item.x - size, item.y - size, size * 2, size * 2);
          ctx.fill();
          ctx.stroke();
        } else if (type === 'cross') {
          // X mark
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.moveTo(item.x - size, item.y - size);
          ctx.lineTo(item.x + size, item.y + size);
          ctx.moveTo(item.x + size, item.y - size);
          ctx.lineTo(item.x - size, item.y + size);
          ctx.stroke();
        }
      });
    };

    drawMarker(loots, '#3b82f6', 'square');       // Blue squares for Loot
    drawMarker(kills, '#ef4444', 'cross');        // Red crosses for Kills
    drawMarker(deaths, '#f97316', 'circle');      // Orange circles for Deaths
    drawMarker(stormDeaths, '#a855f7', 'circle'); // Purple circles for Storm Deaths

    ctx.globalAlpha = 1.0; // Reset alpha
  }, [data, currentMatch, activeEvents, heatmapType, timeRange]);

  return (
    <div className="relative w-full aspect-square max-w-4xl bg-slate-800/50 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center flex-col" ref={containerRef}>
      
      {/* Background Minimap Image */}
      <img 
        src={`/minimaps/${currentMap}_Minimap.${currentMap === 'Lockdown' ? 'jpg' : 'png'}`} 
        alt={currentMap} 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Overlay Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-indigo-300 font-medium tracking-wide animate-pulse">Loading telemetry data...</span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-900/40 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500 p-6 rounded-xl max-w-sm text-center">
            <h3 className="text-red-400 font-bold text-lg mb-2">Failed to load data</h3>
            <p className="text-slate-300 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

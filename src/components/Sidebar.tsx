import { Map, Calendar, Filter, Activity, Flame } from 'lucide-react';
import { useAppStore, type MapId, type DateStr, type EventType, type HeatmapType } from '../store/useAppStore';
import { cn } from '../lib/utils';

const MAPS: MapId[] = ['AmbroseValley', 'GrandRift', 'Lockdown'];
const DATES: DateStr[] = ['February_10', 'February_11', 'February_12', 'February_13', 'February_14'];
const EVENTS: { id: EventType; label: string; color: string }[] = [
  { id: 'Kill', label: 'Kills', color: 'bg-red-500' },
  { id: 'Killed', label: 'Deaths', color: 'bg-orange-500' },
  { id: 'Loot', label: 'Looting', color: 'bg-blue-500' },
  { id: 'KilledByStorm', label: 'Storm Deaths', color: 'bg-purple-500' },
];

const HEATMAPS: { id: HeatmapType; label: string; color: string }[] = [
  { id: 'none', label: 'None (Default)', color: 'bg-slate-500' },
  { id: 'traffic', label: 'Player Traffic', color: 'bg-cyan-500' },
  { id: 'kills', label: 'Kill Zones', color: 'bg-red-500' },
  { id: 'deaths', label: 'Death Zones', color: 'bg-orange-500' },
];

export const Sidebar: React.FC = () => {
  const { currentMap, currentDate, activeEvents, heatmapType, setMap, setDate, toggleEvent, setHeatmapType } = useAppStore();

  return (
    <div className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col p-6 overflow-y-auto text-slate-200 shadow-xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Player Journey
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">VISUALIZATION TOOL</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Map Selection */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Map className="w-4 h-4" />
            <h2 className="text-sm font-semibold tracking-wide uppercase">Select Map</h2>
          </div>
          <div className="space-y-2">
            {MAPS.map((map) => (
              <button
                key={map}
                onClick={() => setMap(map)}
                className={cn(
                  "w-full px-4 py-3 text-left rounded-xl transition-all duration-200 border",
                  currentMap === map
                    ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-300 shadow-inner"
                    : "bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                {map.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </section>

        {/* Date Selection */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Calendar className="w-4 h-4" />
            <h2 className="text-sm font-semibold tracking-wide uppercase">Timeline</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DATES.map((date) => {
              const day = date.split('_')[1];
              return (
                <button
                  key={date}
                  onClick={() => setDate(date)}
                  className={cn(
                    "px-3 py-2 text-sm text-center rounded-lg transition-all duration-200 border",
                    currentDate === date
                      ? "bg-cyan-600/10 border-cyan-500/50 text-cyan-300 shadow-inner"
                      : "bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  Feb {day}
                </button>
              );
            })}
          </div>
        </section>

        {/* Event Filters */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Filter className="w-4 h-4" />
            <h2 className="text-sm font-semibold tracking-wide uppercase">Event Filters</h2>
          </div>
          <div className="space-y-2">
            {EVENTS.map((event) => {
              const isActive = activeEvents.has(event.id);
              return (
                <button
                  key={event.id}
                  onClick={() => toggleEvent(event.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 border",
                    isActive
                      ? "bg-slate-800 border-slate-700 text-slate-200 shadow-sm"
                      : "bg-slate-800/30 border-transparent text-slate-500"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full transition-opacity", event.color, !isActive && "opacity-20")} />
                    <span className="font-medium text-sm">{event.label}</span>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    isActive ? "bg-indigo-500" : "bg-slate-700"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform",
                      isActive ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Heatmap Filters */}
        <section className="pb-8">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Flame className="w-4 h-4" />
            <h2 className="text-sm font-semibold tracking-wide uppercase">Heatmap Overlays</h2>
          </div>
          <div className="space-y-2">
            {HEATMAPS.map((heatmap) => {
              const isActive = heatmapType === heatmap.id;
              return (
                <button
                  key={heatmap.id}
                  onClick={() => setHeatmapType(heatmap.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 border",
                    isActive
                      ? "bg-slate-800 border-slate-700 text-slate-200 shadow-sm"
                      : "bg-slate-800/30 border-transparent text-slate-500 hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full transition-opacity shadow-lg", heatmap.color, !isActive && "opacity-20")} />
                    <span className="font-medium text-sm">{heatmap.label}</span>
                  </div>
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center",
                    isActive ? "border-indigo-500" : "border-slate-700"
                  )}>
                    {isActive && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

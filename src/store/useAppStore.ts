import { create } from 'zustand';

export type MapId = 'AmbroseValley' | 'GrandRift' | 'Lockdown';
export type DateStr = 'February_10' | 'February_11' | 'February_12' | 'February_13' | 'February_14';
export type EventType = 'Kill' | 'Killed' | 'Loot' | 'KilledByStorm';

export type HeatmapType = 'none' | 'traffic' | 'kills' | 'deaths';

interface AppState {
  currentMap: MapId;
  currentDate: DateStr;
  currentMatch: string | null;
  activeEvents: Set<EventType>;
  timeRange: [number, number];
  maxTimeRange: [number, number];
  heatmapType: HeatmapType;
  setMap: (map: MapId) => void;
  setDate: (date: DateStr) => void;
  setMatch: (match: string | null) => void;
  toggleEvent: (event: EventType) => void;
  setTimeRange: (range: [number, number]) => void;
  setMaxTimeRange: (range: [number, number]) => void;
  setHeatmapType: (type: HeatmapType) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentMap: 'AmbroseValley',
  currentDate: 'February_10',
  currentMatch: null,
  activeEvents: new Set(['Kill', 'Killed', 'Loot', 'KilledByStorm']),
  timeRange: [0, 100],
  maxTimeRange: [0, 100],
  heatmapType: 'none',
  setMap: (map) => set({ currentMap: map, currentMatch: null }),
  setDate: (date) => set({ currentDate: date, currentMatch: null }),
  setMatch: (match) => set({ currentMatch: match }),
  toggleEvent: (event) => set((state) => {
    const newEvents = new Set(state.activeEvents);
    if (newEvents.has(event)) {
      newEvents.delete(event);
    } else {
      newEvents.add(event);
    }
    return { activeEvents: newEvents };
  }),
  setTimeRange: (range) => set({ timeRange: range }),
  setMaxTimeRange: (range) => set({ maxTimeRange: range, timeRange: range }),
  setHeatmapType: (type) => set({ heatmapType: type }),
}));

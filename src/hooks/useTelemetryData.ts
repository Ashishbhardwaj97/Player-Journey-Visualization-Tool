import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export interface TelemetryEvent {
  u_id: string;
  m_id: string;
  event: string;
  ts: number;
  is_human: boolean;
  x: number | null;
  y: number | null;
}

export const useTelemetryData = () => {
  const { currentMap, currentDate } = useAppStore();
  const [data, setData] = useState<TelemetryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/data/${currentMap}_${currentDate}.json`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        
        if (isMounted) {
          // Sort by timestamp for accurate path drawing
          setData(json.sort((a: TelemetryEvent, b: TelemetryEvent) => a.ts - b.ts));
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to fetch telemetry data:", err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentMap, currentDate]);

  return { data, loading, error };
};

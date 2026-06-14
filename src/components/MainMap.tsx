import { useAppStore } from '../store/useAppStore';
import { CanvasMap } from './CanvasMap';
import { TimelineSlider } from './TimelineSlider';

export const MainMap: React.FC = () => {
  const { currentMap, currentDate } = useAppStore();

  return (
    <div className="flex-1 h-full bg-[#0a0f1c] relative flex items-center justify-center p-8 overflow-hidden">
      <CanvasMap />
        
      {/* State Information overlay */}
      <div className="absolute top-6 left-6 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/50 shadow-lg pointer-events-none">
        <h2 className="text-xl font-bold text-slate-200">
          {currentMap.replace(/([A-Z])/g, ' $1').trim()}
        </h2>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Date: {currentDate.replace('_', ' ')}
        </p>
      </div>

      <TimelineSlider />
    </div>
  );
};

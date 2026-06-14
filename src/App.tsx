import { Sidebar } from './components/Sidebar';
import { MainMap } from './components/MainMap';

function App() {
  return (
    <div className="flex h-screen w-full bg-[#0a0f1c] text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      <MainMap />
    </div>
  );
}

export default App;

"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      // 5-Second Killswitch for rapid loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch('/api/zones', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error('Network issue');
        const data = await res.json();
        
        setZones(data);
        setIsOffline(false);
        
        const timestamp = new Date().toLocaleTimeString();
        setLastSynced(timestamp);
        localStorage.setItem('riskRadarData', JSON.stringify(data));
        localStorage.setItem('riskRadarTimestamp', timestamp);
        
      } catch (error) {
        console.error("Uplink failed, engaging local cache:", error);
        setIsOffline(true);
        
        const cachedData = localStorage.getItem('riskRadarData');
        const cachedTime = localStorage.getItem('riskRadarTimestamp');
        
        if (cachedData) {
          setZones(JSON.parse(cachedData));
          setLastSynced(cachedTime);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
    window.addEventListener('online', fetchZones);
    window.addEventListener('offline', () => setIsOffline(true));

    return () => {
      window.removeEventListener('online', fetchZones);
      window.removeEventListener('offline', () => setIsOffline(true));
    };
  }, []);

  // In focus mode, ignore 'MODERATE' zones entirely.
  const displayZones = zones.filter(z => {
    if (focusMode && z.risk_level === 'MODERATE') return false;
    if (filter === 'ALL') return true;
    return z.risk_level === filter;
  });

  return (
    <main className={`min-h-screen font-mono transition-colors duration-500 ${focusMode ? 'bg-zinc-950 p-2' : 'bg-black p-4 md:p-8'}`}>
      <div className={`mx-auto ${focusMode ? 'max-w-[95%]' : 'max-w-7xl'}`}>
        
        {/* Header - Hides during Focus Mode */}
        {!focusMode && (
          <header className="mb-6 border-b border-green-900/50 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-widest drop-shadow-[0_0_10px_rgba(0,255,0,0.2)]">
                RISK<span className="text-green-500">_RADAR</span>
              </h1>
              <p className="text-xs md:text-sm text-green-700 mt-2 font-semibold">SMART MOBILITY // HIGH-RISK ZONE TELEMETRY SYSTEM</p>
            </div>
            
            <div className="text-left md:text-right border border-green-900/30 p-3 bg-green-950/10 rounded-sm">
              <div className="flex items-center gap-2 justify-start md:justify-end">
                <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(0,255,0,0.8)] animate-pulse'}`}></div>
                <p className={`text-xs font-bold tracking-wider ${isOffline ? 'text-red-500' : 'text-green-500'}`}>
                  {isOffline ? 'SYSTEM OFFLINE // LOCAL CACHE' : 'LIVE TELEMETRY // MONGODB'}
                </p>
              </div>
              <p className="text-[10px] text-green-800 mt-1">LAST SYNC: {lastSynced || 'AWAITING UPLINK...'}</p>
            </div>
          </header>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-2 items-center justify-between bg-zinc-900/40 p-2 rounded-sm border border-zinc-800/50">
          <div className="flex gap-2 overflow-x-auto">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filter === 'ALL' ? 'bg-green-600 text-black' : 'bg-black text-green-600 border border-green-900/50 hover:bg-green-950/30'}`}>ALL</button>
            <button onClick={() => setFilter('CRITICAL')} className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filter === 'CRITICAL' ? 'bg-red-600 text-black' : 'bg-black text-red-600 border border-red-900/50 hover:bg-red-950/30'}`}>CRITICAL</button>
            <button onClick={() => setFilter('HIGH')} className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filter === 'HIGH' ? 'bg-orange-500 text-black' : 'bg-black text-orange-500 border border-orange-900/50 hover:bg-orange-950/30'}`}>HIGH</button>
          </div>
          
          <button 
            onClick={() => setFocusMode(!focusMode)} 
            className={`px-6 py-2 text-xs font-bold tracking-widest border transition-all ${focusMode ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black text-gray-400 border-gray-700 hover:text-white hover:border-gray-500'}`}
          >
            {focusMode ? 'EXIT FOCUS MODE' : 'TACTICAL FOCUS MODE'}
          </button>
        </div>

        {/* Data Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-32 space-y-4">
            <div className="w-16 h-16 border-4 border-green-900 border-t-green-500 rounded-full animate-spin"></div>
            <div className="animate-pulse text-xl tracking-widest text-green-600 font-bold">ESTABLISHING SECURE UPLINK...</div>
          </div>
        ) : (
          <div className={`grid gap-4 ${focusMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
            {displayZones.map((zone) => (
              <div key={zone.id} className={`bg-black border p-5 relative overflow-hidden transition-all duration-300 ${
                zone.risk_level === 'CRITICAL' ? 'border-red-900/50 hover:border-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,0.15)]' : 
                zone.risk_level === 'HIGH' ? 'border-orange-900/50 hover:border-orange-500 hover:shadow-[0_0_20px_rgba(255,165,0,0.1)]' : 
                'border-green-900/30 hover:border-green-500/50'
              } ${focusMode ? 'p-8 scale-[1.02]' : ''}`}>
                
                {/* Risk Strip */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  zone.risk_level === 'CRITICAL' ? 'bg-red-600 shadow-[0_0_10px_rgba(255,0,0,1)]' : 
                  zone.risk_level === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
                }`}></div>

                <div className="pl-4">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className={`font-black text-white tracking-widest ${focusMode ? 'text-3xl' : 'text-xl'}`}>{zone.id}</h2>
                    <span className={`px-2 py-1 text-[10px] font-bold tracking-widest ${
                      zone.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-500 animate-pulse' : 
                      zone.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400' : 
                      'bg-yellow-950/30 text-yellow-500'
                    }`}>
                      {zone.risk_level}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm tracking-wide text-gray-300">
                    <p className="flex items-center gap-2"><span className="text-gray-600 text-xs w-16">LOC:</span> <span className="font-semibold text-gray-100">{zone.location}</span></p>
                    <p className="flex items-center gap-2"><span className="text-gray-600 text-xs w-16">COORD:</span> <span className="font-mono text-gray-400">{zone.coordinates.lat}, {zone.coordinates.lng}</span></p>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-900">
                      <p className="text-gray-500 text-[10px] mb-1 tracking-widest">CONTEXT_FACTOR</p>
                      <p className="text-white font-medium">{zone.real_time_factor}</p>
                    </div>
                    
                    <div className={`p-3 mt-4 rounded-sm border-l-2 bg-gradient-to-r ${
                      zone.risk_level === 'CRITICAL' ? 'border-red-500 from-red-950/40 to-transparent' : 
                      'border-orange-500 from-orange-950/20 to-transparent'
                    }`}>
                      <p className={`text-xs font-bold tracking-wide ${zone.risk_level === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`}>
                        WARNING: {zone.warning_message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
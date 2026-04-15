"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [disasterMode, setDisasterMode] = useState(false);
  
  // Feature 1 & 2: Live Ticker & Night Ops
  const [liveLog, setLiveLog] = useState("SYSTEM INITIALIZED...");
  const hour = new Date().getHours();
  const isNightOps = hour < 6 || hour > 18;

  useEffect(() => {
    // Feature 1: Live Ticker Simulation
    const actions = [
      "INGESTING WEATHER API...", "SCANNING TRAFFIC CAM FEED 04...", 
      "CALCULATING COLLISION PROBABILITY...", "UPDATING SATELLITE TELEMETRY...",
      "MONITORING WATERLOGGING SENSORS..."
    ];
    const logInterval = setInterval(() => {
      setLiveLog(`${actions[Math.floor(Math.random() * actions.length)]} [${new Date().toLocaleTimeString()}]`);
    }, 3500);

    const fetchZones = async () => {
      try {
        const res = await fetch('/api/zones');
        if (!res.ok) throw new Error('Network issue');
        const data = await res.json();
        setZones(data);
        setIsOffline(false);
        const timestamp = new Date().toLocaleTimeString();
        setLastSynced(timestamp);
        localStorage.setItem('riskRadarData', JSON.stringify(data));
        localStorage.setItem('riskRadarTimestamp', timestamp);
      } catch (error) {
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
    return () => clearInterval(logInterval);
  }, []);

  // Feature 3: Dispatch System
  const handleDispatch = (zone) => {
    const dispatchText = `DISPATCH // ZONE: ${zone.id} // LOC: ${zone.location} // COORD: ${zone.coordinates.lat},${zone.coordinates.lng} // THREAT: ${zone.risk_level}`;
    navigator.clipboard.writeText(dispatchText);
    alert(`COPIED TO SECURE CLIPBOARD:\n${dispatchText}`);
  };

  const displayZones = zones.filter(z => {
    if (disasterMode && z.risk_level === 'MODERATE') return false;
    if (filter === 'ALL') return true;
    return z.risk_level === filter;
  });

  return (
    <main className={`min-h-screen font-mono transition-colors duration-700 ${disasterMode ? 'bg-red-950/20' : 'bg-black'} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-4 border-b border-green-900/50 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className={`text-4xl md:text-5xl font-extrabold tracking-widest ${disasterMode ? 'text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]' : 'text-white drop-shadow-[0_0_10px_rgba(0,255,0,0.2)]'}`}>
              RISK<span className={disasterMode ? 'text-white' : 'text-green-500'}>_RADAR</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-2 font-semibold">CODE RUPTORS // SMART MOBILITY ENGINE</p>
          </div>
          
          <div className="text-left md:text-right border border-zinc-800 p-3 bg-zinc-950/50 rounded-sm">
            <div className="flex items-center gap-2 justify-start md:justify-end">
              <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
              <p className={`text-xs font-bold tracking-wider ${isOffline ? 'text-red-500' : 'text-green-500'}`}>
                {isOffline ? 'SYSTEM OFFLINE // CACHE' : 'LIVE UPLINK // MONGODB'}
              </p>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">LAST SYNC: {lastSynced || 'AWAITING...'}</p>
          </div>
        </header>

        {/* Feature 1 & 2 UI: Live Ticker & Night Ops */}
        <div className="mb-6 flex flex-col md:flex-row gap-2 justify-between items-center text-[10px] md:text-xs font-bold tracking-widest">
          <div className="w-full md:w-2/3 bg-zinc-900 border border-zinc-700 p-2 text-green-400 overflow-hidden whitespace-nowrap">
            &gt; _TERMINAL: <span className="animate-pulse">{liveLog}</span>
          </div>
          <div className={`w-full md:w-1/3 border p-2 text-center ${isNightOps ? 'bg-orange-950/30 text-orange-400 border-orange-800' : 'bg-blue-950/30 text-blue-400 border-blue-800'}`}>
            {isNightOps ? '⚠️ NIGHT OPS ACTIVE: VISIBILITY LOW' : 'DAYLIGHT OPS: VISIBILITY OPTIMAL'}
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-2 items-center justify-between bg-zinc-900/40 p-2 rounded-sm border border-zinc-800/50">
          <div className="flex gap-2 overflow-x-auto">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filter === 'ALL' ? 'bg-zinc-700 text-white' : 'bg-black text-gray-500 border border-zinc-800 hover:bg-zinc-900'}`}>ALL</button>
            <button onClick={() => setFilter('CRITICAL')} className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filter === 'CRITICAL' ? 'bg-red-600 text-black' : 'bg-black text-red-600 border border-red-900/50 hover:bg-red-950/30'}`}>CRITICAL</button>
            <button onClick={() => setFilter('HIGH')} className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filter === 'HIGH' ? 'bg-orange-500 text-black' : 'bg-black text-orange-500 border border-orange-900/50 hover:bg-orange-950/30'}`}>HIGH</button>
          </div>
          
          {/* Feature 5: Disaster Override Protocol */}
          <button 
            onClick={() => { setDisasterMode(!disasterMode); if(!disasterMode) setFilter('ALL'); }} 
            className={`px-6 py-2 text-xs font-black tracking-widest border-2 transition-all ${disasterMode ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse' : 'bg-black text-red-700 border-red-900 hover:text-red-500'}`}
          >
            {disasterMode ? 'CANCEL OVERRIDE' : 'DISASTER OVERRIDE PROTOCOL'}
          </button>
        </div>

        {/* Data Grid */}
        {loading ? (
          <div className="text-center mt-32 animate-pulse text-xl tracking-widest text-green-600 font-bold">ESTABLISHING SECURE UPLINK...</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {displayZones.map((zone) => (
              <div key={zone.id} className={`bg-black border p-6 relative group transition-all duration-300 ${
                zone.risk_level === 'CRITICAL' ? 'border-red-900/50' : 
                zone.risk_level === 'HIGH' ? 'border-orange-900/50' : 'border-zinc-800'
              }`}>
                
                {/* Feature 4: Critical Threat Sonar */}
                {zone.risk_level === 'CRITICAL' && (
                  <div className="absolute inset-0 border-2 border-red-500 opacity-20 animate-ping rounded-sm pointer-events-none"></div>
                )}

                <div className={`absolute top-0 left-0 w-1 h-full ${
                  zone.risk_level === 'CRITICAL' ? 'bg-red-600 shadow-[0_0_10px_rgba(255,0,0,1)]' : 
                  zone.risk_level === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-600'
                }`}></div>

                <div className="pl-2">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="font-black text-white text-2xl tracking-widest">{zone.id}</h2>
                    <span className={`px-2 py-1 text-[10px] font-bold tracking-widest ${
                      zone.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-500' : 
                      zone.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400' : 'bg-yellow-950/30 text-yellow-600'
                    }`}>
                      {zone.risk_level}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm tracking-wide text-gray-400">
                    <p><span className="text-gray-600 text-xs">LOC:</span> <span className="text-gray-200">{zone.location}</span></p>
                    <p><span className="text-gray-600 text-xs">COORD:</span> {zone.coordinates.lat}, {zone.coordinates.lng}</p>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-900">
                      <p className="text-gray-600 text-[10px] mb-1 tracking-widest">REAL-TIME FACTOR</p>
                      <p className="text-white font-medium">{zone.real_time_factor}</p>
                    </div>
                    
                    <div className={`p-3 mt-4 rounded-sm border-l-2 bg-gradient-to-r ${
                      zone.risk_level === 'CRITICAL' ? 'border-red-500 from-red-950/40 to-transparent' : 
                      'border-orange-500 from-orange-950/20 to-transparent'
                    }`}>
                      <p className={`text-[11px] font-bold tracking-wide ${zone.risk_level === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`}>
                        WARNING: {zone.warning_message}
                      </p>
                    </div>

                    {/* Feature 3 UI: Dispatch Button */}
                    <button 
                      onClick={() => handleDispatch(zone)}
                      className="w-full mt-4 py-2 text-[10px] font-bold tracking-widest border border-zinc-700 text-zinc-400 hover:bg-white hover:text-black transition-colors"
                    >
                      SEND TO DISPATCH TERMINAL
                    </button>
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
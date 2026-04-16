"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TacticalMap = dynamic(() => import('../components/TacticalMap'), { 
  ssr: false,
  loading: () => <div className="h-[350px] w-full border border-zinc-800 bg-zinc-950 flex items-center justify-center text-green-500 animate-pulse text-xs tracking-widest mb-6">ESTABLISHING SATELLITE CONNECTION...</div>
});

export default function Home() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [disasterMode, setDisasterMode] = useState(false);
  
  const [liveLog, setLiveLog] = useState("SYSTEM_KERNEL_READY");
  const hour = new Date().getHours();
  const isNightOps = hour < 6 || hour > 18;

  const [ping, setPing] = useState(12);
  const [uptime, setUptime] = useState(0);
  const [booting, setBooting] = useState(true);

  const fetchZones = async (isInitial = false) => {
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
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    const bootTimer = setTimeout(() => setBooting(false), 1500);
    const actions = ["INGESTING WEATHER API...", "SCANNING TRAFFIC CAM FEED 04...", "CALCULATING COLLISION PROBABILITY...", "UPDATING SATELLITE TELEMETRY...", "MONITORING WATERLOGGING SENSORS..."];
    
    const uiInterval = setInterval(() => {
      setLiveLog(`${actions[Math.floor(Math.random() * actions.length)]} [${new Date().toLocaleTimeString()}]`);
      setPing(Math.floor(Math.random() * (45 - 8 + 1) + 8));
      setUptime(prev => prev + 1);
    }, 1000);

    fetchZones(true);
    const pollInterval = setInterval(() => fetchZones(false), 10000);

    return () => {
      clearInterval(uiInterval);
      clearInterval(pollInterval);
      clearTimeout(bootTimer);
    };
  }, []);

  const handleDispatch = (zone) => {
    const dispatchText = `DISPATCH // ZONE: ${zone.id} // LOC: ${zone.location} // COORD: ${zone.coordinates.lat},${zone.coordinates.lng} // THREAT: ${zone.risk_level}`;
    navigator.clipboard.writeText(dispatchText);
    alert(`COPIED TO SECURE CLIPBOARD:\n${dispatchText}`);
  };

  const exportTelemetry = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(zones, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "risk_radar_telemetry_dump.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const reportHazard = async () => {
    const loc = window.prompt("ENTER ACCIDENT LOCATION NAME:");
    const accidents = window.prompt("NUMBER OF ACCIDENTS DETECTED:");
    
    if (loc && accidents) {
      const accCount = parseInt(accidents);
      let score = Math.min(accCount * 2, 60); 
      if (isNightOps) score += 15;
      score += 25; 
      const finalScore = Math.min(score, 100);

      const newEntry = {
        id: `Z-0${zones.length + 1}`,
        location: loc,
        coordinates: { lat: (13.0 + Math.random() * 0.1).toFixed(4), lng: (80.2 + Math.random() * 0.1).toFixed(4) },
        risk_level: finalScore > 80 ? "CRITICAL" : finalScore > 50 ? "HIGH" : "MODERATE",
        risk_score: finalScore,
        historical_accidents: accCount,
        real_time_factor: "LIVE_REPORT_VERIFIED",
        warning_message: "Emergency response units notified. Proceed with caution."
      };

      try {
        const res = await fetch('/api/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry)
        });
        if (res.ok) {
          alert(`UPLINK SUCCESSFUL: RISK SCORE: ${finalScore}/100`);
          fetchZones(false);
        }
      } catch (err) {
        alert("UPLINK FAILED");
      }
    }
  };

  const displayZones = zones.filter(z => {
    if (disasterMode && z.risk_level === 'MODERATE') return false;
    if (filter === 'ALL') return true;
    return z.risk_level === filter;
  });

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const chartData = [
    { name: 'CRITICAL', count: displayZones.filter(z => z.risk_level === 'CRITICAL').length, color: '#dc2626' },
    { name: 'HIGH', count: displayZones.filter(z => z.risk_level === 'HIGH').length, color: '#f97316' },
    { name: 'MODERATE', count: displayZones.filter(z => z.risk_level === 'MODERATE').length, color: '#ca8a04' },
  ];

  if (booting) {
    return (
      <main className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-start justify-end p-8 pb-20">
        <div className="animate-pulse space-y-2">
          <p>&gt; MOUNTING VIRTUAL FILESYSTEM...</p>
          <p>&gt; ESTABLISHING MONGODB UPLINK...</p>
          <p>&gt; DECRYPTING TELEMETRY STREAMS...</p>
          <p className="font-bold text-white">&gt; LAUNCHING RISK_RADAR KERNEL <span className="animate-ping">█</span></p>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen font-mono transition-colors duration-700 selection:bg-green-500 selection:text-black ${disasterMode ? 'bg-red-950/20' : 'bg-black'} p-4 md:p-8 relative`}>
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-4 border-b border-green-900/50 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className={`text-4xl md:text-5xl font-extrabold tracking-widest ${disasterMode ? 'text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]' : 'text-white drop-shadow-[0_0_10px_rgba(0,255,0,0.2)]'}`}>
              RISK<span className={disasterMode ? 'text-white' : 'text-green-500'}>_RADAR</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-2 font-semibold">CODE RUPTORS // SMART MOBILITY ENGINE</p>
          </div>
          <div className="text-left md:text-right border border-zinc-800 p-3 bg-zinc-950/50 rounded-sm min-w-[200px]">
            <div className="flex items-center gap-2 justify-start md:justify-end">
              <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
              <p className={`text-xs font-bold tracking-wider ${isOffline ? 'text-red-500' : 'text-green-500'}`}>{isOffline ? 'OFFLINE // CACHE' : 'LIVE // POLLING ACTIVE'}</p>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">LAST SYNC: {lastSynced}</p>
            <div className="flex justify-between md:justify-end gap-4 mt-1">
              <p className={`text-[10px] font-bold ${ping > 30 ? 'text-yellow-500' : 'text-green-700'}`}>PING: {ping}ms</p>
              <p className="text-[10px] text-blue-500 font-bold">UPTIME: {formatTime(uptime)}</p>
            </div>
          </div>
        </header>

        <div className="mb-4 flex flex-col md:flex-row gap-2 justify-between items-center text-[10px] md:text-xs font-bold tracking-widest">
          <div className="w-full md:w-2/3 bg-zinc-900 border border-zinc-700 p-2 text-green-400 overflow-hidden whitespace-nowrap flex items-center">
            <span>&gt; _TERMINAL: {liveLog}</span><span className="ml-1 animate-pulse text-green-500">█</span>
          </div>
          <div className={`w-full md:w-1/3 border p-2 text-center ${isNightOps ? 'bg-orange-950/30 text-orange-400 border-orange-800' : 'bg-blue-950/30 text-blue-400 border-blue-800'}`}>{isNightOps ? '⚠️ NIGHT OPS: VISIBILITY LOW' : 'DAYLIGHT OPS: VISIBILITY OPTIMAL'}</div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 border-b border-zinc-800/50 border-dashed">
          <button onClick={toggleFullScreen} className="px-3 py-1 text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-700 hover:text-white">[_FULLSCREEN_]</button>
          <button onClick={exportTelemetry} className="px-3 py-1 text-[10px] bg-blue-950/30 text-blue-400 border border-blue-900 hover:bg-blue-900 hover:text-white">DOWNLOAD_TELEMETRY.JSON</button>
          <button onClick={reportHazard} className="px-3 py-1 text-[10px] bg-orange-950/30 text-orange-400 border border-orange-900 hover:bg-orange-900 hover:text-white">⚠️ REPORT_ANOMALY</button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 items-center justify-between bg-zinc-900/40 p-2 rounded-sm border border-zinc-800/50">
          <div className="flex gap-2 overflow-x-auto">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filter === 'ALL' ? 'bg-zinc-700 text-white' : 'bg-black text-gray-500 border border-zinc-800 hover:bg-zinc-900'}`}>ALL</button>
            <button onClick={() => setFilter('CRITICAL')} className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filter === 'CRITICAL' ? 'bg-red-600 text-black' : 'bg-black text-red-600 border border-red-900/50 hover:bg-red-950/30'}`}>CRITICAL</button>
            <button onClick={() => setFilter('HIGH')} className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filter === 'HIGH' ? 'bg-orange-500 text-black' : 'bg-black text-orange-500 border border-orange-900/50 hover:bg-orange-950/30'}`}>HIGH</button>
          </div>
          <button onClick={() => { setDisasterMode(!disasterMode); if(!disasterMode) setFilter('ALL'); }} className={`px-6 py-2 text-xs font-black tracking-widest border-2 transition-all ${disasterMode ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse' : 'bg-black text-red-700 border-red-900 hover:text-red-500'}`}>{disasterMode ? 'CANCEL OVERRIDE' : 'DISASTER OVERRIDE PROTOCOL'}</button>
        </div>

        {loading ? (
          <div className="text-center mt-32 animate-pulse text-xl tracking-widest text-green-600 font-bold">ESTABLISHING SECURE UPLINK...</div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-blue-900 bg-blue-950/20 p-4 rounded-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-blue-500 font-bold text-[10px] tracking-widest mb-2">ATMOSPHERIC SENSORS // CHENNAI</h3>
                  <div className="flex justify-between text-xs text-blue-300 font-bold">
                    <p>TEMP: 31°C</p><p>HUMIDITY: 88%</p><p>VIS: 4.2km</p>
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-yellow-500 animate-pulse border-t border-blue-900/50 pt-2">⚠️ WARNING: MONSOON DEPRESSION DETECTED.</p>
              </div>
              <div className="md:col-span-2 border border-zinc-800 bg-zinc-900/40 p-4 rounded-sm h-[120px]">
                <h3 className="text-gray-400 font-bold text-[10px] tracking-widest mb-2 flex justify-between"><span>LIVE THREAT ANALYTICS</span><span>TOTAL: {displayZones.length}</span></h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <Tooltip cursor={{fill: '#27272a'}} contentStyle={{backgroundColor: '#000', borderColor: '#3f3f46', fontSize: '10px'}} />
                    <Bar dataKey="count" barSize={20} radius={[0, 4, 4, 0]}>{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {displayZones.length > 0 && <TacticalMap zones={displayZones} />}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {displayZones.map((zone) => (
                <div key={zone.id} className={`bg-black border p-6 relative group transition-all duration-300 ${zone.risk_level === 'CRITICAL' ? 'border-red-900/50' : zone.risk_level === 'HIGH' ? 'border-orange-900/50' : 'border-zinc-800'}`}>
                  <div className="absolute top-4 right-4 flex flex-col items-center">
                    <span className={`text-2xl font-black ${zone.risk_score > 80 ? 'text-red-500' : zone.risk_score > 50 ? 'text-orange-500' : 'text-yellow-500'}`}>
                      {zone.risk_score || (zone.risk_level === 'CRITICAL' ? 88 : zone.risk_level === 'HIGH' ? 62 : 35)}
                    </span>
                    <span className="text-[8px] text-zinc-600 tracking-tighter">THREAT_INDEX</span>
                  </div>
                  {zone.risk_level === 'CRITICAL' && <div className="absolute inset-0 border-2 border-red-500 opacity-20 animate-ping rounded-sm pointer-events-none"></div>}
                  <div className={`absolute top-0 left-0 w-1 h-full ${zone.risk_level === 'CRITICAL' ? 'bg-red-600 shadow-[0_0_10px_rgba(255,0,0,1)]' : zone.risk_level === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-600'}`}></div>
                  <div className="pl-2">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="font-black text-white text-2xl tracking-widest before:content-[''] group-hover:before:content-['['] before:text-green-500 before:mr-1 after:content-[''] group-hover:after:content-[']'] after:text-green-500 after:ml-1 transition-all">{zone.id}</h2>
                    </div>
                    <div className="w-full bg-zinc-900 h-1 mb-4 overflow-hidden">
                      <div className={`h-full ${zone.risk_level === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-500'}`} style={{ width: `${zone.risk_score || (zone.risk_level === 'CRITICAL' ? 88 : 62)}%` }}></div>
                    </div>
                    <div className="space-y-3 text-sm tracking-wide text-gray-400">
                      <p><span className="text-gray-600 text-xs font-bold">ACCIDENTS:</span> <span className="text-gray-200">{zone.historical_accidents}</span></p>
                      <p><span className="text-gray-600 text-xs">LOC:</span> <span className="text-gray-200">{zone.location}</span></p>
                      <div className={`p-3 mt-4 rounded-sm border-l-2 bg-gradient-to-r ${zone.risk_level === 'CRITICAL' ? 'border-red-500 from-red-950/40 to-transparent' : 'border-orange-500 from-orange-950/20 to-transparent'}`}>
                        <p className={`text-[11px] font-bold tracking-wide ${zone.risk_level === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`}>WARNING: {zone.warning_message}</p>
                      </div>
                      <button onClick={() => handleDispatch(zone)} className="w-full mt-4 py-2 text-[10px] font-bold tracking-widest border border-zinc-700 text-zinc-400 hover:bg-white hover:text-black transition-colors">SEND TO DISPATCH TERMINAL</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

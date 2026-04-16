"use client";
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from 'recharts';

// --- QUEST 1: SATELLITE MAP UPLINK (DYNAMIC TO PREVENT VERCEL CRASH) ---
const TacticalMap = dynamic(() => import('../components/TacticalMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center text-green-500 animate-pulse text-xs tracking-[0.3em] mb-6">
      <p>ESTABLISHING SATELLITE CONNECTION...</p>
      <p className="mt-2 text-[8px]">HANDSHAKE_PROTOCOL_v4.2</p>
    </div>
  )
});

export default function Home() {
  // --- CORE SYSTEM STATE ---
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [disasterMode, setDisasterMode] = useState(false);
  
  // --- AESTHETIC & TELEMETRY STATE ---
  const [liveLog, setLiveLog] = useState("SYSTEM_KERNEL_READY");
  const [ping, setPing] = useState(12);
  const [uptime, setUptime] = useState(0);
  const [booting, setBooting] = useState(true);
  const hour = new Date().getHours();
  const isNightOps = hour < 6 || hour > 18;

  // --- QUEST 3: ALERT SUBSYSTEM (ANTI-SPAM LOGIC) ---
  const processedAlerts = useRef(new Set());

  // --- QUEST 1 & 2: DATA INGESTION & POLLING ---
  const fetchZones = async (isInitial = false) => {
    try {
      const res = await fetch('/api/zones');
      if (!res.ok) throw new Error('Network fail');
      const data = await res.json();
      
      setZones(data);
      setIsOffline(false);
      setLastSynced(new Date().toLocaleTimeString());

      // QUEST 3: MONITOR FOR NEW CRITICAL THREATS
      data.forEach(zone => {
        const zoneId = zone._id || zone.id;
        if (zone.risk_level === 'CRITICAL' && !processedAlerts.current.has(zoneId)) {
          triggerAlertNotification(zone);
          processedAlerts.current.add(zoneId);
        }
      });

    } catch (error) {
      console.error("UPLINK_ERROR:", error);
      setIsOffline(true);
      // Local Cache Fallback
      const cached = localStorage.getItem('riskRadarData');
      if (cached) setZones(JSON.parse(cached));
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const triggerAlertNotification = (zone) => {
    setLiveLog(`🚨 CRITICAL_ALERT: ${zone.location} // THREAT_LEVEL_MAX`);
    if (Notification.permission === "granted") {
      new Notification("RISK RADAR: CRITICAL THREAT", {
        body: `Zone ${zone.id} (${zone.location}) requires immediate dispatch.`,
        icon: "/favicon.ico"
      });
    }
  };

  // --- SYSTEM LIFECYCLE ---
  useEffect(() => {
    // Request Quest 3 Permissions
    if (Notification.permission !== "granted") Notification.requestPermission();

    // Aesthetic Boot Timer
    const bootTimer = setTimeout(() => setBooting(false), 2000);

    // Terminal & Telemetry Ticker
    const tickerInterval = setInterval(() => {
      const actions = ["SCANNING SENSORS...", "ENCRYPTING STREAMS...", "SYNCING DB...", "FILTERING NOISE..."];
      setLiveLog(`${actions[Math.floor(Math.random() * actions.length)]} [${new Date().toLocaleTimeString()}]`);
      setPing(Math.floor(Math.random() * (45 - 8 + 1) + 8));
      setUptime(prev => prev + 1);
    }, 1500);

    // Initial Fetch + 10s Background Polling (Quest 1)
    fetchZones(true);
    const pollInterval = setInterval(() => fetchZones(false), 10000);

    return () => {
      clearInterval(tickerInterval);
      clearInterval(pollInterval);
      clearTimeout(bootTimer);
    };
  }, []);

  // --- INTERACTION LOGIC ---
  const reportHazard = async () => {
    const loc = window.prompt("ENTER ACCIDENT LOCATION NAME:");
    const accidents = window.prompt("NUMBER OF ACCIDENTS DETECTED:");
    
    if (loc && accidents) {
      const accCount = parseInt(accidents);
      
      // QUEST 2: MATHEMATICAL SCORING ENGINE
      let score = Math.min(accCount * 2.5, 60); // Historical weight
      if (isNightOps) score += 15;              // Visibility penalty
      score += 25;                              // Monsoon/Static penalty
      const finalScore = Math.floor(Math.min(score, 100));

      const newEntry = {
        id: `Z-0${zones.length + 1}`,
        location: loc,
        coordinates: { 
          lat: (13.04 + Math.random() * 0.08).toFixed(4), 
          lng: (80.20 + Math.random() * 0.08).toFixed(4) 
        },
        risk_level: finalScore > 80 ? "CRITICAL" : finalScore > 50 ? "HIGH" : "MODERATE",
        risk_score: finalScore,
        historical_accidents: accCount,
        real_time_factor: "LIVE_FIELD_REPORT",
        warning_message: "Emergency response required. Unit dispatch recommended."
      };

      try {
        const res = await fetch('/api/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry)
        });
        if (res.ok) {
          alert(`UPLINK SUCCESS: Threat Index ${finalScore}/100`);
          fetchZones(false);
        }
      } catch (err) { alert("UPLINK_FAILED"); }
    }
  };

  const exportTelemetry = () => {
    const dataUri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(zones, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dataUri);
    link.setAttribute("download", "telemetry_dump.json");
    link.click();
  };

  // --- QUEST 1: CHART DATA AGGREGATION ---
  const chartData = [
    { name: 'CRIT', count: zones.filter(z => z.risk_level === 'CRITICAL').length, color: '#ef4444' },
    { name: 'HIGH', count: zones.filter(z => z.risk_level === 'HIGH').length, color: '#f97316' },
    { name: 'MOD', count: zones.filter(z => z.risk_level === 'MODERATE').length, color: '#eab308' },
  ];

  // --- AESTHETIC RENDER: SECURE BOOT ---
  if (booting) {
    return (
      <main className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-start justify-end p-12 pb-24 italic uppercase tracking-widest text-xs">
        <div className="space-y-2 animate-pulse">
          <p>&gt; MOUNTING_ENCRYPTED_FILESYSTEM...</p>
          <p>&gt; INITIALIZING_RECHARTS_MATRIX...</p>
          <p>&gt; CONNECTING_MONGODB_UPLINK_v3...</p>
          <p>&gt; NOTIFICATION_SUBSYSTEM_READY...</p>
          <p className="font-bold text-white mt-4">&gt; CODE_RUPTORS_KERNEL_LOADED [READY] █</p>
        </div>
      </main>
    );
  }

  // --- MAIN DASHBOARD RENDER ---
  return (
    <main className={`min-h-screen font-mono transition-all duration-1000 selection:bg-green-500 selection:text-black ${disasterMode ? 'bg-red-950/20' : 'bg-black'} p-4 md:p-10 relative overflow-x-hidden`}>
      
      {/* AESTHETIC: CRT SCANLINES OVERLAY */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,2px_100%] opacity-30"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <header className="mb-6 border-b border-green-900/40 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className={`text-4xl md:text-6xl font-black tracking-tighter ${disasterMode ? 'text-red-500' : 'text-white'}`}>
              RISK<span className={disasterMode ? 'text-white animate-pulse' : 'text-green-500'}>_RADAR</span>
            </h1>
            <p className="text-[10px] md:text-xs text-zinc-500 mt-2 font-bold tracking-[0.4em] uppercase">Tactical Smart Mobility Engine // Seven Digit Syntax</p>
          </div>
          
          <div className="border border-zinc-800 p-4 bg-zinc-950/80 rounded-sm min-w-[240px]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-600' : 'bg-green-500 animate-pulse'}`}></div>
              <p className={`text-[10px] font-black tracking-widest uppercase ${isOffline ? 'text-red-600' : 'text-green-500'}`}>
                {isOffline ? 'OFFLINE_CACHE_ACTIVE' : 'LIVE_CLOUD_POLLING_v3'}
              </p>
            </div>
            <div className="flex justify-between mt-3 text-[9px] text-zinc-500 font-bold uppercase">
              <p>PING: {ping}ms</p>
              <p>UPTIME: {uptime}s</p>
            </div>
            <p className="text-[9px] text-zinc-600 mt-1 uppercase">LAST_SYNC: {lastSynced}</p>
          </div>
        </header>

        {/* SUB-HEADER: TERMINAL & OPS WEATHER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8 text-[10px] font-bold tracking-widest">
          <div className="md:col-span-3 bg-zinc-900/80 border border-zinc-800 p-3 text-green-500 flex items-center shadow-inner">
            <span className="opacity-50 mr-2">&gt;</span> <span>_TERMINAL: {liveLog}</span><span className="ml-1 animate-pulse">█</span>
          </div>
          <div className={`border p-3 text-center uppercase ${isNightOps ? 'bg-orange-950/20 text-orange-500 border-orange-900' : 'bg-blue-950/20 text-blue-500 border-blue-900'}`}>
            {isNightOps ? '⚠️ NIGHT_OPS: LOW_VIS' : 'DAYLIGHT_OPS: OPTIMAL'}
          </div>
        </div>

        {/* ACTION PANEL */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button onClick={exportTelemetry} className="px-4 py-2 text-[10px] font-black bg-blue-950/10 text-blue-400 border border-blue-900/50 hover:bg-blue-600 hover:text-white transition-all">DOWNLOAD_LOGS</button>
          <button onClick={reportHazard} className="px-4 py-2 text-[10px] font-black bg-orange-950/10 text-orange-400 border border-orange-900/50 hover:bg-orange-600 hover:text-white transition-all">⚠️ REPORT_HAZARD</button>
          <div className="flex-grow"></div>
          <button 
            onClick={() => setDisasterMode(!disasterMode)} 
            className={`px-6 py-2 text-[10px] font-black border-2 transition-all ${disasterMode ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(255,0,0,0.4)] animate-pulse' : 'bg-black text-red-900 border-red-900 hover:text-red-500'}`}
          >
            {disasterMode ? 'TERMINATE_OVERRIDE' : 'DISASTER_OVERRIDE_PROTOCOL'}
          </button>
        </div>

        {/* --- QUEST 1 & 2: ANALYTICS & SCORING UI --- */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-green-600 animate-pulse font-black tracking-[1em]">INITIALIZING_UPLINK...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* ENVIRONMENTAL SENSORS */}
              <div className="border border-zinc-800 bg-zinc-950/50 p-5 rounded-sm">
                <h3 className="text-zinc-500 font-bold text-[9px] tracking-widest mb-4 uppercase">ATMOSPHERIC_SENSORS // CHENNAI_METRO</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-zinc-300"><span>TEMP</span><span>31°C</span></div>
                  <div className="flex justify-between text-xs font-bold text-zinc-300"><span>HUMIDITY</span><span>88%</span></div>
                  <div className="flex justify-between text-xs font-bold text-zinc-300"><span>VISIBILITY</span><span>4.2KM</span></div>
                </div>
                <div className="mt-5 pt-3 border-t border-zinc-900 animate-pulse">
                  <p className="text-[9px] text-yellow-500 font-black">⚠️ WARNING: MONSOON_FLOW_DETECTED</p>
                </div>
              </div>
              
              {/* QUEST 1: RECHARTS THREAT CHART */}
              <div className="md:col-span-2 border border-zinc-800 bg-zinc-950/50 p-5 rounded-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-zinc-500 font-bold text-[9px] tracking-widest uppercase">LIVE_THREAT_DISTRIBUTION_MATRIX</h3>
                  <span className="text-[9px] text-green-600 font-black tracking-widest">REAL_TIME_STREAMING</span>
                </div>
                <div className="h-[80px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" hide />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#000', border: '1px solid #27272a', fontSize: '9px', fontFamily: 'monospace'}} />
                      <Bar dataKey="count" barSize={12} radius={[0, 2, 2, 0]}>
                        {chartData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[8px] font-black text-zinc-600 mt-2 uppercase">
                  <span>Critical: {chartData[0].count}</span>
                  <span>High: {chartData[1].count}</span>
                  <span>Moderate: {chartData[2].count}</span>
                </div>
              </div>
            </div>

            {/* QUEST 1: TACTICAL MAP */}
            <div className="mb-10">
              <TacticalMap zones={zones.filter(z => !disasterMode || z.risk_level !== 'MODERATE')} />
            </div>

            {/* --- DATA GRID: ZONE CARDS --- */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-20">
              {zones.filter(z => !disasterMode || z.risk_level !== 'MODERATE').map((zone) => (
                <div key={zone.id} className={`group bg-black border p-6 relative transition-all duration-300 ${
                  zone.risk_level === 'CRITICAL' ? 'border-red-900/50 hover:border-red-500 shadow-[inset_0_0_20px_rgba(255,0,0,0.1)]' : 
                  zone.risk_level === 'HIGH' ? 'border-orange-900/50 hover:border-orange-500' : 'border-zinc-800 hover:border-zinc-600'
                }`}>
                  
                  {/* QUEST 2: NUMERICAL THREAT INDEX */}
                  <div className="absolute top-6 right-6 flex flex-col items-center">
                    <span className={`text-3xl font-black italic tracking-tighter ${
                      zone.risk_level === 'CRITICAL' ? 'text-red-600' : zone.risk_level === 'HIGH' ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {zone.risk_score || (zone.risk_level === 'CRITICAL' ? 88 : zone.risk_level === 'HIGH' ? 62 : 35)}
                    </span>
                    <span className="text-[8px] text-zinc-700 font-bold mt-[-4px]">THREAT_INDEX</span>
                  </div>

                  {zone.risk_level === 'CRITICAL' && (
                    <div className="absolute inset-0 border border-red-600/20 animate-ping pointer-events-none"></div>
                  )}

                  <div className="pl-4 border-l-2 border-zinc-900 group-hover:border-green-500 transition-all">
                    <div className="mb-6">
                      <h2 className="text-white font-black text-2xl tracking-widest flex items-center">
                        <span className="text-green-500 text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                        {zone.id}
                      </h2>
                      <span className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest ${
                        zone.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-500' : 'bg-zinc-900 text-zinc-400'
                      }`}>
                        {zone.risk_level} // SECTOR_ACTIVE
                      </span>
                    </div>

                    <div className="space-y-4 text-[11px] font-bold text-zinc-500 tracking-wide uppercase">
                      <p><span className="text-zinc-700 mr-2">LOCATION:</span> <span className="text-zinc-200">{zone.location}</span></p>
                      <p><span className="text-zinc-700 mr-2">COORDINATES:</span> <span className="text-zinc-400">{zone.coordinates.lat}, {zone.coordinates.lng}</span></p>
                      
                      <div className={`p-4 mt-6 border-l-2 ${zone.risk_level === 'CRITICAL' ? 'border-red-600 bg-red-950/10' : 'border-zinc-800 bg-zinc-900/20'}`}>
                        <p className="text-[9px] text-zinc-600 mb-1">REAL_TIME_ADVISORY</p>
                        <p className={`text-xs ${zone.risk_level === 'CRITICAL' ? 'text-red-400' : 'text-zinc-300'}`}>
                          {zone.warning_message}
                        </p>
                      </div>

                      <button 
                        onClick={() => handleDispatch(zone)}
                        className="w-full mt-6 py-3 text-[9px] font-black tracking-[0.3em] border border-zinc-800 text-zinc-500 hover:bg-white hover:text-black hover:border-white transition-all uppercase"
                      >
                        SEND_TO_MOBILE_DISPATCH
                      </button>
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

"use client";
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from 'recharts';

// --- QUEST 1: SATELLITE MAP UPLINK ---
const TacticalMap = dynamic(() => import('../components/TacticalMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center text-green-500 text-xs tracking-[0.3em] mb-6">
      <p>ESTABLISHING SATELLITE CONNECTION...</p>
    </div>
  )
});

export default function Home() {
  // --- CORE STATE ---
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [disasterMode, setDisasterMode] = useState(false);
  
  // --- TELEMETRY ---
  const [liveLog, setLiveLog] = useState("SYSTEM_KERNEL_READY");
  const [ping, setPing] = useState(12);
  const [uptime, setUptime] = useState(0);
  const [booting, setBooting] = useState(true);
  const hour = new Date().getHours();
  const isNightOps = hour < 6 || hour > 18;

  // --- QUEST 3: ALERT LOGIC ---
  const processedAlerts = useRef(new Set());

  const fetchZones = async (isInitial = false) => {
    try {
      const res = await fetch('/api/zones');
      const data = await res.json();
      setZones(data);
      setIsOffline(false);
      setLastSynced(new Date().toLocaleTimeString());

      // QUEST 3: TRIGGER ALERTS
      data.forEach(zone => {
        const zoneId = zone._id || zone.id;
        if (zone.risk_level === 'CRITICAL' && !processedAlerts.current.has(zoneId)) {
          if (Notification.permission === "granted") {
            new Notification("CRITICAL THREAT DETECTED", { body: `Zone ${zone.id} at ${zone.location} is CRITICAL.` });
          }
          processedAlerts.current.add(zoneId);
        }
      });
    } catch (error) {
      setIsOffline(true);
      const cached = localStorage.getItem('riskRadarData');
      if (cached) setZones(JSON.parse(cached));
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (Notification.permission !== "granted") Notification.requestPermission();
    const bootTimer = setTimeout(() => setBooting(false), 1500);
    
    const tickerInterval = setInterval(() => {
      setPing(Math.floor(Math.random() * (22 - 8 + 1) + 8));
      setUptime(prev => prev + 1);
    }, 1000);

    fetchZones(true);
    const pollInterval = setInterval(() => fetchZones(false), 10000);

    return () => {
      clearInterval(tickerInterval);
      clearInterval(pollInterval);
      clearTimeout(bootTimer);
    };
  }, []);

  // --- QUEST 2: SCORING ENGINE ---
  const reportHazard = async () => {
    const loc = window.prompt("LOCATION:");
    const accidents = window.prompt("ACCIDENTS:");
    if (loc && accidents) {
      const accCount = parseInt(accidents);
      let score = Math.min(accCount * 2, 60);
      if (isNightOps) score += 15;
      score += 25; // Default environmental risk
      const finalScore = Math.min(score, 100);

      const newEntry = {
        id: `Z-0${zones.length + 1}`,
        location: loc,
        coordinates: { lat: (13.08 + Math.random() * 0.05).toFixed(4), lng: (80.27 + Math.random() * 0.05).toFixed(4) },
        risk_level: finalScore > 80 ? "CRITICAL" : finalScore > 50 ? "HIGH" : "MODERATE",
        risk_score: finalScore,
        historical_accidents: accCount,
        real_time_factor: "MANUAL_INJECTION",
        warning_message: "Emergency units notified."
      };

      await fetch('/api/zones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEntry) });
      fetchZones(false);
    }
  };

  const chartData = [
    { name: 'CRIT', count: zones.filter(z => z.risk_level === 'CRITICAL').length, color: '#ff0000' },
    { name: 'HIGH', count: zones.filter(z => z.risk_level === 'HIGH').length, color: '#ff8000' },
    { name: 'MOD', count: zones.filter(z => z.risk_level === 'MODERATE').length, color: '#ffff00' },
  ];

  if (booting) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-12 flex flex-col justify-end italic tracking-tighter">
        <p className="animate-pulse">&gt; CODE RUPTORS KERNEL LOADING... █</p>
      </div>
    );
  }

  return (
    <main className={`min-h-screen font-mono ${disasterMode ? 'bg-red-950/10' : 'bg-black'} p-4 md:p-8 relative`}>
      {/* SCANLINES (NO VIBRATION) */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-10"></div>

      <div className="max-w-7xl mx-auto">
        <header className="border-b border-green-900/30 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter">RISK<span className="text-green-500">_RADAR</span></h1>
            <p className="text-xs text-zinc-500 font-bold tracking-[0.3em] mt-1">CODE RUPTORS // SMART MOBILITY ENGINE</p>
          </div>
          <div className="text-right border border-zinc-800 p-3 bg-zinc-950">
            <p className={`text-[10px] font-bold ${isOffline ? 'text-red-500' : 'text-green-500'}`}>{isOffline ? 'OFFLINE // CACHE' : 'LIVE // MONGODB'}</p>
            <p className="text-[9px] text-zinc-600 mt-1">UPTIME: {uptime}s | PING: {ping}ms</p>
          </div>
        </header>

        {/* TERMINAL BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6 text-[10px] font-bold tracking-widest">
          <div className="md:col-span-3 bg-zinc-900 border border-zinc-800 p-2 text-green-400">
            &gt; _TERMINAL: SCANNING SENSORS... [{new Date().toLocaleTimeString()}] █
          </div>
          <div className="border border-zinc-800 p-2 text-center bg-blue-950/20 text-blue-400">
            DAYLIGHT OPS: VISIBILITY OPTIMAL
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => window.location.reload()} className="px-3 py-1 text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase">[_REFRESH_]</button>
          <button onClick={reportHazard} className="px-3 py-1 text-[10px] bg-orange-950 text-orange-400 border border-orange-900 uppercase">⚠️ REPORT_ANOMALY</button>
          <div className="flex-grow"></div>
          <button onClick={() => setDisasterMode(!disasterMode)} className={`px-4 py-1 text-[10px] font-bold border-2 ${disasterMode ? 'bg-red-600 text-white border-red-400' : 'bg-black text-red-900 border-red-900'}`}>DISASTER OVERRIDE PROTOCOL</button>
        </div>

        {/* STATS & MAP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="text-zinc-600 font-bold text-[9px] mb-3">ATMOSPHERIC SENSORS</h3>
            <div className="text-[10px] text-zinc-400 space-y-1">
              <p>TEMP: 31°C</p>
              <p>HUMIDITY: 88%</p>
              <p className="text-yellow-600 mt-2">MONSOON DETECTED</p>
            </div>
          </div>
          <div className="md:col-span-2 border border-zinc-800 bg-zinc-950 p-4 h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <Bar dataKey="count" barSize={15}>{chartData.map((e, i) => (<Cell key={i} fill={e.color}/>))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <TacticalMap zones={zones} />

        {/* CARDS */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {zones.filter(z => filter === 'ALL' || z.risk_level === filter).map((zone) => (
            <div key={zone.id} className={`bg-black border-l-4 p-6 relative group transition-all ${zone.risk_level === 'CRITICAL' ? 'border-l-red-600 border-zinc-800' : 'border-l-orange-500 border-zinc-800'}`}>
              <div className="absolute top-4 right-4 text-3xl font-black italic text-zinc-800 group-hover:text-green-900 transition-colors">
                {zone.risk_score || 85}
              </div>
              <h2 className="font-black text-white text-2xl tracking-widest before:content-['['] before:text-green-500 after:content-[']'] after:text-green-500 mb-4 uppercase">
                {zone.id}
              </h2>
              <div className="space-y-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                <p><span className="text-zinc-700">LOC:</span> {zone.location}</p>
                <div className={`p-2 border-l-2 bg-zinc-900/50 ${zone.risk_level === 'CRITICAL' ? 'border-red-600' : 'border-orange-500'}`}>
                   <p className={zone.risk_level === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'}>MSG: {zone.warning_message}</p>
                </div>
                <button className="w-full mt-4 py-2 border border-zinc-800 text-zinc-600 hover:bg-white hover:text-black transition-all">DISPATCH_TERMINAL</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

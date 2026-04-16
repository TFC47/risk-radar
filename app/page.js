"use client";
import { useEffect, useState, useRef } from 'react';
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
  const [ping, setPing] = useState(12);
  const [uptime, setUptime] = useState(0);
  const [booting, setBooting] = useState(true);
  
  // QUEST 3: ALERT STATE MANAGEMENT
  const [processedAlerts] = useState(new Set());
  const audioRef = useRef(null);

  const fetchZones = async (isInitial = false) => {
    try {
      const res = await fetch('/api/zones');
      const data = await res.json();
      setZones(data);
      setIsOffline(false);
      setLastSynced(new Date().toLocaleTimeString());
      
      // QUEST 3: TRIGGER PROACTIVE ALERTS
      data.forEach(zone => {
        if (zone.risk_level === 'CRITICAL' && !processedAlerts.has(zone._id || zone.id)) {
          triggerCriticalAlert(zone);
          processedAlerts.add(zone._id || zone.id);
        }
      });
    } catch (error) {
      setIsOffline(true);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const triggerCriticalAlert = (zone) => {
    // 1. Terminal Log Update
    setLiveLog(`🚨 CRITICAL THREAT DETECTED: ${zone.location}`);
    
    // 2. Browser Notification
    if (Notification.permission === "granted") {
      new Notification("RISK RADAR // CRITICAL ALERT", {
        body: `Threat detected at ${zone.location}. Immediate dispatch required.`,
        icon: "/favicon.ico"
      });
    }
  };

  useEffect(() => {
    if (Notification.permission !== "granted") Notification.requestPermission();
    const bootTimer = setTimeout(() => setBooting(false), 1500);
    const uiInterval = setInterval(() => {
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

  const chartData = [
    { name: 'CRITICAL', count: zones.filter(z => z.risk_level === 'CRITICAL').length, color: '#dc2626' },
    { name: 'HIGH', count: zones.filter(z => z.risk_level === 'HIGH').length, color: '#f97316' },
    { name: 'MODERATE', count: zones.filter(z => z.risk_level === 'MODERATE').length, color: '#ca8a04' },
  ];

  if (booting) {
    return (
      <main className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-start justify-end p-8 pb-20 italic">
        <p>&gt; BOOTING RISK_RADAR_V3.0...</p>
        <p>&gt; NOTIFICATION_SUBSYSTEM: ONLINE</p>
        <p className="font-bold text-white">&gt; READY █</p>
      </main>
    );
  }

  return (
    <main className={`min-h-screen font-mono transition-all selection:bg-green-500 selection:text-black ${disasterMode ? 'bg-red-950/20' : 'bg-black'} p-4 md:p-8 relative`}>
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-4 border-b border-green-900/50 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-white">RISK<span className="text-green-500">_RADAR</span></h1>
            <p className="text-[10px] text-gray-500 tracking-widest">ENHANCED NOTIFICATION MODULE ACTIVE</p>
          </div>
          <div className="text-right border border-zinc-800 p-2 bg-zinc-950/50">
            <p className="text-[10px] font-bold text-green-500">{isOffline ? 'OFFLINE' : 'LIVE_UPLINK'}</p>
            <p className="text-[10px] text-gray-500">PING: {ping}ms | UPTIME: {uptime}s</p>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-blue-900 bg-blue-950/20 p-4">
            <h3 className="text-blue-500 font-bold text-[10px] tracking-widest">ATMOSPHERIC SENSORS</h3>
            <p className="text-xs text-blue-300 font-bold mt-2">MONSOON DEPRESSION: 88%</p>
          </div>
          <div className="md:col-span-2 border border-zinc-800 bg-zinc-900/40 p-4 h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <Bar dataKey="count" barSize={15}>{chartData.map((e, i) => (<Cell key={i} fill={e.color}/>))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {zones.length > 0 && <TacticalMap zones={zones} />}

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-6">
          {zones.filter(z => filter === 'ALL' || z.risk_level === filter).map((zone) => (
            <div key={zone.id} className={`bg-black border p-6 relative ${zone.risk_level === 'CRITICAL' ? 'border-red-600 shadow-[0_0_15px_rgba(255,0,0,0.2)]' : 'border-zinc-800'}`}>
              <div className="absolute top-4 right-4 text-xl font-black text-white">{zone.risk_score || 85}</div>
              <h2 className="font-black text-white text-xl mb-4 tracking-widest">{zone.id}</h2>
              <div className="text-xs text-gray-400 space-y-2">
                <p><span className="text-gray-600 uppercase">Location:</span> {zone.location}</p>
                <p className={`p-2 font-bold ${zone.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-500' : 'bg-orange-950 text-orange-500'}`}>WARNING: {zone.warning_message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

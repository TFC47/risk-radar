"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch('/api/zones');
        const data = await res.json();
        setZones(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  return (
    <main className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b border-green-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-widest">RISK<span className="text-green-500">_RADAR</span></h1>
            <p className="text-xs md:text-sm text-green-700 mt-2">SMART MOBILITY // HIGH-RISK ZONE TELEMETRY SYSTEM</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-green-400 animate-pulse">● LIVE TELEMETRY ONLINE</p>
            <p className="text-xs text-green-800 mt-1">SYS_STATUS: OPTIMAL</p>
          </div>
        </header>

        {loading ? (
          <div className="text-center mt-32 animate-pulse text-2xl tracking-widest text-green-700">
            INITIALIZING SATELLITE UPLINK...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <div key={zone.id} className="border border-green-900 bg-black p-6 relative overflow-hidden group hover:border-green-500 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,0,0.05)] hover:shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                
                {/* Risk Level Color Bar */}
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  zone.risk_level === 'CRITICAL' ? 'bg-red-600 shadow-[0_0_10px_rgba(255,0,0,0.8)]' : 
                  zone.risk_level === 'HIGH' ? 'bg-orange-500' : 
                  'bg-yellow-400'
                }`}></div>

                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-wider">{zone.id}</h2>
                  <span className={`px-2 py-1 text-xs font-bold tracking-widest border ${
                    zone.risk_level === 'CRITICAL' ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' : 
                    zone.risk_level === 'HIGH' ? 'bg-orange-950 border-orange-500 text-orange-400' : 
                    'bg-yellow-950 border-yellow-500 text-yellow-400'
                  }`}>
                    {zone.risk_level}
                  </span>
                </div>

                <div className="space-y-4 text-sm tracking-wide">
                  <p><span className="text-green-800">LOC:</span> <span className="text-gray-300">{zone.location}</span></p>
                  <p><span className="text-green-800">COORD:</span> <span className="text-gray-400">{zone.coordinates.lat}, {zone.coordinates.lng}</span></p>
                  <p><span className="text-green-800">HIST_ACCIDENTS:</span> <span className="text-red-500 font-bold">{zone.historical_accidents}</span></p>
                  
                  <div className="border-t border-green-900/50 pt-4 mt-4">
                    <p className="text-green-700 text-xs mb-2">REAL-TIME CONTEXT FACTOR:</p>
                    <p className="text-white bg-green-950/30 p-2 border-l border-green-800">{zone.real_time_factor}</p>
                  </div>
                  
                  <div className={`p-3 mt-4 border-l-2 ${
                    zone.risk_level === 'CRITICAL' ? 'border-red-500 bg-red-950/20' : 'border-green-500 bg-green-950/20'
                  }`}>
                    <p className={`text-xs ${zone.risk_level === 'CRITICAL' ? 'text-red-400' : 'text-green-400'}`}>
                      &gt; SYSTEM_WARNING: {zone.warning_message}
                    </p>
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
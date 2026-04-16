"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const createCustomIcon = (riskLevel) => {
  const colorClass = riskLevel === 'CRITICAL' ? 'bg-red-600 shadow-[0_0_15px_rgba(255,0,0,1)]' : riskLevel === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500';
  return L.divIcon({
    className: 'custom-icon',
    html: `<div class="w-4 h-4 rounded-full ${colorClass} animate-pulse border-2 border-black"></div>`,
    iconSize: [16, 16], iconAnchor: [8, 8]
  });
};

export default function TacticalMap({ zones }) {
  return (
    <div className="border border-zinc-800 rounded-sm p-1 bg-zinc-900/50 mb-6 relative z-0">
      <div className="absolute top-0 left-0 bg-black/80 text-green-500 text-[10px] px-2 py-1 z-[400] font-bold border-b border-r border-zinc-800">GPS_UPLINK_ACTIVE</div>
      <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '350px', width: '100%', backgroundColor: '#000' }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
        {zones.map((zone) => (
          <Marker key={zone.id} position={[zone.coordinates.lat, zone.coordinates.lng]} icon={createCustomIcon(zone.risk_level)}>
            <Popup><div className="bg-black text-green-500 p-2 font-mono">[{zone.id}] {zone.risk_level}</div></Popup>
          </Marker>
        ))}
      </MapContainer>
      <style jsx global>{`.leaflet-popup-content-wrapper, .leaflet-popup-tip { background: black; border: 1px solid #3f3f46; }`}</style>
    </div>
  );
}
import { NextResponse } from 'next/server';

export async function GET() {
  const riskZones = [
    {
      id: "Z-001",
      location: "Poonamallee High Road Intersection",
      coordinates: { lat: 13.0489, lng: 80.0211 },
      risk_level: "CRITICAL",
      historical_accidents: 47,
      real_time_factor: "Heavy Waterlogging + High Traffic",
      warning_message: "Reroute advised. 85% probability of collision based on current weather."
    },
    {
      id: "Z-002",
      location: "NH48 Bypass Curve",
      coordinates: { lat: 13.0123, lng: 79.9822 },
      risk_level: "HIGH",
      historical_accidents: 22,
      real_time_factor: "Construction Zone Speed Drop",
      warning_message: "Reduce speed to 30km/h. Sudden braking detected ahead."
    },
    {
      id: "Z-003",
      location: "Kuthambakkam College Road",
      coordinates: { lat: 13.0311, lng: 80.0122 },
      risk_level: "MODERATE",
      historical_accidents: 5,
      real_time_factor: "Pedestrian Crossing Activity",
      warning_message: "School/College zone active. Proceed with caution."
    }
  ];

  return NextResponse.json(riskZones);
}
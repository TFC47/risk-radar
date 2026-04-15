import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Zone from '../../../models/Zone';

export async function GET() {
  try {
    // 1. Establish the uplink to Risk Radar Database
    await connectToDatabase();

    // 2. Fetch all current risk zones
    let zones = await Zone.find({});

    // 3. THE HACKATHON SEED TRICK: Auto-populate if empty
    if (zones.length === 0) {
      console.log("Database empty. Executing auto-seed protocol...");
      const dummyData = [
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
      
      await Zone.insertMany(dummyData);
      zones = await Zone.find({}); // Fetch the newly inserted data
      console.log("Auto-seed complete. Database is live.");
    }

    // 4. Send the data to the Code Ruptors frontend
    return NextResponse.json(zones);

  } catch (error) {
    console.error("TELEMETRY FETCH FAILED:", error);
    return NextResponse.json({ error: 'System failure' }, { status: 500 });
  }
}
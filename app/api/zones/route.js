import connectToDatabase from "@/lib/mongodb";
import Zone from "@/models/Zone";
import { NextResponse } from "next/server";

// 1. GET: This fetches the data for your dashboard
export async function GET() {
  try {
    await connectToDatabase();
    const zones = await Zone.find({});
    return NextResponse.json(zones);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: This allows the "Report Anomaly" button to work
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const newZone = await Zone.create(body);
    return NextResponse.json({ success: true, data: newZone }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
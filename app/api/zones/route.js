import connectToDatabase from "@/lib/mongodb";
import Zone from "@/models/Zone";
import { NextResponse } from "next/server";

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
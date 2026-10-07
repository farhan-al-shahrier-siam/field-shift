import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Farm from '@/models/Farm';

// In-memory fallback when MongoDB is not connected
const memoryFarmStore = new Map();

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, location, currentCrop, soilType, waterAvailability, irrigationAvailable, farmingSeason, farmSize, challenges } = body;
    const sid = sessionId || 'anonymous';

    if (!location?.lat || !location?.lon) {
      return NextResponse.json({ error: 'Location with lat/lon is required' }, { status: 400 });
    }

    try {
      const db = await connectToDatabase();
      if (db) {
        const farm = await Farm.findOneAndUpdate(
          { sessionId: sid },
          { sessionId: sid, location, currentCrop, soilType, waterAvailability, irrigationAvailable, farmingSeason, farmSize, challenges },
          { upsert: true, new: true }
        );
        memoryFarmStore.set(sid, farm.toObject ? farm.toObject() : farm);
        return NextResponse.json({ success: true, farm });
      }
    } catch (e) {
      // Fall through to memory store
    }

    // Fallback in-memory save
    memoryFarmStore.set(sid, { ...body, sessionId: sid });
    return NextResponse.json({ success: true, farm: memoryFarmStore.get(sid) });
  } catch (error) {
    console.error('Farm save error:', error);
    return NextResponse.json({ error: 'Failed to save farm', details: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || 'anonymous';

    try {
      const db = await connectToDatabase();
      if (db) {
        const farm = await Farm.findOne({ sessionId });
        if (farm) {
          return NextResponse.json({ success: true, farm });
        }
      }
    } catch (e) {
      // Fall through to memory store
    }

    if (memoryFarmStore.has(sessionId)) {
      return NextResponse.json({ success: true, farm: memoryFarmStore.get(sessionId) });
    }

    return NextResponse.json({ success: false, message: 'Farm profile not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch farm', details: error.message }, { status: 500 });
  }
}

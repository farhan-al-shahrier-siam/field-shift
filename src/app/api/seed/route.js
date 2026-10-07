import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Crop from '@/models/Crop';
import { CROPS_DATA } from '@/data/crops';

export async function POST(request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding not allowed in production' }, { status: 403 });
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    // Upsert all crops
    const results = await Promise.all(
      CROPS_DATA.map(crop =>
        Crop.findOneAndUpdate(
          { name: crop.name },
          crop,
          { upsert: true, new: true }
        )
      )
    );

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.length} crops successfully`,
      crops: results.map(c => c.name),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { fetchNASAMonthly, processNASAMonthly, getDemoClimateData } from '@/lib/nasa';
import connectToDatabase from '@/lib/mongodb';
import ClimateData from '@/models/ClimateData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat'));
  const lon = parseFloat(searchParams.get('lon'));
  const forceDemo = searchParams.get('demo') === 'true' || process.env.DEMO_MODE === 'true';

  // Validate coordinates
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.' },
      { status: 400 }
    );
  }

  // Demo mode
  if (forceDemo) {
    const demoData = getDemoClimateData(lat, lon);
    return NextResponse.json({ success: true, data: demoData, demo: true });
  }

  // Try MongoDB cache first
  try {
    const db = await connectToDatabase();
    if (db) {
      const cached = await ClimateData.findFresh(lat, lon, 24);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached.data,
          cached: true,
          cachedAt: cached.fetchedAt,
        });
      }
    }
  } catch (dbError) {
    console.warn('MongoDB cache check failed:', dbError.message);
    // Continue to fetch from NASA
  }

  // Fetch from NASA POWER
  try {
    const nasaRaw = await fetchNASAMonthly(lat, lon);
    const processed = processNASAMonthly(nasaRaw);

    // Cache in MongoDB if available
    try {
      const db = await connectToDatabase();
      if (db) {
        await ClimateData.create({
          lat: Math.round(lat * 100) / 100,
          lon: Math.round(lon * 100) / 100,
          data: processed,
          source: 'NASA POWER',
          isDemo: false,
          fetchedAt: new Date(),
        });
      }
    } catch (cacheError) {
      console.warn('Failed to cache climate data:', cacheError.message);
    }

    return NextResponse.json({ success: true, data: processed, demo: false });
  } catch (nasaError) {
    console.error('NASA POWER API error:', nasaError.message);

    // Fall back to demo data with clear labeling
    const demoData = getDemoClimateData(lat, lon);
    return NextResponse.json({
      success: true,
      data: demoData,
      demo: true,
      fallback: true,
      message: 'NASA climate data is temporarily unavailable. Showing sample data for demonstration purposes.',
    });
  }
}

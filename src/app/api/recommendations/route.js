import { NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/recommendation';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      avgTemperature,
      totalPrecipitation,
      avgHumidity,
      waterAvailability,
      season,
      soilType,
      challenges,
      topN,
    } = body;

    if (avgTemperature === undefined || totalPrecipitation === undefined) {
      return NextResponse.json(
        { error: 'avgTemperature and totalPrecipitation are required' },
        { status: 400 }
      );
    }

    const recommendations = getRecommendations(
      { avgTemperature, totalPrecipitation, avgHumidity, waterAvailability, season, soilType, challenges },
      topN || 5
    );

    return NextResponse.json({ success: true, recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const avgTemperature = searchParams.get('temp') ? parseFloat(searchParams.get('temp')) : 22;
    const totalPrecipitation = searchParams.get('precip') ? parseFloat(searchParams.get('precip')) : 650;
    const avgHumidity = searchParams.get('humidity') ? parseFloat(searchParams.get('humidity')) : 65;
    const waterAvailability = searchParams.get('water') || 'moderate';
    const season = searchParams.get('season') || 'All-year';
    const soilType = searchParams.get('soil') || 'Loam';
    const topN = searchParams.get('topN') ? parseInt(searchParams.get('topN')) : 6;

    const recommendations = getRecommendations(
      { avgTemperature, totalPrecipitation, avgHumidity, waterAvailability, season, soilType },
      topN
    );

    return NextResponse.json({ success: true, recommendations });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error.message },
      { status: 500 }
    );
  }
}

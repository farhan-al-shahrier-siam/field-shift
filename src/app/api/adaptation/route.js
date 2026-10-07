import { NextResponse } from 'next/server';
import { generateAdaptationPlan } from '@/lib/climate';

export async function POST(request) {
  try {
    const body = await request.json();
    const { challenges, farm, climateData } = body;
    const challengesList = challenges || farm?.challenges || [];

    if (!Array.isArray(challengesList)) {
      return NextResponse.json(
        { error: 'challenges must be an array of strings' },
        { status: 400 }
      );
    }

    const plan = generateAdaptationPlan(challengesList, farm || {}, climateData || null);

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Adaptation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate adaptation plan', details: error.message },
      { status: 500 }
    );
  }
}

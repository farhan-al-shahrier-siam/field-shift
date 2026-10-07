import { NextResponse } from 'next/server';
import { suggestRotation } from '@/lib/recommendation';
import { CROPS_DATA } from '@/data/crops';

export async function POST(request) {
  try {
    const body = await request.json();
    const { currentRotation, conditions } = body;

    if (!currentRotation || !Array.isArray(currentRotation)) {
      return NextResponse.json(
        { error: 'currentRotation must be an array of crop names' },
        { status: 400 }
      );
    }

    const suggested = suggestRotation(currentRotation, conditions || {});

    // Build comparison table
    const waterDemandRank = { 'Very Low': 1, 'Low': 2, 'Moderate': 3, 'High': 4, 'Very High': 5 };
    const currentWaterAvg = currentRotation.reduce((acc, name) => {
      const crop = CROPS_DATA.find(c => c.name.toLowerCase() === name.toLowerCase());
      return acc + (waterDemandRank[crop?.waterRequirement] || 3);
    }, 0) / (currentRotation.length || 1);

    const suggestedWaterAvg = suggested.reduce((acc, s) => {
      const crop = CROPS_DATA.find(c => c.name.toLowerCase() === s.name.toLowerCase());
      return acc + (waterDemandRank[crop?.waterRequirement] || 3);
    }, 0) / (suggested.length || 1);

    const rankToLabel = (r) => r <= 1.5 ? 'Very Low' : r <= 2.5 ? 'Low' : r <= 3.5 ? 'Moderate' : r <= 4.5 ? 'High' : 'Very High';

    const comparison = {
      waterDemand: {
        current: rankToLabel(currentWaterAvg),
        suggested: rankToLabel(suggestedWaterAvg),
      },
      cropDiversity: {
        current: new Set(currentRotation.map(c => c.toLowerCase())).size <= 1 ? 'Low' : 'Moderate',
        suggested: new Set(suggested.map(s => s.name.toLowerCase())).size >= 3 ? 'High' : 'Moderate',
      },
      legumesInRotation: {
        current: currentRotation.some(name => {
          const c = CROPS_DATA.find(d => d.name.toLowerCase() === name.toLowerCase());
          return c?.category === 'Legume';
        }) ? 'Yes' : 'No',
        suggested: suggested.some(s => {
          const c = CROPS_DATA.find(d => d.name.toLowerCase() === s.name.toLowerCase());
          return c?.category === 'Legume';
        }) ? 'Yes' : 'No',
      },
      climateRisk: {
        current: 'Higher',
        suggested: 'Lower',
      },
    };

    const reasons = [
      suggested.some(s => { const c = CROPS_DATA.find(d => d.name === s.name); return c?.category === 'Legume'; })
        ? 'Includes a nitrogen-fixing legume to improve soil fertility' : null,
      suggestedWaterAvg < currentWaterAvg ? 'Reduces overall water demand' : null,
      new Set(suggested.map(s => s.name)).size > new Set(currentRotation).size ? 'Increases crop diversity' : null,
      'Improves seasonal diversification and reduces pest cycle risk',
    ].filter(Boolean);

    return NextResponse.json({
      success: true,
      currentRotation,
      suggestedRotation: suggested,
      comparison,
      reasons,
    });
  } catch (error) {
    console.error('Rotation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate rotation suggestion', details: error.message },
      { status: 500 }
    );
  }
}

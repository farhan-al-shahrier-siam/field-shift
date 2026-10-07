/**
 * Field Shift Recommendation Engine
 * Generates crop suitability scores based on climate data and farm conditions.
 * 
 * IMPORTANT: These are decision-support scores, not scientifically validated models.
 * They are intended to help users explore options, not replace professional advice.
 */

import { CROPS_DATA } from '@/data/crops';

/**
 * Score a crop against climate and farm conditions.
 * Returns a normalized 0-100 score with factor breakdown.
 */
export function scoreCrop(crop, conditions) {
  const {
    avgTemperature,
    totalPrecipitation,
    avgHumidity,
    waterAvailability,
    season,
    soilType,
    challenges = [],
  } = conditions;

  const factors = {};
  let totalWeight = 0;
  let weightedScore = 0;

  // --- Temperature Suitability (weight: 25) ---
  if (avgTemperature !== null && avgTemperature !== undefined) {
    const { min, optimal, max } = crop.temperatureRange;
    let tempScore = 0;

    if (avgTemperature >= min && avgTemperature <= max) {
      // Within range — score based on distance from optimal
      const distFromOptimal = Math.abs(avgTemperature - optimal);
      const maxDist = Math.max(optimal - min, max - optimal);
      tempScore = 100 - (distFromOptimal / maxDist) * 40;
    } else {
      // Outside range — penalty
      const overshoot = avgTemperature < min
        ? min - avgTemperature
        : avgTemperature - max;
      tempScore = Math.max(0, 30 - overshoot * 5);
    }

    factors.temperatureSuitability = { score: Math.round(tempScore), weight: 25, label: 'Temperature Match' };
    weightedScore += tempScore * 25;
    totalWeight += 25;
  }

  // --- Rainfall / Precipitation Suitability (weight: 25) ---
  if (totalPrecipitation !== null && totalPrecipitation !== undefined) {
    const { min: pMin, optimal: pOpt, max: pMax } = crop.rainfallRange;
    let precipScore = 0;

    if (totalPrecipitation >= pMin && totalPrecipitation <= pMax) {
      const distFromOptimal = Math.abs(totalPrecipitation - pOpt);
      const maxDist = Math.max(pOpt - pMin, pMax - pOpt);
      precipScore = 100 - (distFromOptimal / maxDist) * 35;
    } else {
      const overshoot = totalPrecipitation < pMin
        ? pMin - totalPrecipitation
        : totalPrecipitation - pMax;
      const pctOver = overshoot / Math.max(pOpt, 1);
      precipScore = Math.max(0, 40 - pctOver * 40);
    }

    factors.rainfallSuitability = { score: Math.round(precipScore), weight: 25, label: 'Rainfall Match' };
    weightedScore += precipScore * 25;
    totalWeight += 25;
  }

  // --- Water Availability Suitability (weight: 20) ---
  if (waterAvailability) {
    const waterMap = { 'Very Low': 1, 'Low': 2, 'Moderate': 3, 'High': 4, 'Very High': 5 };
    const cropWaterMap = { 'Very Low': 1, 'Low': 2, 'Moderate': 3, 'High': 4, 'Very High': 5 };

    const available = waterMap[waterAvailability] || 3;
    const required = cropWaterMap[crop.waterRequirement] || 3;
    const diff = available - required;

    let waterScore;
    if (diff >= 0) {
      // More water than needed — slightly penalize overuse but mostly OK
      waterScore = 100 - diff * 5;
    } else {
      // Less water than needed — significant penalty
      waterScore = Math.max(0, 100 + diff * 25);
    }

    factors.waterSuitability = { score: Math.round(waterScore), weight: 20, label: 'Water Availability' };
    weightedScore += waterScore * 20;
    totalWeight += 20;
  }

  // --- Season Suitability (weight: 15) ---
  if (season) {
    const seasonMatch = crop.growingSeason.some(s =>
      s.toLowerCase().includes(season.toLowerCase()) ||
      season.toLowerCase().includes(s.toLowerCase())
    );
    const seasonScore = seasonMatch ? 100 : 35;
    factors.seasonSuitability = { score: seasonScore, weight: 15, label: 'Growing Season' };
    weightedScore += seasonScore * 15;
    totalWeight += 15;
  }

  // --- Soil Suitability (weight: 10) ---
  if (soilType) {
    const soilMatch = crop.soilPreferences.some(s =>
      s.toLowerCase().includes(soilType.toLowerCase()) ||
      soilType.toLowerCase().includes(s.toLowerCase())
    );
    const soilScore = soilMatch ? 100 : 55;
    factors.soilSuitability = { score: soilScore, weight: 10, label: 'Soil Type' };
    weightedScore += soilScore * 10;
    totalWeight += 10;
  }

  // --- Stress Tolerance (weight: 5 per relevant challenge) ---
  const toleranceBonus = computeToleranceBonus(crop, challenges);
  if (toleranceBonus.score !== null) {
    factors.stressTolerance = { score: toleranceBonus.score, weight: 5, label: 'Stress Tolerance' };
    weightedScore += toleranceBonus.score * 5;
    totalWeight += 5;
  }

  // Final normalized score
  const rawScore = totalWeight > 0 ? weightedScore / totalWeight : 50;
  const finalScore = Math.round(Math.min(99, Math.max(1, rawScore)));

  return {
    crop: crop.name,
    score: finalScore,
    grade: getGrade(finalScore),
    factors,
    recommendation: buildRecommendationText(crop, finalScore, factors, conditions),
    risks: buildRisks(crop, conditions),
    waterRequirement: crop.waterRequirement,
    droughtTolerance: crop.droughtTolerance,
    heatTolerance: crop.heatTolerance,
    growingDuration: crop.growingDuration,
    rotationBenefits: crop.rotationBenefits,
    icon: crop.icon,
  };
}

function computeToleranceBonus(crop, challenges) {
  if (!challenges || challenges.length === 0) return { score: null };

  const toleranceMap = {
    'Low': 30,
    'Moderate': 60,
    'High': 85,
    'Very High': 100,
  };

  const challengeToTolerance = {
    'Increasing temperature': 'heatTolerance',
    'Drought': 'droughtTolerance',
    'Water shortage': 'droughtTolerance',
    'Excess rainfall': 'floodTolerance',
    'Irregular rainfall': 'droughtTolerance',
  };

  const scores = [];
  for (const challenge of challenges) {
    const toleranceField = challengeToTolerance[challenge];
    if (toleranceField && crop[toleranceField]) {
      scores.push(toleranceMap[crop[toleranceField]] || 50);
    }
  }

  if (scores.length === 0) return { score: null };
  return { score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) };
}

function getGrade(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Moderate';
  if (score >= 40) return 'Fair';
  return 'Low';
}

function buildRecommendationText(crop, score, factors, conditions) {
  const reasons = [];

  if (factors.temperatureSuitability?.score >= 70) {
    reasons.push('temperature conditions appear favorable');
  } else if (factors.temperatureSuitability?.score < 50) {
    reasons.push('temperature conditions may present a challenge');
  }

  if (factors.rainfallSuitability?.score >= 70) {
    reasons.push('rainfall levels align well with this crop\'s needs');
  } else if (factors.rainfallSuitability?.score < 50) {
    reasons.push('rainfall levels may not meet this crop\'s requirements');
  }

  if (factors.waterSuitability?.score >= 70) {
    reasons.push('water availability suits this crop\'s demands');
  } else if (factors.waterSuitability?.score < 50) {
    reasons.push('limited water availability may constrain this crop');
  }

  if (factors.seasonSuitability?.score >= 70) {
    reasons.push('the growing season aligns with typical planting windows');
  }

  if (crop.droughtTolerance === 'High' || crop.droughtTolerance === 'Very High') {
    reasons.push('this crop shows good resilience under dry conditions');
  }

  const prefix = score >= 70
    ? 'Based on available climate indicators, this crop appears to be a suitable option'
    : score >= 50
      ? 'This crop may be a viable option, though some conditions may require attention'
      : 'This crop may face challenges under current conditions';

  return `${prefix}. ${reasons.length > 0 ? `Notably, ${reasons.slice(0, 2).join(' and ')}.` : ''} Field Shift Suitability Scores are decision-support estimates and do not guarantee crop success.`;
}

function buildRisks(crop, conditions) {
  const risks = [];
  const { avgTemperature, totalPrecipitation, waterAvailability, challenges = [] } = conditions;

  if (avgTemperature > crop.temperatureRange.max) {
    risks.push({ level: 'High', factor: 'Temperature', description: `Average temperature exceeds this crop's preferred maximum of ${crop.temperatureRange.max}°C` });
  }
  if (avgTemperature < crop.temperatureRange.min) {
    risks.push({ level: 'High', factor: 'Temperature', description: `Average temperature is below this crop's minimum of ${crop.temperatureRange.min}°C` });
  }
  if (waterAvailability === 'Low' || waterAvailability === 'Very Low') {
    if (crop.waterRequirement === 'High' || crop.waterRequirement === 'Very High') {
      risks.push({ level: 'High', factor: 'Water', description: 'High water demand may not be met under current water availability' });
    }
  }

  return risks;
}

/**
 * Get top N crop recommendations for given conditions.
 */
export function getRecommendations(conditions, topN = 5) {
  const scores = CROPS_DATA.map(crop => scoreCrop(crop, conditions));
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topN);
}

/**
 * Compute the Field Shift Resilience Score for a farm.
 * Transparent, component-based. Not a validated scientific metric.
 */
export function computeResilienceScore(farm, climateData, rotation = []) {
  const components = {};

  // 1. Climate Resilience (0-25): How well does the current crop handle climate?
  const currentCrop = CROPS_DATA.find(c => c.name.toLowerCase() === farm.currentCrop?.toLowerCase());
  if (currentCrop && climateData?.annual) {
    const { avgTemperature, totalPrecipitation } = climateData.annual;
    const tempOk = avgTemperature >= currentCrop.temperatureRange.min && avgTemperature <= currentCrop.temperatureRange.max;
    const precipOk = totalPrecipitation >= currentCrop.rainfallRange.min && totalPrecipitation <= currentCrop.rainfallRange.max;
    components.climateResilience = {
      score: tempOk && precipOk ? 22 : tempOk || precipOk ? 14 : 8,
      max: 25,
      label: 'Climate Resilience',
      description: 'How well your current crop matches local climate conditions',
    };
  } else {
    components.climateResilience = { score: 12, max: 25, label: 'Climate Resilience', description: 'Climate match data unavailable' };
  }

  // 2. Water Resilience (0-20)
  const waterScoreMap = { 'Very High': 20, 'High': 17, 'Moderate': 13, 'Low': 8, 'Very Low': 4 };
  const cropWaterDemandPenalty = { 'Very High': -4, 'High': -2, 'Moderate': 0, 'Low': 2, 'Very Low': 4 };
  const waterBase = waterScoreMap[farm.waterAvailability] || 12;
  const waterPenalty = currentCrop ? (cropWaterDemandPenalty[currentCrop.waterRequirement] || 0) : 0;
  components.waterResilience = {
    score: Math.min(20, Math.max(0, waterBase + waterPenalty)),
    max: 20,
    label: 'Water Resilience',
    description: 'Balance between water availability and crop demand',
  };

  // 3. Crop Diversity (0-20)
  const uniqueCrops = new Set(rotation.map(r => r?.toLowerCase?.())).size;
  const diversityScore = Math.min(20, uniqueCrops * 6);
  components.cropDiversity = {
    score: diversityScore,
    max: 20,
    label: 'Crop Diversity',
    description: 'Variety of crops in your rotation plan',
  };

  // 4. Challenge Preparedness (0-20)
  const challenges = farm.challenges || [];
  const challengePrepScore = challenges.length === 0 ? 15 :
    Math.max(5, 20 - challenges.length * 2);
  components.challengePreparedness = {
    score: challengePrepScore,
    max: 20,
    label: 'Challenge Awareness',
    description: 'Identified farming challenges that need attention',
  };

  // 5. Adaptation Readiness (0-15)
  const hasIrrigation = farm.irrigationAvailable ? 7 : 0;
  const hasRotation = rotation.length >= 3 ? 8 : rotation.length >= 2 ? 5 : 2;
  components.adaptationReadiness = {
    score: Math.min(15, hasIrrigation + hasRotation),
    max: 15,
    label: 'Adaptation Readiness',
    description: 'Irrigation access and rotation planning status',
  };

  const totalScore = Object.values(components).reduce((sum, c) => sum + c.score, 0);
  const maxScore = Object.values(components).reduce((sum, c) => sum + c.max, 0);

  return {
    score: totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100),
    grade: getGrade(Math.round((totalScore / maxScore) * 100)),
    components,
    disclaimer: 'An experimental decision-support score based on the information provided and available climate indicators. Not a validated scientific metric.',
  };
}

/**
 * Generate a crop rotation suggestion based on current rotation.
 */
export function suggestRotation(currentRotation, conditions) {
  const { waterAvailability, season, soilType, challenges = [] } = conditions;

  // Analyze what's missing in the current rotation
  const currentCropNames = currentRotation.map(c => c.toLowerCase());
  const hasLegume = CROPS_DATA.some(c => c.category === 'Legume' && currentCropNames.includes(c.name.toLowerCase()));
  const hasOilseed = CROPS_DATA.some(c => c.category === 'Oilseed' && currentCropNames.includes(c.name.toLowerCase()));
  const uniqueCount = new Set(currentCropNames).size;

  // Get top recommendations
  const topCrops = getRecommendations(conditions, 8);

  // Build a 3-4 season rotation
  const suggestedRotation = [];
  const addedNames = new Set();

  // 1. Start with main crop (best suited)
  const mainCrop = topCrops[0];
  if (mainCrop) {
    suggestedRotation.push({ name: mainCrop.crop, score: mainCrop.score, icon: mainCrop.icon || '🌾', reason: 'Best climate match' });
    addedNames.add(mainCrop.crop);
  }

  // 2. Add a legume if not present
  if (!hasLegume) {
    const legume = topCrops.find(c => {
      const cropData = CROPS_DATA.find(d => d.name === c.crop);
      return cropData?.category === 'Legume' && !addedNames.has(c.crop);
    });
    if (legume) {
      suggestedRotation.push({ name: legume.crop, score: legume.score, icon: legume.icon || '🫘', reason: 'Nitrogen fixer — improves soil fertility' });
      addedNames.add(legume.crop);
    }
  }

  // 3. Add diversity crop
  const diversityCrop = topCrops.find(c => !addedNames.has(c.crop));
  if (diversityCrop) {
    suggestedRotation.push({ name: diversityCrop.crop, score: diversityCrop.score, icon: diversityCrop.icon || '🌱', reason: 'Adds crop diversity and breaks pest cycles' });
    addedNames.add(diversityCrop.crop);
  }

  // 4. Low-water crop if water is scarce
  if (waterAvailability === 'Low' || waterAvailability === 'Very Low') {
    const lowWaterCrop = CROPS_DATA.find(c =>
      (c.waterRequirement === 'Low' || c.waterRequirement === 'Very Low') &&
      !addedNames.has(c.name)
    );
    if (lowWaterCrop) {
      suggestedRotation.push({ name: lowWaterCrop.name, score: 72, icon: lowWaterCrop.icon || '🌿', reason: 'Water-efficient choice for low-water conditions' });
    }
  }

  return suggestedRotation.slice(0, 4);
}

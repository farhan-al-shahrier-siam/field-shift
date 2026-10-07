/**
 * Climate analysis utilities
 * Converts raw climate data into plain-language agricultural insights.
 */

/**
 * Generate human-readable insights from climate data.
 */
export function generateClimateInsights(climateData, farm) {
  if (!climateData) return [];

  const { annual } = climateData;
  const insights = [];

  // Temperature insights
  if (annual?.avgTemperature !== null) {
    const temp = annual.avgTemperature;
    if (temp > 32) {
      insights.push({
        type: 'warning',
        title: 'High Temperature Conditions',
        message: `Average temperature is ${temp}°C — above typical optimal ranges for many crops. This may increase water demand and stress heat-sensitive crops.`,
        factor: 'temperature',
        actionable: 'Consider heat-tolerant crop varieties and adjust planting windows to cooler periods.',
      });
    } else if (temp > 27) {
      insights.push({
        type: 'moderate',
        title: 'Warm Growing Conditions',
        message: `Average temperature of ${temp}°C is warm. Suitable for tropical crops but may challenge temperate varieties.`,
        factor: 'temperature',
        actionable: 'Tropical and subtropical crops will generally perform well. Monitor for heat stress during peak summer.',
      });
    } else if (temp >= 18) {
      insights.push({
        type: 'positive',
        title: 'Favorable Temperature Range',
        message: `Average temperature of ${temp}°C falls within a broadly favorable range for many crop types.`,
        factor: 'temperature',
        actionable: 'Wide variety of crops can be considered. Review seasonal patterns for timing.',
      });
    } else {
      insights.push({
        type: 'moderate',
        title: 'Cool Growing Conditions',
        message: `Average temperature of ${temp}°C is on the cooler side. This may limit tropical crop options.`,
        factor: 'temperature',
        actionable: 'Focus on temperate crops such as wheat, mustard, potato, and lentil.',
      });
    }
  }

  // Precipitation insights
  if (annual?.totalPrecipitation !== null) {
    const precip = annual.totalPrecipitation;
    if (precip < 400) {
      insights.push({
        type: 'warning',
        title: 'Low Annual Rainfall',
        message: `Annual precipitation is approximately ${Math.round(precip)} mm — considered low for most staple crops. Water pressure may be a key challenge.`,
        factor: 'precipitation',
        actionable: 'Prioritize drought-tolerant crops (millet, sorghum, chickpea, lentil) and review irrigation options.',
      });
    } else if (precip < 700) {
      insights.push({
        type: 'moderate',
        title: 'Moderate Rainfall',
        message: `Annual precipitation of approximately ${Math.round(precip)} mm is moderate. Supplemental irrigation may be needed for high-demand crops.`,
        factor: 'precipitation',
        actionable: 'Medium water-demand crops perform well here. High-demand crops like rice may need irrigation support.',
      });
    } else if (precip <= 1500) {
      insights.push({
        type: 'positive',
        title: 'Adequate Rainfall',
        message: `Annual precipitation of approximately ${Math.round(precip)} mm is adequate for a wide range of crops.`,
        factor: 'precipitation',
        actionable: 'Most common crops can be supported. Monitor distribution across seasons.',
      });
    } else {
      insights.push({
        type: 'moderate',
        title: 'High Rainfall',
        message: `Annual precipitation of approximately ${Math.round(precip)} mm is relatively high. Flooding risk may be present in lower areas.`,
        factor: 'precipitation',
        actionable: 'Ensure adequate drainage. Rice and flood-tolerant crops perform well. Avoid drought-sensitive species in low areas.',
      });
    }
  }

  // Humidity insights
  if (annual?.avgHumidity !== null) {
    const hum = annual.avgHumidity;
    if (hum > 80) {
      insights.push({
        type: 'warning',
        title: 'High Humidity',
        message: `Average humidity of ${hum}% creates conditions where fungal diseases can develop more readily.`,
        factor: 'humidity',
        actionable: 'Choose disease-resistant varieties. Maintain good canopy airflow. Monitor for early blight, fungal infections.',
      });
    }
  }

  // Solar radiation
  if (annual?.avgSolarRadiation !== null) {
    const solar = annual.avgSolarRadiation;
    if (solar >= 16) {
      insights.push({
        type: 'positive',
        title: 'High Solar Radiation',
        message: `Solar radiation averaging ${solar} MJ/m²/day is high — favorable for photosynthesis and crop productivity.`,
        factor: 'solar',
        actionable: 'High solar availability supports high-productivity crops. Ensure water is available to match this growing potential.',
      });
    }
  }

  return insights;
}

/**
 * Generate adaptation actions based on selected farm challenges.
 */
export function generateAdaptationPlan(challenges, farm, climateData) {
  const actions = [];

  const challengeActions = {
    'Increasing temperature': [
      {
        priority: 'High',
        action: 'Explore heat-tolerant crop varieties',
        reason: 'Rising temperatures increase heat stress on many traditional varieties. Heat-tolerant options can maintain productivity as conditions shift.',
        climateLink: 'Temperature trend',
        category: 'Crop Selection',
        timeframe: 'Next season',
      },
      {
        priority: 'High',
        action: 'Adjust planting calendar to avoid peak heat',
        reason: 'Shifting planting dates can reduce crop exposure to peak temperature periods, particularly during flowering and grain-fill stages.',
        climateLink: 'Seasonal temperature patterns',
        category: 'Timing',
        timeframe: 'Next season',
      },
      {
        priority: 'Moderate',
        action: 'Diversify crop selection to include warm-tolerant options',
        reason: 'Reducing dependence on a single crop that is sensitive to heat lowers overall climate risk.',
        climateLink: 'Temperature projection',
        category: 'Diversification',
        timeframe: '2–3 seasons',
      },
    ],
    'Drought': [
      {
        priority: 'High',
        action: 'Prioritize drought-tolerant crops in the rotation',
        reason: 'Drought-tolerant crops like millet, sorghum, and chickpea maintain yields under water-limited conditions.',
        climateLink: 'Precipitation deficit',
        category: 'Crop Selection',
        timeframe: 'Immediate',
      },
      {
        priority: 'High',
        action: 'Review and improve water capture and storage',
        reason: 'Every unit of rainfall captured and stored reduces dependency on groundwater and irrigation.',
        climateLink: 'Rainfall variability',
        category: 'Water Management',
        timeframe: 'Pre-season',
      },
      {
        priority: 'Moderate',
        action: 'Reduce high-water-demand crops in the rotation',
        reason: 'Crops like rice require substantial water. In water-scarce conditions, they may not be sustainable without reliable irrigation.',
        climateLink: 'Water availability',
        category: 'Rotation Strategy',
        timeframe: '1–2 seasons',
      },
    ],
    'Irregular rainfall': [
      {
        priority: 'High',
        action: 'Diversify crops across different water requirements',
        reason: 'A mix of crops with varying water needs provides a buffer — when rains are irregular, lower-demand crops can still perform.',
        climateLink: 'Precipitation variability',
        category: 'Risk Spread',
        timeframe: 'Next season',
      },
      {
        priority: 'Moderate',
        action: 'Review planting windows and stay flexible',
        reason: 'Irregular rainfall may shift seasonal windows. Tracking real-time conditions and adjusting planting timing improves outcomes.',
        climateLink: 'Seasonal patterns',
        category: 'Timing',
        timeframe: 'Ongoing',
      },
    ],
    'Excess rainfall': [
      {
        priority: 'High',
        action: 'Improve field drainage infrastructure',
        reason: 'Waterlogging reduces oxygen available to roots and can destroy crops rapidly. Good drainage protects yield in wet years.',
        climateLink: 'Precipitation excess',
        category: 'Infrastructure',
        timeframe: 'Pre-season',
      },
      {
        priority: 'Moderate',
        action: 'Include flood-tolerant crops in the rotation',
        reason: 'Crops like rice can tolerate wet conditions better than others. Strategic placement in the rotation can reduce risk in wet periods.',
        climateLink: 'Flood risk',
        category: 'Crop Selection',
        timeframe: 'Next season',
      },
    ],
    'Water shortage': [
      {
        priority: 'High',
        action: 'Transition toward lower water-demand crops',
        reason: 'Crops with lower water requirements maintain productivity without placing excessive pressure on limited water resources.',
        climateLink: 'Water availability',
        category: 'Crop Selection',
        timeframe: 'Next season',
      },
      {
        priority: 'Moderate',
        action: 'Explore efficient irrigation methods',
        reason: 'Drip and sprinkler systems can significantly reduce water use compared to flood irrigation while maintaining crop performance.',
        climateLink: 'Water balance',
        category: 'Infrastructure',
        timeframe: '1–2 seasons',
      },
    ],
    'Soil degradation': [
      {
        priority: 'High',
        action: 'Introduce legumes into the rotation',
        reason: 'Legumes fix atmospheric nitrogen and improve soil structure. They are one of the most effective ways to begin restoring degraded soils.',
        climateLink: 'Soil health',
        category: 'Rotation Strategy',
        timeframe: 'Next season',
      },
      {
        priority: 'High',
        action: 'Minimize bare soil periods',
        reason: 'Cover crops between main seasons protect against erosion, improve organic matter, and support soil biology.',
        climateLink: 'Soil condition',
        category: 'Soil Management',
        timeframe: 'Next season',
      },
    ],
    'Changing growing season': [
      {
        priority: 'Moderate',
        action: 'Monitor seasonal onset dates closely',
        reason: 'Shifting monsoon onset and seasonal patterns mean fixed planting calendars may no longer be optimal.',
        climateLink: 'Seasonal trends',
        category: 'Monitoring',
        timeframe: 'Ongoing',
      },
      {
        priority: 'Moderate',
        action: 'Explore shorter-duration crop varieties',
        reason: 'Shorter-cycle varieties can fit within compressed or shifted growing windows, reducing exposure to season-end weather risks.',
        climateLink: 'Seasonal length',
        category: 'Crop Selection',
        timeframe: '1–2 seasons',
      },
    ],
    'Extreme weather': [
      {
        priority: 'High',
        action: 'Diversify crops and avoid monoculture',
        reason: 'Crop diversity acts as a natural risk buffer. Extreme weather rarely impacts all crop types equally.',
        climateLink: 'Climate variability',
        category: 'Risk Spread',
        timeframe: 'Immediate',
      },
      {
        priority: 'Moderate',
        action: 'Explore crop insurance and risk management options',
        reason: 'Financial risk management tools can provide a safety net when extreme events affect yields.',
        climateLink: 'Climate risk',
        category: 'Risk Management',
        timeframe: 'Pre-season',
      },
    ],
  };

  for (const challenge of challenges) {
    const actions_for_challenge = challengeActions[challenge];
    if (actions_for_challenge) {
      actions.push({
        challenge,
        actions: actions_for_challenge,
      });
    }
  }

  return actions;
}

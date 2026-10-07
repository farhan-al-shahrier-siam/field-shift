/**
 * NASA POWER API Service
 * Documentation: https://power.larc.nasa.gov/api/temporal/
 * No API key required for standard POWER endpoints.
 */

const NASA_POWER_BASE = 'https://power.larc.nasa.gov/api/temporal';

// NASA POWER parameters we use
const CLIMATE_PARAMS = [
  'T2M',        // Temperature at 2 Meters (°C)
  'T2M_MAX',    // Maximum Temperature at 2 Meters (°C)
  'T2M_MIN',    // Minimum Temperature at 2 Meters (°C)
  'PRECTOTCORR', // Precipitation (mm/day)
  'RH2M',       // Relative Humidity at 2 Meters (%)
  'ALLSKY_SFC_SW_DWN', // Solar Radiation (MJ/m²/day)
  'WS2M',       // Wind Speed at 2 Meters (m/s)
  'T2MDEW',     // Dew/Frost Point at 2 Meters (°C)
].join(',');

/**
 * Fetch monthly averaged climate data for a location.
 */
export async function fetchNASAMonthly(lat, lon, year = null) {
  const currentYear = new Date().getFullYear();
  const endYear = year || currentYear - 1; // Use last complete year
  const startYear = endYear - 4; // 5 years of data

  const url = `${NASA_POWER_BASE}/monthly/point?parameters=${CLIMATE_PARAMS}&community=AG&longitude=${lon}&latitude=${lat}&start=${startYear}&end=${endYear}&format=JSON`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 * 24 }, // cache 24h
  });

  if (!response.ok) {
    throw new Error(`NASA POWER API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Fetch daily climate data for a location (last 30 days).
 */
export async function fetchNASADaily(lat, lon, daysBack = 30) {
  const end = new Date();
  end.setDate(end.getDate() - 3); // POWER has ~3 day lag
  const start = new Date(end);
  start.setDate(start.getDate() - daysBack);

  const fmt = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  const params = 'T2M,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN,WS2M';
  const url = `${NASA_POWER_BASE}/daily/point?parameters=${params}&community=AG&longitude=${lon}&latitude=${lat}&start=${fmt(start)}&end=${fmt(end)}&format=JSON`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 * 6 }, // cache 6h
  });

  if (!response.ok) {
    throw new Error(`NASA POWER API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Process NASA POWER monthly response into normalized climate data.
 */
export function processNASAMonthly(data) {
  const params = data?.properties?.parameter;
  if (!params) throw new Error('Invalid NASA POWER response structure');

  // Build monthly averages across all available years
  const monthlyAvg = {};
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const getValuesForMonth = (paramObj, mKey) => {
    if (!paramObj) return [];
    return Object.entries(paramObj)
      .filter(([k, v]) => k.length === 6 && k.endsWith(mKey) && v !== -999 && v !== null && v !== undefined)
      .map(([, v]) => v);
  };

  for (let m = 1; m <= 12; m++) {
    const mKey = String(m).padStart(2, '0');
    const monthLabel = monthNames[m - 1];

    const temps = getValuesForMonth(params.T2M, mKey);
    const precip = getValuesForMonth(params.PRECTOTCORR, mKey);
    const humidity = getValuesForMonth(params.RH2M, mKey);
    const solar = getValuesForMonth(params.ALLSKY_SFC_SW_DWN, mKey);
    const wind = getValuesForMonth(params.WS2M, mKey);

    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    monthlyAvg[monthLabel] = {
      month: monthLabel,
      monthIndex: m,
      temperature: avg(temps) !== null ? Math.round(avg(temps) * 10) / 10 : null,
      precipitation: avg(precip) !== null ? Math.round(avg(precip) * 10 * 30) / 10 : null, // daily mm/day -> monthly mm (~30 days)
      humidity: avg(humidity) !== null ? Math.round(avg(humidity) * 10) / 10 : null,
      solarRadiation: avg(solar) !== null ? Math.round(avg(solar) * 100) / 100 : null,
      windSpeed: avg(wind) !== null ? Math.round(avg(wind) * 10) / 10 : null,
    };
  }

  // Compute annual summaries
  const allMonths = Object.values(monthlyAvg);
  const validTemps = allMonths.filter(m => m.temperature !== null).map(m => m.temperature);
  const validPrecip = allMonths.filter(m => m.precipitation !== null).map(m => m.precipitation);
  const validHumidity = allMonths.filter(m => m.humidity !== null).map(m => m.humidity);
  const validSolar = allMonths.filter(m => m.solarRadiation !== null).map(m => m.solarRadiation);
  const validWind = allMonths.filter(m => m.windSpeed !== null).map(m => m.windSpeed);

  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  return {
    monthly: monthlyAvg,
    annual: {
      avgTemperature: avg(validTemps) !== null ? Math.round(avg(validTemps) * 10) / 10 : null,
      maxTemperature: validTemps.length ? Math.round(Math.max(...validTemps) * 10) / 10 : null,
      minTemperature: validTemps.length ? Math.round(Math.min(...validTemps) * 10) / 10 : null,
      totalPrecipitation: validPrecip.reduce((a, b) => a + b, 0),
      avgHumidity: avg(validHumidity) !== null ? Math.round(avg(validHumidity) * 10) / 10 : null,
      avgSolarRadiation: avg(validSolar) !== null ? Math.round(avg(validSolar) * 100) / 100 : null,
      avgWindSpeed: avg(validWind) !== null ? Math.round(avg(validWind) * 10) / 10 : null,
    },
    source: 'NASA POWER',
    parameters: CLIMATE_PARAMS,
    isDemo: false,
  };
}

/**
 * Demo data used when NASA API is unavailable.
 * Labeled clearly as demo data.
 */
export function getDemoClimateData(lat, lon) {
  // Approximate seasonal bias based on hemisphere
  const isNorthern = lat >= 0;
  const tempBase = Math.max(10, Math.min(35, 25 - Math.abs(lat) * 0.3));

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthly = {};

  for (let i = 0; i < 12; i++) {
    const seasonalOffset = isNorthern
      ? Math.sin(((i - 1) / 12) * 2 * Math.PI) * 8
      : Math.sin(((i + 5) / 12) * 2 * Math.PI) * 8;

    const rainPeak = isNorthern ? [5,6,7,8] : [11,0,1,2];
    const isRainy = rainPeak.includes(i);

    monthly[monthNames[i]] = {
      month: monthNames[i],
      monthIndex: i + 1,
      temperature: Math.round((tempBase + seasonalOffset) * 10) / 10,
      precipitation: isRainy ? Math.round((80 + Math.random() * 80) * 10) / 10 : Math.round((10 + Math.random() * 40) * 10) / 10,
      humidity: isRainy ? Math.round((70 + Math.random() * 20) * 10) / 10 : Math.round((45 + Math.random() * 25) * 10) / 10,
      solarRadiation: Math.round((12 + seasonalOffset * 0.5 + Math.random() * 4) * 100) / 100,
      windSpeed: Math.round((2 + Math.random() * 4) * 10) / 10,
    };
  }

  const allMonths = Object.values(monthly);
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    monthly,
    annual: {
      avgTemperature: Math.round(avg(allMonths.map(m => m.temperature)) * 10) / 10,
      maxTemperature: Math.round(Math.max(...allMonths.map(m => m.temperature)) * 10) / 10,
      minTemperature: Math.round(Math.min(...allMonths.map(m => m.temperature)) * 10) / 10,
      totalPrecipitation: Math.round(allMonths.reduce((a, m) => a + m.precipitation, 0) * 10) / 10,
      avgHumidity: Math.round(avg(allMonths.map(m => m.humidity)) * 10) / 10,
      avgSolarRadiation: Math.round(avg(allMonths.map(m => m.solarRadiation)) * 100) / 100,
      avgWindSpeed: Math.round(avg(allMonths.map(m => m.windSpeed)) * 10) / 10,
    },
    source: 'NASA POWER (Demo)',
    isDemo: true,
  };
}

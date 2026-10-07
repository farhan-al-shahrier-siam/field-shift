'use client';

import { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { FarmProvider, useFarm } from '@/context/FarmContext';
import {
  LoadingState, ErrorState, DemoBanner, SectionHeader, SkeletonCard
} from '@/components/ui/UIComponents';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { generateClimateInsights } from '@/lib/climate';

function ClimateContent() {
  const { farm, climateData, climateLoading, climateError, isDemo, fetchClimate } = useFarm();
  const [activeView, setActiveView] = useState('overview');
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [searching, setSearching] = useState(false);

  const chartData = climateData?.monthly
    ? Object.values(climateData.monthly).map(m => ({
        month: m.month,
        temperature: m.temperature,
        maxTemp: m.temperature !== null ? m.temperature + 3.5 : null,
        minTemp: m.temperature !== null ? m.temperature - 3.5 : null,
        rainfall: m.precipitation,
        humidity: m.humidity,
        solar: m.solarRadiation,
        wind: m.windSpeed,
      }))
    : [];

  const insights = climateData ? generateClimateInsights(climateData, farm) : [];

  async function searchLocation() {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon)) return;
    setSearching(true);
    await fetchClimate(lat, lon);
    setSearching(false);
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '12px 16px',
          minWidth: '140px',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.85rem' }}>
              <span style={{ color: p.color }}>{p.name}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <SectionHeader
        label="NASA CLIMATE DATA EXPLORER"
        title="Climate Intelligence"
        subtitle="Explore NASA POWER satellite climate data for any location worldwide."
      />

      {/* Location search */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Latitude</label>
            <input
              type="number"
              className="field-input"
              value={customLat}
              onChange={e => setCustomLat(e.target.value)}
              placeholder={farm?.location?.lat?.toString() || '24.3745'}
              step="0.01"
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Longitude</label>
            <input
              type="number"
              className="field-input"
              value={customLon}
              onChange={e => setCustomLon(e.target.value)}
              placeholder={farm?.location?.lon?.toString() || '88.6042'}
              step="0.01"
            />
          </div>
          <button
            className="btn-primary"
            onClick={searchLocation}
            disabled={searching}
            style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
          >
            {searching ? '…' : '🔍 Fetch Climate Data'}
          </button>
          {farm?.location && (
            <button
              className="btn-secondary"
              onClick={() => fetchClimate(farm.location.lat, farm.location.lon)}
              style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}
            >
              My Farm Location
            </button>
          )}
        </div>

        {climateData && (
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing data for: <strong style={{ color: 'var(--green-300)' }}>
              {farm?.location?.name || `${farm?.location?.lat?.toFixed(2) || customLat}°, ${farm?.location?.lon?.toFixed(2) || customLon}°`}
            </strong>
            {' · '}<span style={{ color: '#60b4d8' }}>Source: {climateData.source}</span>
          </div>
        )}
      </div>

      {isDemo && <div style={{ marginBottom: '16px' }}><DemoBanner /></div>}

      {climateLoading && (
        <LoadingState messages={['Querying NASA POWER API…', 'Processing climate parameters…', 'Computing monthly averages…']} />
      )}

      {climateError && (
        <ErrorState
          message="NASA climate data is temporarily unavailable. Please try again or check your coordinates."
          onRetry={() => farm?.location && fetchClimate(farm.location.lat, farm.location.lon)}
        />
      )}

      {climateData && !climateLoading && (
        <>
          {/* View tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[
              { key: 'overview', label: '📊 Overview' },
              { key: 'temperature', label: '🌡️ Temperature' },
              { key: 'precipitation', label: '🌧️ Precipitation' },
              { key: 'solar', label: '☀️ Solar & Wind' },
              { key: 'insights', label: '💡 Insights' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: activeView === tab.key ? 'var(--green-400)' : 'var(--border-subtle)',
                  background: activeView === tab.key ? 'rgba(82, 183, 136, 0.15)' : 'transparent',
                  color: activeView === tab.key ? 'var(--green-300)' : 'var(--text-muted)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: activeView === tab.key ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeView === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Avg Temperature', value: `${climateData.annual.avgTemperature}°C`, icon: '🌡️' },
                  { label: 'Max Temperature', value: `${climateData.annual.maxTemperature}°C`, icon: '🔥' },
                  { label: 'Min Temperature', value: `${climateData.annual.minTemperature}°C`, icon: '❄️' },
                  { label: 'Annual Rainfall', value: `${Math.round(climateData.annual.totalPrecipitation)} mm`, icon: '🌧️' },
                  { label: 'Avg Humidity', value: `${climateData.annual.avgHumidity}%`, icon: '💧' },
                  { label: 'Solar Radiation', value: `${climateData.annual.avgSolarRadiation} MJ/m²`, icon: '☀️' },
                  { label: 'Wind Speed', value: `${climateData.annual.avgWindSpeed} m/s`, icon: '💨' },
                ].map(stat => (
                  <div key={stat.label} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{stat.icon}</div>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Combined overview chart */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 600, marginBottom: '16px' }}>Monthly Climate Overview</div>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.08)" />
                      <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="temp" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="rain" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} />
                      <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="var(--green-400)" strokeWidth={2} dot={false} />
                      <Line yAxisId="rain" type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="var(--blue-light)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Temperature detail */}
          {activeView === 'temperature' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Monthly Temperature Profile</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Average temperature at 2 meters — NASA POWER T2M parameter.
              </p>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.08)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit="°C" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="temperature" name="Avg Temp (°C)" stroke="var(--green-400)" fill="rgba(64, 145, 108, 0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(10,31,20,0.5)', borderRadius: '10px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  <strong style={{ color: 'var(--green-300)' }}>Agricultural implication:</strong>{' '}
                  {climateData.annual.avgTemperature > 30
                    ? 'High average temperatures may increase evapotranspiration and heat stress on sensitive crops during peak months.'
                    : climateData.annual.avgTemperature > 22
                      ? 'Warm conditions are broadly suitable for tropical and subtropical crops.'
                      : 'Cooler conditions favor temperate crops. Tropical varieties may struggle in the coldest months.'}
                </p>
              </div>
            </div>
          )}

          {/* Precipitation detail */}
          {activeView === 'precipitation' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Monthly Precipitation Pattern</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Corrected precipitation — NASA POWER PRECTOTCORR parameter.
              </p>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.08)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit="mm" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="rainfall" name="Rainfall (mm)" fill="var(--blue-light)" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(10,31,20,0.5)', borderRadius: '10px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  <strong style={{ color: 'var(--green-300)' }}>Agricultural implication:</strong>{' '}
                  {climateData.annual.totalPrecipitation < 400
                    ? 'Very low annual precipitation. Irrigation is likely essential for most crops. Drought-tolerant species should be prioritized.'
                    : climateData.annual.totalPrecipitation < 800
                      ? 'Moderate rainfall. Suitable for many crops with supplemental irrigation during dry periods.'
                      : 'Adequate to high rainfall. Focus on seasonal distribution — planting windows matter more than total volume.'}
                </p>
              </div>
            </div>
          )}

          {/* Solar & Wind */}
          {activeView === 'solar' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Solar Radiation</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  All-sky surface shortwave downward irradiance — NASA POWER ALLSKY_SFC_SW_DWN.
                </p>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.08)" />
                      <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="solar" name="Solar (MJ/m²/day)" stroke="#fbbf24" fill="rgba(251, 191, 36, 0.1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Wind Speed</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Wind speed at 2 meters — NASA POWER WS2M parameter.
                </p>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.08)" />
                      <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit="m/s" />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="wind" name="Wind (m/s)" stroke="#60b4d8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          {activeView === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {insights.length === 0 ? (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No specific insights generated for this location's climate profile.</p>
                </div>
              ) : (
                insights.map((insight, i) => (
                  <div key={i} className="glass-card" style={{
                    padding: '24px',
                    borderLeft: `3px solid ${insight.type === 'positive' ? 'var(--green-400)' : insight.type === 'warning' ? '#f87171' : '#fbbf24'}`,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{insight.title}</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '10px' }}>{insight.message}</p>
                    <p style={{ color: 'var(--green-300)', fontSize: '0.82rem', fontWeight: 500 }}>→ {insight.actionable}</p>
                  </div>
                ))
              )}

              <div className="nasa-attribution" style={{ marginTop: '8px' }}>
                <span>🛰️</span>
                Environmental data powered by{' '}
                <a href="https://power.larc.nasa.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#60b4d8' }}>
                  NASA POWER API
                </a>
                . Climate data represents multi-year monthly averages.
              </div>
            </div>
          )}
        </>
      )}

      {!climateData && !climateLoading && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🌍</div>
          <h3 style={{ marginBottom: '8px' }}>Enter coordinates to explore climate data</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Or{' '}
            <a href="/dashboard/setup" style={{ color: 'var(--green-400)', textDecoration: 'none' }}>
              set up your farm
            </a>{' '}
            to automatically load data for your location.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ClimatePage() {
  return (
    <FarmProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <div className="container-app">
            <ClimateContent />
          </div>
        </main>
        <Footer />
      </div>
    </FarmProvider>
  );
}

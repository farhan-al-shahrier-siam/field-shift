'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { FarmProvider, useFarm } from '@/context/FarmContext';
import {
  ClimateCard, LoadingState, ErrorState, EmptyState,
  DemoBanner, SectionHeader, RiskBadge, SuitabilityScore
} from '@/components/ui/UIComponents';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { generateClimateInsights } from '@/lib/climate';
import { computeResilienceScore } from '@/lib/recommendation';

function DashboardContent() {
  const router = useRouter();
  const { farm, climateData, climateLoading, climateError, isDemo, fetchClimate } = useFarm();
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [resilience, setResilience] = useState(null);
  const [insights, setInsights] = useState([]);
  const [activeChart, setActiveChart] = useState('temperature');

  const hasLocation = Boolean(farm?.location?.lat && farm?.location?.lon);

  // Auto-fetch climate if farm exists but climate data is not yet loaded
  useEffect(() => {
    if (hasLocation && !climateData && !climateLoading) {
      fetchClimate(farm.location.lat, farm.location.lon);
    }
  }, [hasLocation, climateData, climateLoading]);

  // Fetch recommendations and insights when climate data is ready
  useEffect(() => {
    if (climateData) {
      fetchRecommendations();
      setInsights(generateClimateInsights(climateData, farm));
      const crops = farm?.currentCrop ? [farm.currentCrop] : [];
      const res = computeResilienceScore(farm, climateData, crops);
      setResilience(res);
    }
  }, [climateData, farm?.currentCrop]);

  async function fetchRecommendations() {
    if (!climateData?.annual) return;
    setRecLoading(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avgTemperature: climateData.annual.avgTemperature,
          totalPrecipitation: climateData.annual.totalPrecipitation,
          waterAvailability: farm.waterAvailability,
          season: farm.farmingSeason,
          soilType: farm.soilType,
          challenges: farm.challenges,
          topN: 3,
        }),
      });
      const json = await res.json();
      if (json.success) setRecommendations(json.recommendations);
    } catch (e) {
      console.error('Rec fetch failed', e);
    } finally {
      setRecLoading(false);
    }
  }

  // Build chart data from monthly climate
  const chartData = climateData?.monthly
    ? Object.values(climateData.monthly).map(m => ({
        month: m.month,
        temperature: m.temperature,
        rainfall: m.precipitation,
        humidity: m.humidity,
        solar: m.solarRadiation,
      }))
    : [];

  if (!hasLocation) {
    return (
      <div style={{ padding: '48px 0' }}>
        <FarmSetupPrompt />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 0 64px' }}>
      {/* Demo banner */}
      {isDemo && (
        <div style={{ marginBottom: '16px' }}>
          <DemoBanner />
        </div>
      )}

      {/* Farm header */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green-400)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>
              YOUR FARM CLIMATE PROFILE
            </div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              {farm.location?.name || `${farm.location.lat.toFixed(2)}°, ${farm.location.lon.toFixed(2)}°`}
            </h1>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {farm.currentCrop && <span className="badge badge-green">🌾 {farm.currentCrop}</span>}
              {farm.waterAvailability && <span className="badge badge-blue">💧 {farm.waterAvailability} Water</span>}
              {farm.farmingSeason && <span className="badge badge-green">📅 {farm.farmingSeason}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              onClick={() => fetchClimate(farm.location.lat, farm.location.lon)}
            >
              ↻ Refresh Data
            </button>
            <Link href="/dashboard/setup" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '8px 16px' }}>
              Edit Farm
            </Link>
          </div>
        </div>
      </div>

      {climateLoading && (
        <LoadingState messages={['Connecting to NASA POWER…', 'Analyzing climate data…', 'Building your farm profile…']} />
      )}

      {climateError && !climateData && (
        <ErrorState
          message={`NASA climate data is temporarily unavailable. ${climateError}`}
          onRetry={() => fetchClimate(farm.location.lat, farm.location.lon)}
        />
      )}

      {climateData && !climateLoading && (
        <>
          {/* Climate Snapshot */}
          <SectionHeader label="NASA CLIMATE SNAPSHOT" title="Current Climate Conditions" subtitle="Monthly averages from NASA POWER satellite data." />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <ClimateCard
              title="Avg Temperature"
              value={climateData.annual.avgTemperature}
              unit="°C"
              icon="🌡️"
              trend={climateData.annual.avgTemperature > 30 ? 'up' : climateData.annual.avgTemperature < 15 ? 'down' : 'stable'}
              description={climateData.annual.avgTemperature > 30 ? 'Warm conditions — higher-than-average temperatures' : 'Within typical range'}
            />
            <ClimateCard
              title="Annual Rainfall"
              value={climateData.annual.totalPrecipitation ? Math.round(climateData.annual.totalPrecipitation) : null}
              unit="mm"
              icon="🌧️"
              description={climateData.annual.totalPrecipitation < 500 ? 'Low rainfall — drought risk elevated' : 'Moderate to adequate rainfall'}
            />
            <ClimateCard
              title="Avg Humidity"
              value={climateData.annual.avgHumidity}
              unit="%"
              icon="💧"
            />
            <ClimateCard
              title="Solar Radiation"
              value={climateData.annual.avgSolarRadiation}
              unit="MJ/m²/day"
              icon="☀️"
            />
            <ClimateCard
              title="Wind Speed"
              value={climateData.annual.avgWindSpeed}
              unit="m/s"
              icon="💨"
            />
          </div>

          {/* Charts */}
          <SectionHeader label="CLIMATE TRENDS" title="Monthly Patterns" subtitle="5-year monthly averages from NASA POWER." />

          <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[
                { key: 'temperature', label: '🌡️ Temperature' },
                { key: 'rainfall', label: '🌧️ Rainfall' },
                { key: 'humidity', label: '💧 Humidity' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveChart(tab.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: activeChart === tab.key ? 'var(--green-400)' : 'var(--border-subtle)',
                    background: activeChart === tab.key ? 'rgba(82, 183, 136, 0.15)' : 'transparent',
                    color: activeChart === tab.key ? 'var(--green-300)' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: activeChart === tab.key ? 600 : 400,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'rainfall' ? (
                  <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.08)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-primary)' }} />
                    <Bar dataKey="rainfall" name="Rainfall (mm)" fill="var(--green-500)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.08)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-primary)' }} />
                    <Line
                      type="monotone"
                      dataKey={activeChart}
                      name={activeChart === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)'}
                      stroke="var(--green-400)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--green-400)', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(10, 31, 20, 0.5)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                <strong style={{ color: 'var(--green-300)' }}>What does this mean for your farm?</strong>{' '}
                {activeChart === 'temperature' && (climateData.annual.avgTemperature > 30
                  ? 'Temperatures are trending warm. High-demand crops like rice may face heat stress. Consider heat-tolerant varieties or adjusted planting windows.'
                  : 'Temperature conditions appear broadly favorable for a range of crop types.')}
                {activeChart === 'rainfall' && (climateData.annual.totalPrecipitation < 500
                  ? 'Annual rainfall is low. Water-efficient crops and irrigation planning are important considerations.'
                  : climateData.annual.totalPrecipitation > 1500
                    ? 'High annual rainfall — good for water-intensive crops, but manage drainage to prevent waterlogging.'
                    : 'Rainfall levels appear adequate for a range of crops. Seasonal distribution matters most.')}
                {activeChart === 'humidity' && (climateData.annual.avgHumidity > 75
                  ? 'High humidity increases fungal disease risk. Choose resistant varieties and ensure good airflow.'
                  : 'Humidity levels are within manageable ranges for most crops.')}
              </p>
            </div>
          </div>

          {/* Climate Insights */}
          {insights.length > 0 && (
            <>
              <SectionHeader label="INSIGHTS" title="What the Climate Tells Your Farm" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {insights.map((insight, i) => (
                  <div key={i} className="glass-card" style={{
                    padding: '20px',
                    borderLeft: `3px solid ${insight.type === 'positive' ? 'var(--green-400)' : insight.type === 'warning' ? '#f87171' : '#fbbf24'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.95rem' }}>
                          {insight.title}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '8px' }}>
                          {insight.message}
                        </p>
                        <p style={{ color: 'var(--green-300)', fontSize: '0.8rem', fontWeight: 500 }}>
                          → {insight.actionable}
                        </p>
                      </div>
                      <RiskBadge level={insight.type === 'positive' ? 'Low' : insight.type === 'warning' ? 'High' : 'Moderate'} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Resilience Score */}
          {resilience && (
            <>
              <SectionHeader label="FIELD SHIFT RESILIENCE SCORE" title="Farm Resilience Profile" />
              <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    border: `4px solid ${resilience.percentage >= 70 ? 'var(--green-400)' : resilience.percentage >= 50 ? '#fbbf24' : '#f87171'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(10, 31, 20, 0.6)',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                      {resilience.percentage}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '4px' }}>
                      {resilience.grade} Resilience
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '400px', fontStyle: 'italic' }}>
                      {resilience.disclaimer}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.values(resilience.components).map(comp => (
                    <div key={comp.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{comp.label}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{comp.score}/{comp.max}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(comp.score / comp.max) * 100}%`,
                            background: comp.score / comp.max >= 0.7 ? 'var(--green-400)' : comp.score / comp.max >= 0.5 ? '#fbbf24' : '#f87171',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Quick recommendations */}
          {recommendations.length > 0 && (
            <>
              <SectionHeader label="CROP RECOMMENDATIONS" title="Suggested Alternatives" subtitle="Based on NASA climate data and your farm conditions." />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {recommendations.slice(0, 3).map((rec, i) => (
                  <div key={rec.crop} className="glass-card glass-card-hover" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{rec.icon || '🌾'}</span>
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                        #{i + 1} Match
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{rec.crop}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>
                      {rec.waterRequirement} water · {rec.droughtTolerance} drought tolerance
                    </div>
                    <SuitabilityScore score={rec.score} />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Link href="/crop-recommendation" className="btn-secondary" style={{ textDecoration: 'none' }}>
                  View Full Recommendations →
                </Link>
              </div>
            </>
          )}

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { href: '/rotation-planner', icon: '🔄', title: 'Rotation Planner', desc: 'Build a smarter crop rotation' },
              { href: '/adaptation-planner', icon: '🗺️', title: 'Adaptation Planner', desc: 'Turn challenges into action steps' },
              { href: '/climate', icon: '🌍', title: 'Climate Explorer', desc: 'Explore full climate dataset' },
              { href: '/compare', icon: '⚖️', title: 'Compare Crops', desc: 'Side-by-side crop analysis' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <div className="glass-card glass-card-hover" style={{ padding: '20px', height: '100%' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{link.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{link.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{link.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FarmSetupPrompt() {
  const { loadDemoFarm } = useFarm();
  const router = useRouter();

  return (
    <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '560px', margin: '40px auto' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌱</div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>No Farm Selected Yet</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6, fontSize: '0.95rem' }}>
        Start by selecting your farm location and farming conditions to explore real NASA satellite climate data, crop recommendations, and adaptation strategies.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          className="btn-primary"
          onClick={() => router.push('/dashboard/setup')}
          style={{ padding: '12px 24px' }}
        >
          📍 Set Up My Farm
        </button>
        <button
          className="btn-secondary"
          onClick={() => loadDemoFarm()}
          style={{ padding: '12px 24px' }}
        >
          ✨ Load Demo Farm
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <FarmProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <div className="container-app">
            <DashboardContent />
          </div>
        </main>
        <Footer />
      </div>
    </FarmProvider>
  );
}

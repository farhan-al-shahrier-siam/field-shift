'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { FarmProvider, useFarm } from '@/context/FarmContext';
import {
  LoadingState, ErrorState, EmptyState, DemoBanner,
  SuitabilityScore, RiskBadge, SectionHeader
} from '@/components/ui/UIComponents';

function RecommendationContent() {
  const { farm, climateData, climateLoading, isDemo } = useFarm();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const hasData = farm?.location?.lat && climateData;

  useEffect(() => {
    if (hasData) fetchRecommendations();
  }, [climateData]);

  async function fetchRecommendations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avgTemperature: climateData.annual.avgTemperature,
          totalPrecipitation: climateData.annual.totalPrecipitation,
          avgHumidity: climateData.annual.avgHumidity,
          waterAvailability: farm.waterAvailability,
          season: farm.farmingSeason,
          soilType: farm.soilType,
          challenges: farm.challenges,
          topN: 6,
        }),
      });
      const json = await res.json();
      if (json.success) setRecommendations(json.recommendations);
      else throw new Error(json.error);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!farm?.location?.lat) {
    return (
      <EmptyState
        icon="🌾"
        title="No farm selected"
        description="Set up your farm first to get personalized crop recommendations based on NASA climate data."
        actionLabel="Set Up My Farm"
        onAction={() => window.location.href = '/dashboard/setup'}
      />
    );
  }

  if (climateLoading || loading) {
    return <LoadingState messages={['Fetching NASA climate data…', 'Matching crops to your conditions…', 'Calculating suitability scores…']} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchRecommendations} />;
  }

  const getScoreColor = (s) => s >= 85 ? 'var(--green-400)' : s >= 70 ? 'var(--green-500)' : s >= 55 ? '#fbbf24' : '#f87171';

  return (
    <div style={{ padding: '40px 0 80px' }}>
      {isDemo && <div style={{ marginBottom: '16px' }}><DemoBanner /></div>}

      <SectionHeader
        label="FIELD SHIFT RECOMMENDATIONS"
        title="What Should I Grow?"
        subtitle={`Based on NASA climate data for ${farm.location?.name || 'your location'} and your farm conditions.`}
      />

      {/* Condition summary */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '4px', alignSelf: 'center' }}>Conditions used:</div>
        {climateData?.annual?.avgTemperature && (
          <span className="badge badge-green">🌡️ {climateData.annual.avgTemperature}°C avg</span>
        )}
        {climateData?.annual?.totalPrecipitation && (
          <span className="badge badge-green">🌧️ {Math.round(climateData.annual.totalPrecipitation)}mm/yr</span>
        )}
        {farm.waterAvailability && <span className="badge badge-blue">💧 {farm.waterAvailability} water</span>}
        {farm.farmingSeason && <span className="badge badge-green">📅 {farm.farmingSeason}</span>}
        {farm.soilType && <span className="badge badge-green">🌍 {farm.soilType}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recommendations.map((rec, i) => (
          <div key={rec.crop} className="glass-card" style={{
            overflow: 'hidden',
            border: i === 0 ? '1px solid rgba(82, 183, 136, 0.35)' : undefined,
          }}>
            {/* Main row */}
            <div
              style={{ padding: '24px', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === rec.crop ? null : rec.crop)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {/* Rank */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: i === 0 ? 'rgba(82, 183, 136, 0.2)' : 'rgba(82, 183, 136, 0.06)',
                  border: `2px solid ${i === 0 ? 'var(--green-400)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: i === 0 ? 'var(--green-300)' : 'var(--text-muted)',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>

                {/* Icon & name */}
                <div style={{ fontSize: '1.8rem' }}>{rec.icon || '🌾'}</div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                    {rec.crop}
                    {i === 0 && <span className="badge badge-green" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>TOP PICK</span>}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>💧 {rec.waterRequirement} water</span>
                    <span>🌡️ {rec.heatTolerance || 'Moderate'} heat tolerance</span>
                    <span>🌵 {rec.droughtTolerance} drought tolerance</span>
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: `3px solid ${getScoreColor(rec.score)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${getScoreColor(rec.score)}15`,
                    margin: '0 auto 4px',
                  }}>
                    <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.1rem', color: getScoreColor(rec.score) }}>
                      {rec.score}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SUITABILITY</div>
                </div>

                {/* Risk */}
                <div style={{ flexShrink: 0 }}>
                  <RiskBadge level={rec.risks?.length > 0 ? 'Moderate' : 'Low'} />
                </div>

                {/* Expand */}
                <div style={{ color: 'var(--text-muted)', fontSize: '1rem', flexShrink: 0 }}>
                  {expanded === rec.crop ? '▲' : '▼'}
                </div>
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === rec.crop && (
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '24px',
                background: 'rgba(10, 31, 20, 0.4)',
              }}>
                {/* Score breakdown */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--green-400)', marginBottom: '12px', letterSpacing: '0.05em' }}>
                    SCORE BREAKDOWN
                  </div>
                  {Object.values(rec.factors || {}).map(factor => (
                    <div key={factor.label} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{factor.label}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{factor.score}/100</span>
                      </div>
                      <div className="suitability-bar">
                        <div
                          className="suitability-fill"
                          style={{
                            width: `${factor.score}%`,
                            background: factor.score >= 70 ? 'var(--green-400)' : factor.score >= 50 ? '#fbbf24' : '#f87171',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Why section */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--green-400)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    WHY THIS CROP?
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, fontStyle: 'italic' }}>
                    "{rec.recommendation}"
                  </p>
                </div>

                {/* Rotation benefits */}
                {rec.rotationBenefits && (
                  <div style={{ padding: '12px 16px', background: 'rgba(82, 183, 136, 0.06)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--green-400)', fontWeight: 600 }}>🔄 Rotation value: </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.rotationBenefits}</span>
                  </div>
                )}

                {/* Risks */}
                {rec.risks?.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    {rec.risks.map((risk, ri) => (
                      <div key={ri} style={{
                        padding: '10px 14px',
                        background: 'rgba(239, 68, 68, 0.06)',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        fontSize: '0.8rem',
                        color: '#f87171',
                        marginTop: '8px',
                      }}>
                        ⚠️ <strong>{risk.factor} risk:</strong> {risk.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {recommendations.length === 0 && !loading && (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No recommendations generated yet. Check that climate data has loaded.</p>
        </div>
      )}

      <div className="glass-card" style={{ padding: '16px', marginTop: '24px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          <strong style={{ color: '#fbbf24' }}>⚠️ Disclaimer:</strong> Field Shift Suitability Scores are experimental decision-support estimates based on publicly available NASA climate data and general crop parameters. They do not guarantee crop success and should not replace local agricultural expertise, soil testing, or professional advice.
        </p>
      </div>
    </div>
  );
}

export default function CropRecommendationPage() {
  return (
    <FarmProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <div className="container-app">
            <RecommendationContent />
          </div>
        </main>
        <Footer />
      </div>
    </FarmProvider>
  );
}

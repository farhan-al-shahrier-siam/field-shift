'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { FarmProvider, useFarm } from '@/context/FarmContext';
import { SectionHeader, EmptyState, LoadingSpinner } from '@/components/ui/UIComponents';

const PRIORITY_COLORS = {
  High: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)', text: '#f87171' },
  Moderate: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)', text: '#fbbf24' },
  Low: { bg: 'rgba(64, 145, 108, 0.1)', border: 'rgba(64, 145, 108, 0.25)', text: 'var(--green-400)' },
};

function AdaptationContent() {
  const { farm, climateData, isDemo } = useFarm();
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState({});

  const hasChallenges = farm?.challenges?.length > 0;

  useEffect(() => {
    if (hasChallenges) generatePlan();
  }, [farm?.challenges]);

  async function generatePlan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/adaptation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenges: farm.challenges,
          farm,
          climateData: climateData?.annual || null,
        }),
      });
      const json = await res.json();
      if (json.success) setPlan(json.plan);
      else throw new Error(json.error);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleAction(key) {
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const allActions = plan.flatMap((p, pi) =>
    p.actions.map((a, ai) => ({ ...a, key: `${pi}-${ai}`, challenge: p.challenge }))
  );
  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalActions = allActions.length;

  if (!farm?.location?.lat) {
    return (
      <EmptyState
        icon="🗺️"
        title="No farm selected"
        description="Set up your farm and select your current challenges to generate a personalized adaptation plan."
        actionLabel="Set Up My Farm"
        onAction={() => window.location.href = '/dashboard/setup'}
      />
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <SectionHeader
        label="FIELD SHIFT ADAPTATION PLANNER"
        title="Adapt My Farm"
        subtitle="Practical actions based on your selected challenges and NASA climate indicators."
      />

      {!hasChallenges && (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            No farming challenges selected. Go back to your farm setup to identify challenges.
          </p>
          <a href="/dashboard/setup" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Update Farm Setup
          </a>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <LoadingSpinner size={40} />
          <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Generating adaptation plan…</p>
        </div>
      )}

      {hasChallenges && !loading && plan.length > 0 && (
        <>
          {/* Progress overview */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Adaptation Progress
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--green-400)', fontWeight: 700 }}>
                  {completedCount} / {totalActions} actions reviewed
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: totalActions > 0 ? `${(completedCount / totalActions) * 100}%` : '0%',
                    background: 'var(--green-400)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Challenge sections */}
          {plan.map((section, si) => (
            <div key={si} style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'rgba(82, 183, 136, 0.06)',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{section.challenge}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.actions.map((action, ai) => {
                  const key = `${si}-${ai}`;
                  const done = completed[key];
                  const pColors = PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.Moderate;

                  return (
                    <div
                      key={ai}
                      className="glass-card"
                      style={{
                        padding: '20px',
                        opacity: done ? 0.6 : 1,
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleAction(key)}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: `2px solid ${done ? 'var(--green-400)' : 'var(--border-medium)'}`,
                            background: done ? 'var(--green-400)' : 'transparent',
                            cursor: 'pointer',
                            flexShrink: 0,
                            marginTop: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--bg-dark)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {done ? '✓' : ''}
                        </button>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            {/* Priority */}
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              background: pColors.bg,
                              border: `1px solid ${pColors.border}`,
                              color: pColors.text,
                            }}>
                              {action.priority} Priority
                            </span>
                            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                              {action.category}
                            </span>
                            {action.timeframe && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                ⏱ {action.timeframe}
                              </span>
                            )}
                          </div>

                          <div style={{
                            fontWeight: 600,
                            color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                            marginBottom: '6px',
                            fontSize: '0.95rem',
                            textDecoration: done ? 'line-through' : 'none',
                          }}>
                            {action.action}
                          </div>

                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '8px' }}>
                            {action.reason}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--blue-light)' }}>🛰️</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Related climate factor: <em>{action.climateLink}</em>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Disclaimer */}
          <div className="glass-card" style={{ padding: '16px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              <strong style={{ color: '#fbbf24' }}>⚠️ Important:</strong> These adaptation actions are general decision-support suggestions based on agronomic principles and climate indicators. They are not specific agricultural prescriptions. Always consult local agricultural extension services and professionals before implementing significant farm changes.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdaptationPlannerPage() {
  return (
    <FarmProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <div className="container-app">
            <AdaptationContent />
          </div>
        </main>
        <Footer />
      </div>
    </FarmProvider>
  );
}

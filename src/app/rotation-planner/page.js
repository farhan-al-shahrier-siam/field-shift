'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { FarmProvider, useFarm } from '@/context/FarmContext';
import { LoadingSpinner, EmptyState, SectionHeader } from '@/components/ui/UIComponents';
import { CROPS_DATA } from '@/data/crops';

const ROTATION_SLOTS = 4;

function RotationContent() {
  const { farm, climateData } = useFarm();
  const [currentRotation, setCurrentRotation] = useState(['', '', '']);
  const [suggestedRotation, setSuggestedRotation] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showShift, setShowShift] = useState(false);

  const cropNames = CROPS_DATA.map(c => c.name);

  function updateSlot(i, value) {
    const next = [...currentRotation];
    next[i] = value;
    setCurrentRotation(next);
  }

  function addSeason() {
    if (currentRotation.length < ROTATION_SLOTS) {
      setCurrentRotation([...currentRotation, '']);
    }
  }

  function removeSeason(i) {
    if (currentRotation.length > 1) {
      setCurrentRotation(currentRotation.filter((_, idx) => idx !== i));
    }
  }

  async function handleShift() {
    const filled = currentRotation.filter(Boolean);
    if (filled.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/rotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRotation: filled,
          conditions: {
            waterAvailability: farm?.waterAvailability,
            season: farm?.farmingSeason,
            soilType: farm?.soilType,
            avgTemperature: climateData?.annual?.avgTemperature,
            totalPrecipitation: climateData?.annual?.totalPrecipitation,
            challenges: farm?.challenges,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuggestedRotation(json.suggestedRotation);
        setComparison(json.comparison);
        setReasons(json.reasons || []);
        setTimeout(() => setShowShift(true), 100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const comparisonRows = comparison ? [
    { label: 'Water Demand', current: comparison.waterDemand?.current, suggested: comparison.waterDemand?.suggested },
    { label: 'Crop Diversity', current: comparison.cropDiversity?.current, suggested: comparison.cropDiversity?.suggested },
    { label: 'Legumes in Rotation', current: comparison.legumesInRotation?.current, suggested: comparison.legumesInRotation?.suggested },
    { label: 'Estimated Climate Risk', current: comparison.climateRisk?.current, suggested: comparison.climateRisk?.suggested },
  ] : [];

  const isPositive = (label, val, type) => {
    if (type === 'suggested') {
      if (label === 'Water Demand') return ['Very Low', 'Low', 'Moderate'].includes(val);
      if (label === 'Crop Diversity') return val === 'High';
      if (label === 'Legumes in Rotation') return val === 'Yes';
      if (label === 'Estimated Climate Risk') return val === 'Lower';
    }
    return false;
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <SectionHeader
        label="FIELD SHIFT ROTATION PLANNER"
        title="Build Your Rotation"
        subtitle="Design your current rotation, then let Field Shift suggest a more resilient alternative."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {/* Current rotation builder */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--green-400)', letterSpacing: '0.1em', marginBottom: '16px' }}>
            CURRENT ROTATION
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {currentRotation.map((crop, i) => (
              <div key={i}>
                <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(82, 183, 136, 0.15)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--green-400)',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <select
                    className="field-input"
                    value={crop}
                    onChange={e => updateSlot(i, e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select crop…</option>
                    {cropNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {currentRotation.length > 1 && (
                    <button
                      onClick={() => removeSeason(i)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '4px',
                      }}
                    >✕</button>
                  )}
                </div>
                {i < currentRotation.length - 1 && (
                  <div style={{ textAlign: 'center', padding: '4px 0', color: 'var(--green-600)' }} className="shift-arrow">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>

          {currentRotation.length < ROTATION_SLOTS && (
            <button
              onClick={addSeason}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '12px', padding: '10px', fontSize: '0.85rem' }}
            >
              + Add Season
            </button>
          )}

          <button
            className="btn-primary"
            onClick={handleShift}
            disabled={loading || currentRotation.filter(Boolean).length === 0}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '14px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: currentRotation.filter(Boolean).length === 0 ? 0.5 : 1,
            }}
          >
            {loading ? (
              <><LoadingSpinner size={18} /> Shifting Rotation…</>
            ) : (
              '🔄 SHIFT MY ROTATION'
            )}
          </button>
        </div>

        {/* Suggested rotation */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--green-400)', letterSpacing: '0.1em', marginBottom: '16px' }}>
            FIELD SHIFT SUGGESTION
          </div>

          {!suggestedRotation ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔄</div>
              <p style={{ fontSize: '0.9rem' }}>Enter your current rotation and click <strong>"SHIFT MY ROTATION"</strong> to see a suggested alternative.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {suggestedRotation.map((item, i) => (
                <div key={i}>
                  <div className="glass-card" style={{
                    padding: '16px',
                    border: '1px solid rgba(82, 183, 136, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: showShift ? `fadeInUp 0.3s ease ${i * 0.1}s both` : 'none',
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(82, 183, 136, 0.2)',
                      border: '1px solid var(--green-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--green-300)',
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.icon || '🌾'} {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.reason}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: item.score >= 70 ? 'var(--green-400)' : '#fbbf24',
                      background: 'rgba(82, 183, 136, 0.1)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      flexShrink: 0,
                    }}>
                      {item.score}%
                    </div>
                  </div>
                  {i < suggestedRotation.length - 1 && (
                    <div style={{ textAlign: 'center', padding: '4px 0', color: 'var(--green-500)' }} className="shift-arrow">↓</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {comparison && (
        <div style={{ marginTop: '40px' }}>
          <SectionHeader label="COMPARISON" title="Current vs Field Shift Plan" />

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em' }}>FACTOR</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em' }}>CURRENT</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--green-400)', fontWeight: 700, letterSpacing: '0.1em' }}>FIELD SHIFT</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} style={{ borderBottom: i < comparisonRows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.label}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span className="badge badge-yellow">{row.current}</span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span className={`badge ${isPositive(row.label, row.suggested, 'suggested') ? 'badge-green' : 'badge-yellow'}`}>
                        {row.suggested}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Why shift section */}
          {reasons.length > 0 && (
            <div className="glass-card" style={{ padding: '24px', marginTop: '20px', border: '1px solid rgba(82, 183, 136, 0.2)' }}>
              <div style={{ fontWeight: 700, color: 'var(--green-300)', marginBottom: '12px' }}>
                🌱 Why shift this rotation?
              </div>
              {reasons.map((reason, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--green-400)', flexShrink: 0 }}>✓</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{reason}</span>
                </div>
              ))}
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '12px' }}>
                These are decision-support suggestions based on general agronomic principles and available climate indicators. Local conditions may vary significantly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RotationPlannerPage() {
  return (
    <FarmProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <div className="container-app">
            <RotationContent />
          </div>
        </main>
        <Footer />
      </div>
    </FarmProvider>
  );
}

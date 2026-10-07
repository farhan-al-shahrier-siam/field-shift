'use client';

import { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { FarmProvider, useFarm } from '@/context/FarmContext';
import { SectionHeader } from '@/components/ui/UIComponents';
import { CROPS_DATA } from '@/data/crops';
import { scoreCrop } from '@/lib/recommendation';

const MAX_COMPARE = 4;

function CompareContent() {
  const { farm, climateData } = useFarm();
  const [selected, setSelected] = useState([]);

  function toggleCrop(name) {
    if (selected.includes(name)) {
      setSelected(selected.filter(c => c !== name));
    } else if (selected.length < MAX_COMPARE) {
      setSelected([...selected, name]);
    }
  }

  const conditions = {
    avgTemperature: climateData?.annual?.avgTemperature || 25,
    totalPrecipitation: climateData?.annual?.totalPrecipitation || 800,
    waterAvailability: farm?.waterAvailability || 'Moderate',
    season: farm?.farmingSeason || 'Kharif',
    soilType: farm?.soilType || 'Loam',
    challenges: farm?.challenges || [],
  };

  const selectedCrops = selected.map(name => {
    const crop = CROPS_DATA.find(c => c.name === name);
    const scored = crop ? scoreCrop(crop, conditions) : null;
    return { ...crop, scored };
  });

  const attributes = [
    { key: 'waterRequirement', label: 'Water Requirement' },
    { key: 'droughtTolerance', label: 'Drought Tolerance' },
    { key: 'heatTolerance', label: 'Heat Tolerance' },
    { key: 'floodTolerance', label: 'Flood Tolerance' },
    { key: 'growingDuration', label: 'Growing Duration', unit: 'days' },
    { key: 'category', label: 'Crop Type' },
    { key: 'marketValue', label: 'Market Value' },
    { key: 'nutritionValue', label: 'Nutrition Profile' },
    { key: 'rotationBenefits', label: 'Rotation Benefits' },
  ];

  const levelOrder = { 'Very Low': 1, 'Low': 2, 'Moderate': 3, 'High': 4, 'Very High': 5 };

  function getBarColor(key, val) {
    if (key === 'waterRequirement') {
      return levelOrder[val] <= 2 ? 'var(--green-400)' : levelOrder[val] <= 3 ? '#fbbf24' : '#f87171';
    }
    if (key === 'droughtTolerance' || key === 'heatTolerance') {
      return levelOrder[val] >= 4 ? 'var(--green-400)' : levelOrder[val] >= 3 ? '#fbbf24' : '#f87171';
    }
    return 'var(--blue-light)';
  }

  function getBarWidth(key, val) {
    if (levelOrder[val]) return `${(levelOrder[val] / 5) * 100}%`;
    if (typeof val === 'number') return `${Math.min(100, (val / 150) * 100)}%`;
    return '50%';
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <SectionHeader
        label="CROP COMPARISON"
        title="Compare Crops"
        subtitle={`Select up to ${MAX_COMPARE} crops to compare side-by-side. Scores are based on your farm conditions.`}
      />

      {/* Crop selector */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '32px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Select crops to compare ({selected.length}/{MAX_COMPARE} selected):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CROPS_DATA.map(crop => {
            const isSelected = selected.includes(crop.name);
            const disabled = !isSelected && selected.length >= MAX_COMPARE;
            return (
              <button
                key={crop.name}
                onClick={() => !disabled && toggleCrop(crop.name)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--green-400)' : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(82, 183, 136, 0.15)' : 'transparent',
                  color: isSelected ? 'var(--green-300)' : disabled ? 'rgba(149, 213, 178, 0.3)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {crop.icon} {crop.name}
              </button>
            );
          })}
        </div>
      </div>

      {selected.length === 0 && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚖️</div>
          <p style={{ color: 'var(--text-muted)' }}>Select at least 2 crops to begin comparison.</p>
        </div>
      )}

      {selectedCrops.length >= 1 && (
        <>
          {/* Suitability scores */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedCrops.length}, 1fr)`, gap: '16px', marginBottom: '24px' }}>
            {selectedCrops.map(crop => (
              <div key={crop.name} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{crop.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{crop.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>{crop.scientificName}</div>
                {crop.scored && (
                  <>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 8px',
                      borderRadius: '50%',
                      border: `3px solid ${crop.scored.score >= 70 ? 'var(--green-400)' : crop.scored.score >= 55 ? '#fbbf24' : '#f87171'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${crop.scored.score >= 70 ? 'rgba(64,145,108,0.1)' : 'rgba(245,158,11,0.1)'}`,
                    }}>
                      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.2rem', color: crop.scored.score >= 70 ? 'var(--green-400)' : '#fbbf24' }}>
                        {crop.scored.score}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Field Shift Score</div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Attribute comparison */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', width: '160px' }}>
                    ATTRIBUTE
                  </th>
                  {selectedCrops.map(crop => (
                    <th key={crop.name} style={{ padding: '14px 20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--green-300)', fontWeight: 700 }}>
                      {crop.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributes.map((attr, i) => (
                  <tr key={attr.key} style={{ borderBottom: i < attributes.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {attr.label}
                    </td>
                    {selectedCrops.map(crop => {
                      const rawVal = attr.key === 'growingDuration' ? crop.growingDuration : crop[attr.key];
                      const val = attr.unit ? `${rawVal} ${attr.unit}` : rawVal || '—';
                      const hasBar = ['waterRequirement', 'droughtTolerance', 'heatTolerance', 'floodTolerance'].includes(attr.key);

                      return (
                        <td key={crop.name} style={{ padding: '14px 20px', textAlign: 'center' }}>
                          {hasBar ? (
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{val}</div>
                              <div className="suitability-bar">
                                <div
                                  className="suitability-fill"
                                  style={{
                                    width: getBarWidth(attr.key, rawVal),
                                    background: getBarColor(attr.key, rawVal),
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span style={{
                              fontSize: '0.82rem',
                              color: 'var(--text-secondary)',
                              display: 'block',
                              lineHeight: 1.4,
                            }}>
                              {val}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <FarmProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <div className="container-app">
            <CompareContent />
          </div>
        </main>
        <Footer />
      </div>
    </FarmProvider>
  );
}

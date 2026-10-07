'use client';

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function AboutPage() {
  const sections = [
    {
      id: 'what',
      title: 'What is Field Shift?',
      content: `Field Shift is an experimental decision-support and educational web application developed for the NASA Space Apps Challenge 2026.

It combines NASA satellite-derived climate and weather data with agricultural information to help users explore:
• Which crops may be more suitable given their local climate conditions
• How to design more resilient crop rotations
• What practical actions they can take to adapt to climate variability
• How their farm's climate resilience profile compares across key factors

Field Shift is intended to make complex climate data more accessible and useful for agricultural decision-making. It is not a precision agricultural tool and should not replace professional agronomic advice.`,
    },
    {
      id: 'nasa-data',
      title: 'What NASA data does Field Shift use?',
      content: `Field Shift uses data from the NASA POWER (Prediction of Worldwide Energy Resources) dataset.

NASA POWER is a freely accessible, satellite-derived climate database maintained by NASA's Langley Research Center. It provides meteorological and solar energy data globally from 1981 to near-present.

Parameters used in Field Shift:
• T2M — Temperature at 2 Meters (°C)
• T2M_MAX — Maximum Temperature at 2 Meters
• T2M_MIN — Minimum Temperature at 2 Meters
• PRECTOTCORR — Corrected Total Precipitation (mm/day)
• RH2M — Relative Humidity at 2 Meters (%)
• ALLSKY_SFC_SW_DWN — All-Sky Surface Shortwave Downward Irradiance (MJ/m²/day)
• WS2M — Wind Speed at 2 Meters (m/s)

Field Shift retrieves 5-year monthly averages to characterize local climate conditions.

Official NASA POWER endpoint: https://power.larc.nasa.gov/api/temporal/`,
    },
    {
      id: 'recommendation',
      title: 'How does the recommendation system work?',
      content: `The Field Shift Suitability Score is a transparent, factor-based decision-support score. It is not a validated scientific model.

For each crop, Field Shift evaluates several factors:

1. Temperature Suitability (weight: 25%)
   How well the local average temperature matches the crop's preferred range. Scores higher when close to the optimal temperature.

2. Rainfall Suitability (weight: 25%)
   How well annual precipitation aligns with the crop's water needs.

3. Water Availability (weight: 20%)
   Whether the user's reported water availability meets the crop's demand.

4. Season Match (weight: 15%)
   Whether the reported farming season aligns with the crop's growing season.

5. Soil Suitability (weight: 10%)
   Whether the reported soil type matches the crop's preferences.

6. Stress Tolerance (weight: 5%)
   How well the crop tolerates the user's identified climate challenges.

Scores are normalized to 0–100. A score above 70 suggests reasonable climate alignment; below 40 suggests significant mismatches.

Disclaimer: Suitability scores are based on general agronomic parameters and publicly available climate data. Real-world crop performance depends on many additional local factors including soil health, variety selection, pest pressure, market access, and farming practice.`,
    },
    {
      id: 'resilience',
      title: 'What is the Field Shift Resilience Score?',
      content: `The Field Shift Resilience Score is an experimental, multi-component score that estimates overall farm resilience. It is explicitly not a validated scientific metric.

Components (total: 100 points):
• Climate Resilience (0–25): How well the current crop matches local climate conditions
• Water Resilience (0–20): Balance between water availability and crop water demand
• Crop Diversity (0–20): Variety of crops in the planned rotation
• Challenge Awareness (0–20): Identified farming challenges (more identified = more attention to risk)
• Adaptation Readiness (0–15): Irrigation availability and rotation planning status

The score is intended to give farmers a high-level view of which resilience dimensions may need attention. It should be interpreted as a starting point for thinking, not a definitive assessment.`,
    },
    {
      id: 'limitations',
      title: 'Limitations',
      content: `Field Shift is an experimental decision-support tool with the following limitations:

Data limitations:
• NASA POWER data represents gridded estimates, not on-farm measurements
• Monthly averages smooth out extreme weather events and fine-scale variability
• Data is available approximately 3 days behind the current date

Recommendation limitations:
• Crop suitability scores are based on general species-level parameters, not specific variety performance
• Local soil chemistry, salinity, topography, and micro-climate are not captured
• Market factors, input costs, and policy are not considered

Agricultural limitations:
• Field Shift does not account for pest pressure, disease cycles, or other biotic factors
• Rotation suggestions are based on general agronomic principles, not farm-specific history
• Adaptation actions are general guidance and may not suit all contexts

Always consult local agricultural extension services, agronomists, and experienced farmers before implementing significant farm management changes.`,
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer',
      content: `Field Shift is an experimental decision-support and educational tool developed for the NASA Space Apps Challenge 2026.

It does not replace professional agricultural advice.

Field Shift uses data from NASA POWER but is not endorsed by, affiliated with, or developed in partnership with NASA. The NASA POWER dataset is publicly available at no cost at https://power.larc.nasa.gov.

Suitability scores, resilience scores, and adaptation actions are intended to support decision-making exploration, not to provide definitive agricultural recommendations.`,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <div style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(45, 106, 79, 0.1) 0%, transparent 60%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '56px 0',
        }}>
          <div className="container-app">
            <div style={{ fontSize: '0.75rem', color: 'var(--green-400)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '12px' }}>
              ABOUT
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
              About Field Shift
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '600px' }}>
              An experimental decision-support platform for the NASA Space Apps Challenge 2026. Designed to make NASA climate data useful for agricultural decision-making.
            </p>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">🛰️ NASA POWER Data</span>
              <span className="badge badge-green">🌾 Agricultural Focus</span>
              <span className="badge badge-green">🔬 Experimental Tool</span>
              <span className="badge badge-blue">🚀 Space Apps 2026</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-app" style={{ padding: '48px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '48px', alignItems: 'start' }} className="about-grid">
            {/* Sidebar TOC */}
            <div style={{ position: 'sticky', top: '80px' }} className="about-sidebar">
              <div style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--green-400)', marginBottom: '12px' }}>
                CONTENTS
              </div>
              {sections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  style={{
                    display: 'block',
                    padding: '6px 0',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    borderLeft: '2px solid var(--border-subtle)',
                    paddingLeft: '12px',
                    marginBottom: '4px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.target.style.color = 'var(--green-300)'; e.target.style.borderLeftColor = 'var(--green-400)'; }}
                  onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderLeftColor = 'var(--border-subtle)'; }}
                >
                  {s.title}
                </a>
              ))}
            </div>

            {/* Main content */}
            <div>
              {sections.map((section, i) => (
                <div key={section.id} id={section.id} style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
                  <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                    {section.title}
                  </h2>
                  <div className="glass-card" style={{ padding: '24px' }}>
                    {section.content.split('\n').map((line, li) => {
                      if (line.trim() === '') return <br key={li} />;
                      if (line.startsWith('•')) {
                        return (
                          <div key={li} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--green-400)', flexShrink: 0 }}>•</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                              {line.slice(1).trim()}
                            </span>
                          </div>
                        );
                      }
                      if (line.match(/^\d+\./)) {
                        return (
                          <div key={li} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--green-400)', flexShrink: 0, fontWeight: 700, minWidth: '20px' }}>
                              {line.split('.')[0]}.
                            </span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 600 }}>
                              {line.split('.').slice(1).join('.').trim()}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <p key={li} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '8px' }}>
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* NASA Attribution */}
              <div className="glass-card" style={{
                padding: '24px',
                border: '1px solid rgba(26, 111, 168, 0.25)',
                background: 'rgba(26, 111, 168, 0.05)',
              }}>
                <div style={{ fontWeight: 700, color: '#60b4d8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🛰️ NASA Data Attribution
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '12px' }}>
                  Environmental data in Field Shift is sourced from the NASA POWER (Prediction of Worldwide Energy Resources) dataset, a product of NASA's Langley Research Center.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '12px' }}>
                  The dataset is publicly available and free to use. No NASA API key is required for the endpoints used in this application.
                </p>
                <a
                  href="https://power.larc.nasa.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#60b4d8', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}
                >
                  Visit power.larc.nasa.gov ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; }
          .about-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}

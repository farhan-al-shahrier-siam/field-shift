'use client';

import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { FarmProvider } from '@/context/FarmContext';

const steps = [
  {
    num: '01',
    title: 'CONNECT',
    desc: 'Select your farm location and provide basic farming conditions. Field Shift uses your location to retrieve real NASA climate and weather data.',
    icon: '📍',
  },
  {
    num: '02',
    title: 'ANALYZE',
    desc: 'Field Shift analyzes NASA POWER climate and weather information — temperature, rainfall, humidity, solar radiation — and translates it into agricultural insights.',
    icon: '🛰️',
  },
  {
    num: '03',
    title: 'ADAPT',
    desc: 'Explore crop recommendations, rotation strategies, and adaptation actions tailored to your farm\'s climate profile.',
    icon: '🌱',
  },
];

const features = [
  {
    icon: '🌡️',
    title: 'NASA Climate Data',
    desc: 'Real temperature, rainfall, humidity, and solar radiation data from NASA POWER — the same satellite data used by researchers worldwide.',
  },
  {
    icon: '🌾',
    title: 'Crop Recommendations',
    desc: 'Get matched with crops that suit your climate conditions, water availability, soil type, and farming season.',
  },
  {
    icon: '🔄',
    title: 'Rotation Planner',
    desc: 'Build smarter multi-season rotations that improve soil health, reduce water pressure, and spread climate risk.',
  },
  {
    icon: '🗺️',
    title: 'Adaptation Planner',
    desc: 'Turn climate challenges like increasing temperatures or irregular rainfall into concrete, prioritized action plans.',
  },
  {
    icon: '📊',
    title: 'Resilience Score',
    desc: 'Understand your farm\'s overall climate resilience across water, diversity, and adaptation readiness dimensions.',
  },
  {
    icon: '⚖️',
    title: 'Crop Comparison',
    desc: 'Compare multiple crops side-by-side across water demand, heat tolerance, drought resistance, and suitability scores.',
  },
];

export default function LandingPage() {
  return (
    <FarmProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* ===== HERO ===== */}
        <section style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 30% 50%, rgba(45, 106, 79, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(26, 111, 168, 0.08) 0%, transparent 50%)',
        }}>
          {/* Background grid */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(82, 183, 136, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(82, 183, 136, 0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }} />

          {/* Floating orbs */}
          <div style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(64, 145, 108, 0.08) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26, 111, 168, 0.06) 0%, transparent 70%)',
            bottom: '50px',
            left: '10%',
            pointerEvents: 'none',
          }} />

          <div className="container-app" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
            <div style={{ maxWidth: '720px' }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(26, 111, 168, 0.12)',
                border: '1px solid rgba(26, 111, 168, 0.25)',
                borderRadius: '20px',
                padding: '6px 14px',
                marginBottom: '28px',
              }}>
                <span style={{ fontSize: '0.8rem' }}>🛰️</span>
                <span style={{ fontSize: '0.8rem', color: '#60b4d8', fontWeight: 600, letterSpacing: '0.05em' }}>
                  NASA SPACE APPS CHALLENGE 2026
                </span>
              </div>

              {/* Logo mark */}
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: 'var(--green-400)',
                marginBottom: '16px',
              }}>
                🌾 FIELD SHIFT
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '24px',
              }}>
                <span style={{ color: 'var(--text-primary)' }}>Your farm is changing.</span>
                <br />
                <span className="gradient-text">Your strategy can too.</span>
              </h1>

              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                marginBottom: '40px',
                maxWidth: '560px',
              }}>
                Explore NASA climate and weather data to discover smarter crop choices, resilient crop rotations, and practical farm adaptation strategies.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/dashboard" className="btn-primary" style={{
                  textDecoration: 'none',
                  fontSize: '1rem',
                  padding: '14px 32px',
                }}>
                  Explore My Farm →
                </Link>
                <a href="#how-it-works" className="btn-secondary" style={{
                  fontSize: '1rem',
                  padding: '14px 32px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  ▶ See How It Works
                </a>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex',
                gap: '32px',
                marginTop: '56px',
                paddingTop: '32px',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
              }}>
                {[
                  { value: '12+', label: 'Crops in database' },
                  { value: '8', label: 'Climate parameters' },
                  { value: '7', label: 'Challenge types' },
                  { value: '5yr', label: 'Historical data' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.5rem', color: 'var(--green-300)' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero visualization panel */}
          <div style={{
            position: 'absolute',
            right: '5%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(380px, 35vw)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }} className="hero-panel">
            {/* Climate card mock */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '12px' }}>
                📡 NASA CLIMATE SNAPSHOT
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { icon: '🌡️', label: 'Temperature', value: '28.4°C' },
                  { icon: '🌧️', label: 'Rainfall', value: '142 mm' },
                  { icon: '💧', label: 'Humidity', value: '74%' },
                  { icon: '☀️', label: 'Solar Rad.', value: '17.8 MJ/m²' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'rgba(10, 31, 20, 0.6)',
                    borderRadius: '10px',
                    padding: '12px',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, color: 'var(--green-300)', fontSize: '0.95rem' }}>{item.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation mock */}
            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '10px' }}>
                🌾 TOP RECOMMENDATION
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Lentil</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low water · Drought tolerant</div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '2px solid var(--green-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--green-300)' }}>89</span>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>
              <div className="suitability-bar">
                <div className="suitability-fill" style={{ width: '89%', background: 'var(--green-400)' }} />
              </div>
            </div>

            {/* Shift arrow */}
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--green-400)',
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}>
                <span>Rice → Lentil → Maize → Mustard</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Field Shift Rotation Plan
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how-it-works" style={{ padding: '80px 0', background: 'rgba(15, 45, 28, 0.3)' }}>
          <div className="container-app">
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--green-400)', marginBottom: '12px' }}>
                METHODOLOGY
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '12px' }}>
                How Field Shift Works
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                From satellite data to farm strategy in three steps.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {steps.map((step, i) => (
                <div key={step.num} className="glass-card" style={{ padding: '32px', position: 'relative' }}>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.2em',
                    color: 'var(--green-500)',
                    marginBottom: '16px',
                  }}>
                    {step.num} —
                  </div>
                  <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{step.icon}</div>
                  <h3 style={{ fontSize: '1.2rem', letterSpacing: '0.05em', marginBottom: '12px', color: 'var(--green-300)' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                    {step.desc}
                  </p>
                  {i < steps.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      right: '-12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      color: 'var(--green-600)',
                      fontSize: '1.2rem',
                      display: 'none',
                    }} className="step-arrow">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section style={{ padding: '80px 0' }}>
          <div className="container-app">
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--green-400)', marginBottom: '12px' }}>
                CAPABILITIES
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '12px' }}>
                Everything You Need to Adapt
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {features.map(f => (
                <div key={f.title} className="glass-card glass-card-hover" style={{ padding: '28px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== NASA DATA SECTION ===== */}
        <section style={{ padding: '80px 0', background: 'rgba(26, 111, 168, 0.04)' }}>
          <div className="container-app">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', color: '#60b4d8', marginBottom: '12px' }}>
                  DATA SOURCE
                </div>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '16px' }}>
                  Powered by Real NASA Data
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '24px' }}>
                  Field Shift uses the NASA POWER (Prediction of Worldwide Energy Resources) dataset — a freely accessible, satellite-derived climate database maintained by NASA's Langley Research Center.
                </p>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '24px' }}>
                  The same data trusted by researchers, agronomists, and climate scientists is now available to help you make better farming decisions.
                </p>
                <div className="nasa-attribution">
                  🛰️ Environmental data powered by{' '}
                  <a href="https://power.larc.nasa.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#60b4d8' }}>
                    NASA POWER
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: '🌡️', param: 'T2M', label: 'Temperature at 2m', desc: 'Monthly surface temperature' },
                  { icon: '🌧️', param: 'PRECTOTCORR', label: 'Precipitation', desc: 'Corrected precipitation estimates' },
                  { icon: '💧', param: 'RH2M', label: 'Relative Humidity', desc: 'Humidity at 2m height' },
                  { icon: '☀️', param: 'ALLSKY_SFC_SW_DWN', label: 'Solar Radiation', desc: 'Downward shortwave radiation' },
                  { icon: '💨', param: 'WS2M', label: 'Wind Speed', desc: 'Wind speed at 2m height' },
                ].map(p => (
                  <div key={p.param} className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{p.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{p.desc}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#60b4d8', fontFamily: 'monospace', background: 'rgba(26, 111, 168, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {p.param}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section style={{ padding: '80px 0' }}>
          <div className="container-app" style={{ textAlign: 'center' }}>
            <div className="glass-card" style={{
              padding: '64px 32px',
              background: 'linear-gradient(135deg, rgba(45, 106, 79, 0.2) 0%, rgba(26, 111, 168, 0.1) 100%)',
              border: '1px solid rgba(82, 183, 136, 0.25)',
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🌾</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '16px' }}>
                Ready to Shift Your Strategy?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
                Select your location, enter your farm conditions, and let NASA data guide your next move.
              </p>
              <Link href="/dashboard" className="btn-primary" style={{
                textDecoration: 'none',
                fontSize: '1.1rem',
                padding: '16px 40px',
              }}>
                Start — Explore My Farm
              </Link>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '16px' }}>
                Free. No account required. Experimental decision-support tool.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-panel { display: none !important; }
        }
      `}</style>
    </FarmProvider>
  );
}

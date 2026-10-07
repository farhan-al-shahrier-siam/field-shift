'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { FarmProvider, useFarm } from '@/context/FarmContext';
import { LoadingSpinner } from '@/components/ui/UIComponents';

const SOIL_TYPES = ['Clay', 'Loam', 'Sandy-Loam', 'Sandy', 'Clay-Loam', 'Silt-Loam'];
const WATER_OPTIONS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const SEASONS = ['Kharif', 'Rabi', 'Pre-Kharif', 'Boro', 'Year-round'];
const FARM_SIZES = ['< 1 ha', '1–5 ha', '5–20 ha', '20–100 ha', '> 100 ha'];
const CHALLENGES = [
  'Increasing temperature',
  'Irregular rainfall',
  'Drought',
  'Excess rainfall',
  'Water shortage',
  'Soil degradation',
  'Changing growing season',
  'Extreme weather',
];
const POPULAR_CROPS = ['Rice', 'Wheat', 'Maize', 'Lentil', 'Mustard', 'Potato', 'Tomato', 'Soybean', 'Chickpea', 'Sorghum', 'Millet', 'Sunflower'];

function SetupForm() {
  const router = useRouter();
  const { updateFarm, fetchClimate } = useFarm();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [geoSuccess, setGeoSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    locationName: '',
    lat: '',
    lon: '',
    currentCrop: '',
    soilType: 'Loam',
    waterAvailability: 'Moderate',
    irrigationAvailable: false,
    farmingSeason: 'Kharif',
    farmSize: '',
    challenges: [],
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  }

  function toggleChallenge(c) {
    setForm(prev => ({
      ...prev,
      challenges: prev.challenges.includes(c)
        ? prev.challenges.filter(x => x !== c)
        : [...prev.challenges, c],
    }));
  }

  function getBrowserLocation() {
    setGeoError(null);
    setGeoSuccess(null);

    if (typeof window === 'undefined' || !navigator?.geolocation) {
      setGeoError('Geolocation is not supported by your browser or requires a secure connection (HTTPS / localhost).');
      return;
    }

    setGeoLoading(true);

    const handleSuccess = (pos) => {
      const lat = Number(pos.coords.latitude.toFixed(4));
      const lon = Number(pos.coords.longitude.toFixed(4));

      setForm(prev => ({
        ...prev,
        lat: String(lat),
        lon: String(lon),
        locationName: prev.locationName?.trim() || `GPS Location (${lat}°, ${lon}°)`,
      }));

      setErrors(prev => ({ ...prev, lat: null, lon: null }));
      setGeoLoading(false);
      setGeoSuccess(`Coordinates detected: ${lat}°, ${lon}°`);

      // Try reverse-geocoding to get a friendly city / region name
      try {
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(res => res.json())
          .then(data => {
            const addr = data?.address || {};
            const city = addr.city || addr.town || addr.village || addr.suburb || addr.county;
            const country = addr.country;
            const place = [city, country].filter(Boolean).join(', ');
            if (place) {
              setForm(prev => ({ ...prev, locationName: place }));
              setGeoSuccess(`Detected: ${place} (${lat}°, ${lon}°)`);
            }
          })
          .catch(() => {});
      } catch (_) {}
    };

    const handleError = (err) => {
      setGeoLoading(false);
      let msg = 'Could not access location. Please enter coordinates manually.';
      if (err.code === 1) {
        msg = 'Location permission denied. Please allow location access in your browser.';
      } else if (err.code === 2) {
        msg = 'Position unavailable. Please enter coordinates manually or choose a preset.';
      } else if (err.code === 3) {
        msg = 'Location request timed out. Please try again or enter coordinates manually.';
      }
      setGeoError(msg);
    };

    // First attempt with high accuracy, retry with false if timeout occurs (laptop / WiFi support)
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err) => {
        if (err.code === 3) {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
          );
        } else {
          handleError(err);
        }
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
    );
  }

  function validateStep1() {
    const errs = {};
    if (!form.lat || isNaN(parseFloat(form.lat))) errs.lat = 'Valid latitude required';
    if (!form.lon || isNaN(parseFloat(form.lon))) errs.lon = 'Valid longitude required';
    const lat = parseFloat(form.lat);
    const lon = parseFloat(form.lon);
    if (lat < -90 || lat > 90) errs.lat = 'Latitude must be between -90 and 90';
    if (lon < -180 || lon > 180) errs.lon = 'Longitude must be between -180 and 180';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    setLoading(true);

    const lat = parseFloat(form.lat);
    const lon = parseFloat(form.lon);

    const farmData = {
      location: {
        lat,
        lon,
        name: form.locationName?.trim() || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      },
      currentCrop: form.currentCrop || 'Rice',
      soilType: form.soilType || 'Loam',
      waterAvailability: form.waterAvailability || 'Moderate',
      irrigationAvailable: Boolean(form.irrigationAvailable),
      farmingSeason: form.farmingSeason || 'Kharif',
      farmSize: form.farmSize || '1–5 ha',
      challenges: Array.isArray(form.challenges) ? form.challenges : [],
    };

    try {
      updateFarm(farmData);
      
      // Save farm to backend API
      fetch('/api/farm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmData),
      }).catch(e => console.warn('Farm backend save:', e));

      // Trigger climate fetch with fail-safe fallback
      await fetchClimate(lat, lon);
    } catch (err) {
      console.warn('Climate fetch during setup:', err);
    } finally {
      setLoading(false);
      router.push('/dashboard');
    }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 0 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--green-400)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '8px' }}>
          FARM SETUP
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '8px' }}>Analyze My Farm</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Provide your location and farm details to get personalized NASA climate insights.
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            background: s <= step ? 'var(--green-400)' : 'rgba(82,183,136,0.15)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="fade-in-up">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--green-300)' }}>
            📍 Step 1 — Farm Location
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Location Name (optional)
            </label>
            <input
              type="text"
              className="field-input"
              value={form.locationName}
              onChange={e => handleChange('locationName', e.target.value)}
              placeholder="e.g., Rajshahi District, Bangladesh"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Latitude *
              </label>
              <input
                type="number"
                className="field-input"
                value={form.lat}
                onChange={e => handleChange('lat', e.target.value)}
                placeholder="e.g., 24.3745"
                step="0.0001"
                min="-90"
                max="90"
                style={{ borderColor: errors.lat ? '#f87171' : undefined }}
              />
              {errors.lat && <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.lat}</div>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Longitude *
              </label>
              <input
                type="number"
                className="field-input"
                value={form.lon}
                onChange={e => handleChange('lon', e.target.value)}
                placeholder="e.g., 88.6042"
                step="0.0001"
                min="-180"
                max="180"
                style={{ borderColor: errors.lon ? '#f87171' : undefined }}
              />
              {errors.lon && <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.lon}</div>}
            </div>
          </div>

          <button
            type="button"
            onClick={getBrowserLocation}
            className="btn-secondary"
            style={{ width: '100%', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={geoLoading}
          >
            {geoLoading ? <LoadingSpinner size={16} /> : '📍'}
            {geoLoading ? 'Detecting Your GPS Location…' : 'Use My Current Location'}
          </button>

          {geoSuccess && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(82, 183, 136, 0.15)',
              border: '1px solid rgba(82, 183, 136, 0.3)',
              color: 'var(--green-300)',
              fontSize: '0.82rem',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>✓</span> {geoSuccess}
            </div>
          )}

          {geoError && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.82rem',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>⚠️</span> {geoError}
            </div>
          )}

          {/* Quick presets for demo */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Quick presets:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { name: 'Rajshahi, Bangladesh', lat: '24.3745', lon: '88.6042' },
                { name: 'Punjab, India', lat: '31.1471', lon: '75.3412' },
                { name: 'Iowa, USA', lat: '42.0046', lon: '-93.2140' },
                { name: 'Nairobi, Kenya', lat: '-1.2921', lon: '36.8219' },
              ].map(p => (
                <button
                  key={p.name}
                  onClick={() => setForm(prev => ({ ...prev, lat: p.lat, lon: p.lon, locationName: p.name }))}
                  style={{
                    background: 'rgba(82, 183, 136, 0.08)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.borderColor = 'var(--green-400)'}
                  onMouseLeave={e => e.target.style.borderColor = 'var(--border-subtle)'}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => { if (validateStep1()) setStep(2); }}
            style={{ width: '100%', padding: '14px' }}
          >
            Next: Farm Information →
          </button>
        </div>
      )}

      {/* Step 2: Farm Info */}
      {step === 2 && (
        <div className="fade-in-up">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--green-300)' }}>
            🌾 Step 2 — Farm Information
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Current Crop
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {POPULAR_CROPS.map(crop => (
                <button
                  key={crop}
                  onClick={() => handleChange('currentCrop', crop)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: form.currentCrop === crop ? 'var(--green-400)' : 'var(--border-subtle)',
                    background: form.currentCrop === crop ? 'rgba(82, 183, 136, 0.15)' : 'transparent',
                    color: form.currentCrop === crop ? 'var(--green-300)' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {crop}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="field-input"
              value={form.currentCrop}
              onChange={e => handleChange('currentCrop', e.target.value)}
              placeholder="Or type a custom crop name…"
              style={{ marginTop: '8px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Soil Type
              </label>
              <select className="field-input" value={form.soilType} onChange={e => handleChange('soilType', e.target.value)}>
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Water Availability
              </label>
              <select className="field-input" value={form.waterAvailability} onChange={e => handleChange('waterAvailability', e.target.value)}>
                {WATER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Farming Season
              </label>
              <select className="field-input" value={form.farmingSeason} onChange={e => handleChange('farmingSeason', e.target.value)}>
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Farm Size (optional)
              </label>
              <select className="field-input" value={form.farmSize} onChange={e => handleChange('farmSize', e.target.value)}>
                <option value="">Select size…</option>
                {FARM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.irrigationAvailable}
                onChange={e => handleChange('irrigationAvailable', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--green-400)' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                💧 Irrigation is available on this farm
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, padding: '14px' }}>
              ← Back
            </button>
            <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 2, padding: '14px' }}>
              Next: Current Challenges →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Challenges */}
      {step === 3 && (
        <div className="fade-in-up">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--green-300)' }}>
            ⚠️ Step 3 — Current Challenges
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Select any challenges you are currently facing or concerned about. This helps Field Shift tailor the adaptation plan.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '32px' }}>
            {CHALLENGES.map(c => {
              const selected = form.challenges.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleChallenge(c)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: selected ? 'var(--green-400)' : 'var(--border-subtle)',
                    background: selected ? 'rgba(82, 183, 136, 0.15)' : 'transparent',
                    color: selected ? 'var(--green-300)' : 'var(--text-muted)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: selected ? 600 : 400,
                  }}
                >
                  <span>{selected ? '✓' : '○'}</span>
                  {c}
                </button>
              );
            })}
          </div>

          <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', border: '1px solid rgba(26, 111, 168, 0.2)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              <strong style={{ color: '#60b4d8' }}>Note:</strong> You can skip this step if you haven't identified specific challenges yet. Field Shift will still generate climate insights and recommendations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1, padding: '14px' }}>
              ← Back
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 2, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size={18} />
                  Analyzing Your Farm…
                </>
              ) : (
                '🌱 ANALYZE MY FARM'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SetupPage() {
  return (
    <FarmProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <div className="container-app">
            <SetupForm />
          </div>
        </main>
        <Footer />
      </div>
    </FarmProvider>
  );
}

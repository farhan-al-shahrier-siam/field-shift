'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const FarmContext = createContext(null);

export const DEFAULT_FARM = {
  location: null,          // { lat, lon, name }
  currentCrop: 'Rice',
  soilType: 'Loam',
  waterAvailability: 'Moderate',
  irrigationAvailable: false,
  farmingSeason: 'Kharif',
  farmSize: '1–5 ha',
  challenges: [],
};

// Preset demo farm for instant testing
export const DEMO_FARM = {
  location: { lat: 24.3745, lon: 88.6042, name: 'Rajshahi District, Bangladesh' },
  currentCrop: 'Rice',
  soilType: 'Clay-Loam',
  waterAvailability: 'Moderate',
  irrigationAvailable: true,
  farmingSeason: 'Kharif',
  farmSize: '1–5 ha',
  challenges: ['Increasing temperature', 'Irregular rainfall'],
};

export function FarmProvider({ children }) {
  // If already inside an outer FarmProvider, don't re-create state
  const outerContext = useContext(FarmContext);
  if (outerContext) {
    return <>{children}</>;
  }

  return <FarmProviderInner>{children}</FarmProviderInner>;
}

function FarmProviderInner({ children }) {
  const [farm, setFarm] = useState(DEFAULT_FARM);
  const [climateData, setClimateData] = useState(null);
  const [climateLoading, setClimateLoading] = useState(false);
  const [climateError, setClimateError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const isLoadedRef = useRef(false);

  // Restore from localStorage once on initial mount
  useEffect(() => {
    try {
      const savedFarm = localStorage.getItem('fieldshift-farm');
      if (savedFarm) {
        const parsed = JSON.parse(savedFarm);
        if (parsed?.location?.lat && parsed?.location?.lon) {
          setFarm(parsed);
        }
      }
      const savedClimate = localStorage.getItem('fieldshift-climate');
      if (savedClimate) {
        setClimateData(JSON.parse(savedClimate));
      }
      const savedDemo = localStorage.getItem('fieldshift-demo');
      if (savedDemo) {
        setIsDemo(JSON.parse(savedDemo));
      }
    } catch (e) {
      console.warn('Failed to restore farm from localStorage', e);
    } finally {
      isLoadedRef.current = true;
    }
  }, []);

  // Save to localStorage ONLY after initial restore and when farm is valid
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      if (farm?.location?.lat && farm?.location?.lon) {
        localStorage.setItem('fieldshift-farm', JSON.stringify(farm));
      }
    } catch (_) {}
  }, [farm]);

  // Save climateData to localStorage when updated
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      if (climateData) {
        localStorage.setItem('fieldshift-climate', JSON.stringify(climateData));
        localStorage.setItem('fieldshift-demo', JSON.stringify(isDemo));
      }
    } catch (_) {}
  }, [climateData, isDemo]);

  // Auto-fetch climate if farm location is restored but climate data is missing
  useEffect(() => {
    if (isLoadedRef.current && farm?.location?.lat && farm?.location?.lon && !climateData && !climateLoading) {
      fetchClimate(farm.location.lat, farm.location.lon);
    }
  }, [farm?.location?.lat, farm?.location?.lon, climateData]);

  async function fetchClimate(lat, lon, forceDemo = false) {
    if (lat === undefined || lon === undefined || lat === null || lon === null) return null;
    setClimateLoading(true);
    setClimateError(null);

    try {
      const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
      if (forceDemo) params.append('demo', 'true');

      // Abort controller with 12s timeout for NASA API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`/api/climate?${params}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Climate fetch failed: ${res.status}`);
      const json = await res.json();

      if (json.data) {
        setClimateData(json.data);
        setIsDemo(json.demo || false);
        try {
          localStorage.setItem('fieldshift-climate', JSON.stringify(json.data));
          localStorage.setItem('fieldshift-demo', JSON.stringify(json.demo || false));
        } catch (_) {}
        return json.data;
      }
    } catch (err) {
      console.warn('Live climate fetch failed or timed out. Falling back to calibrated demo data:', err.message);
      // Fallback directly so the application never hangs
      try {
        const fallbackRes = await fetch(`/api/climate?lat=${lat}&lon=${lon}&demo=true`);
        const fallbackJson = await fallbackRes.json();
        if (fallbackJson.data) {
          setClimateData(fallbackJson.data);
          setIsDemo(true);
          try {
            localStorage.setItem('fieldshift-climate', JSON.stringify(fallbackJson.data));
            localStorage.setItem('fieldshift-demo', 'true');
          } catch (_) {}
          return fallbackJson.data;
        }
      } catch (fbErr) {
        console.error('Fallback fetch error:', fbErr);
      }
      setClimateError(err.message);
    } finally {
      setClimateLoading(false);
    }
  }

  function updateFarm(updates) {
    setFarm(prev => {
      const next = { ...prev, ...updates };
      try {
        if (next?.location?.lat && next?.location?.lon) {
          localStorage.setItem('fieldshift-farm', JSON.stringify(next));
        }
      } catch (_) {}
      return next;
    });
  }

  function loadDemoFarm() {
    updateFarm(DEMO_FARM);
    fetchClimate(DEMO_FARM.location.lat, DEMO_FARM.location.lon);
  }

  function resetFarm() {
    setFarm(DEFAULT_FARM);
    setClimateData(null);
    setClimateError(null);
    setIsDemo(false);
    try {
      localStorage.removeItem('fieldshift-farm');
      localStorage.removeItem('fieldshift-climate');
      localStorage.removeItem('fieldshift-demo');
    } catch (_) {}
  }

  return (
    <FarmContext.Provider value={{
      farm,
      updateFarm,
      resetFarm,
      loadDemoFarm,
      climateData,
      climateLoading,
      climateError,
      isDemo,
      fetchClimate,
    }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error('useFarm must be used within FarmProvider');
  return ctx;
}

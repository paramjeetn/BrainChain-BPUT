import { useState, useEffect } from 'react';
import { useFacilityStore } from '../store/facilityStore';

// Static JSON imports as fallback
import energyJson from '../demo-data/energy.json';
import waterJson from '../demo-data/water.json';
import wasteJson from '../demo-data/waste.json';
import airJson from '../demo-data/air-quality.json';
import trafficJson from '../demo-data/traffic.json';

const STATIC_DATA = {
  energy: energyJson,
  water: waterJson,
  waste: wasteJson,
  'air-quality': airJson,
  traffic: trafficJson,
};

// Map preset type -> actual facility_id in JSON
const TYPE_TO_FACILITY_ID = {
  college:   'bput-campus',
  hospital:  'kims-hospital',
  corporate: 'tcs-campus',
};

// In-memory cache
const cache = new Map();

function filterStaticData(moduleId, facilityType, customFacilityId) {
  const raw = STATIC_DATA[moduleId];
  if (!raw || !Array.isArray(raw)) return [];

  // 1) Try exact match first
  let filtered = raw.filter(r => r.facility_id === customFacilityId);
  if (filtered.length > 0) return filtered;

  // 2) Map type to known facility_id
  const mappedId = TYPE_TO_FACILITY_ID[facilityType];
  if (mappedId) {
    filtered = raw.filter(r => r.facility_id === mappedId);
    if (filtered.length > 0) return filtered;
  }

  // 3) Fallback: use bput-campus data
  return raw.filter(r => r.facility_id === 'bput-campus');
}

export function useTelemetry(moduleId) {
  const activeFacility = useFacilityStore(s => s.activeFacility);
  const facilityId = activeFacility?.id || 'bput-campus';
  const facilityType = activeFacility?.type || 'college';

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const cacheKey = `${facilityId}-${moduleId}`;

    if (cache.has(cacheKey)) {
      setData(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    setLoading(true);

    // Try live backend first with short timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

    fetch(`http://localhost:3001/api/telemetry/${facilityId}/${moduleId}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(json => {
        clearTimeout(timeout);
        if (!mounted) return;
        if (Array.isArray(json) && json.length > 0) {
          cache.set(cacheKey, json);
          setData(json);
        } else {
          // API returned empty — fall back to static JSON
          const fallback = filterStaticData(moduleId, facilityType, facilityId);
          cache.set(cacheKey, fallback);
          setData(fallback);
        }
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        if (!mounted) return;
        // Backend unreachable — use static JSON immediately
        const fallback = filterStaticData(moduleId, facilityType, facilityId);
        cache.set(cacheKey, fallback);
        setData(fallback);
        setLoading(false);
        setError(null); // not a hard error — just using fallback
      });

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [facilityId, moduleId, facilityType]);

  return { data, loading, error };
}

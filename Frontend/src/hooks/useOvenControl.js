import { useState, useCallback } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Provides control actions for the oven: power, fan speeds, and lights.
 * Manages a shared loading flag and last error string across all actions.
 *
 * @returns {{ setPower: Function, setFan: Function, setLights: Function, loading: boolean, error: string|null }}
 */
export function useOvenControl() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, data) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${BASE}${url}`, data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Request failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Turns the dryer on (1) or off (0). */
  const setPower = useCallback(
    (value) => request('/api/control/power', { value }),
    [request]
  );

  /** Sets rear fan (0–255) and side fan (0–255) speeds. */
  const setFan = useCallback(
    (rear, side) => request('/api/control/fan', { fanRear: rear, fanSide: side }),
    [request]
  );

  /** Turns chamber lights on (1) or off (0). */
  const setLights = useCallback(
    (value) => request('/api/control/lights', { value }),
    [request]
  );

  return { setPower, setFan, setLights, loading, error };
}

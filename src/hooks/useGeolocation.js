import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Real Geolocation Hook - Strictly invokes physical GPS sensor
 */
export function useGeolocation(options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }) {
  const [coordinates, setCoordinates] = useState({
    lat: null,
    lng: null,
    accuracy: null,
    altitude: null,
    heading: null,
    speed: null,
    timestamp: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef(null);

  const handleSuccess = useCallback((pos) => {
    const { latitude, longitude, accuracy, altitude, heading, speed } = pos.coords;
    setCoordinates({
      lat: latitude,
      lng: longitude,
      accuracy,
      altitude,
      heading,
      speed,
      timestamp: pos.timestamp
    });
    setLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback((err) => {
    console.warn(`Geolocation hardware warning: ${err.message} (Code ${err.code})`);
    setError(err.message || 'GPS Signal Unreachable');
    setLoading(false);
  }, []);

  const refreshPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation API not supported by this browser/hardware');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, [handleSuccess, handleError, options]);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    // Get immediate position first
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Then continuously watch position
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [handleSuccess, handleError, options]);

  return {
    ...coordinates,
    error,
    loading,
    refreshPosition
  };
}

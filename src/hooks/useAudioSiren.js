import { useState, useRef, useCallback, useEffect } from 'react';
import { createEmergencySiren } from '../utils/audioUtils';

/**
 * Web Audio Emergency Siren Hook (Dual-Tone 800Hz - 1200Hz sweep)
 */
export function useAudioSiren() {
  const [isPlaying, setIsPlaying] = useState(false);
  const sirenInstanceRef = useRef(null);

  const startSiren = useCallback(() => {
    if (sirenInstanceRef.current) return;
    const instance = createEmergencySiren();
    if (instance) {
      sirenInstanceRef.current = instance;
      setIsPlaying(true);
    }
  }, []);

  const stopSiren = useCallback(() => {
    if (sirenInstanceRef.current) {
      sirenInstanceRef.current.stop();
      sirenInstanceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const toggleSiren = useCallback(() => {
    if (isPlaying) {
      stopSiren();
    } else {
      startSiren();
    }
  }, [isPlaying, startSiren, stopSiren]);

  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, [stopSiren]);

  return {
    isPlaying,
    startSiren,
    stopSiren,
    toggleSiren
  };
}

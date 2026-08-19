import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Physical Camera LED Flash (Torch) & Strobe Controller Hook
 */
export function useTorch() {
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isStrobing, setIsStrobing] = useState(false);
  const [screenStrobe, setScreenStrobe] = useState(false);
  const [error, setError] = useState(null);

  const streamRef = useRef(null);
  const trackRef = useRef(null);
  const strobeIntervalRef = useRef(null);
  const screenStrobeIntervalRef = useRef(null);

  // Initialize camera track
  const initTrack = useCallback(async () => {
    if (trackRef.current && trackRef.current.readyState === 'live') {
      return trackRef.current;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }
        }
      });

      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }

      return track;
    } catch (err) {
      console.warn('Camera/Torch access notice:', err);
      setError(err.message);
      setHasTorch(false);
      return null;
    }
  }, []);

  const setTorch = useCallback(async (enable) => {
    try {
      let track = trackRef.current;
      if (!track || track.readyState !== 'live') {
        track = await initTrack();
      }

      if (track && track.applyConstraints) {
        await track.applyConstraints({
          advanced: [{ torch: enable }]
        });
        setIsTorchOn(enable);
        return true;
      }
    } catch (err) {
      console.warn('Could not apply torch constraint:', err);
      setIsTorchOn(false);
    }
    return false;
  }, [initTrack]);

  const toggleTorch = useCallback(async () => {
    return await setTorch(!isTorchOn);
  }, [isTorchOn, setTorch]);

  const startStrobe = useCallback(async (intervalMs = 250) => {
    setIsStrobing(true);
    let state = false;

    // Start hardware torch strobing if available
    strobeIntervalRef.current = setInterval(async () => {
      state = !state;
      await setTorch(state);
    }, intervalMs);

    // Also run visual screen strobe in parallel for maximum optical distress visibility
    screenStrobeIntervalRef.current = setInterval(() => {
      setScreenStrobe(prev => !prev);
    }, intervalMs);
  }, [setTorch]);

  const stopStrobe = useCallback(async () => {
    setIsStrobing(false);
    setScreenStrobe(false);

    if (strobeIntervalRef.current) {
      clearInterval(strobeIntervalRef.current);
      strobeIntervalRef.current = null;
    }
    if (screenStrobeIntervalRef.current) {
      clearInterval(screenStrobeIntervalRef.current);
      screenStrobeIntervalRef.current = null;
    }

    await setTorch(false);
  }, [setTorch]);

  const cleanup = useCallback(() => {
    stopStrobe();
    if (trackRef.current) {
      trackRef.current.stop();
      trackRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, [stopStrobe]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    hasTorch,
    isTorchOn,
    isStrobing,
    screenStrobe,
    error,
    toggleTorch,
    setTorch,
    startStrobe,
    stopStrobe,
    cleanup
  };
}

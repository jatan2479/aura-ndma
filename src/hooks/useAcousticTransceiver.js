import { useState, useRef, useCallback, useEffect } from 'react';
import { getAudioContext, playTone } from '../utils/audioUtils';

/**
 * Acoustic & Optical Tone Transceiver Hook
 * Transmitter: Emits 800Hz pulsed tone bursts
 * Receiver: Analyzes mic audio via AnalyserNode FFT & detects 800Hz frequency peaks
 */
export function useAcousticTransceiver() {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [detectedSignal, setDetectedSignal] = useState(null);
  const [signalStrength, setSignalStrength] = useState(0);
  const [analyser, setAnalyser] = useState(null);
  const [error, setError] = useState(null);

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const transmitTimeoutRef = useRef(null);

  // --- TRANSMITTER ---
  const transmitBeacon = useCallback((pattern = 'SOS', onPulse) => {
    setIsTransmitting(true);
    const pulseLength = 180; // ms
    const gap = 120; // ms

    // SOS Pattern: ... --- ... (short = 180ms, long = 450ms)
    const sequence = [
      { dur: pulseLength, type: 'dot' },
      { dur: pulseLength, type: 'dot' },
      { dur: pulseLength, type: 'dot' },
      { dur: pulseLength * 2.5, type: 'dash' },
      { dur: pulseLength * 2.5, type: 'dash' },
      { dur: pulseLength * 2.5, type: 'dash' },
      { dur: pulseLength, type: 'dot' },
      { dur: pulseLength, type: 'dot' },
      { dur: pulseLength, type: 'dot' }
    ];

    let currentIndex = 0;

    function playNext() {
      if (currentIndex >= sequence.length) {
        setIsTransmitting(false);
        return;
      }

      const item = sequence[currentIndex];
      playTone(800, item.dur, 0.85);
      if (onPulse) onPulse(item.type, true);

      setTimeout(() => {
        if (onPulse) onPulse(item.type, false);
      }, item.dur);

      currentIndex++;
      transmitTimeoutRef.current = setTimeout(playNext, item.dur + gap);
    }

    playNext();
  }, []);

  const stopTransmission = useCallback(() => {
    if (transmitTimeoutRef.current) {
      clearTimeout(transmitTimeoutRef.current);
      transmitTimeoutRef.current = null;
    }
    setIsTransmitting(false);
  }, []);

  // --- RECEIVER / MICROPHONE ANALYZER ---
  const startListening = useCallback(async (onDetected) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access not supported on this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      streamRef.current = stream;
      const ctx = getAudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserNode.smoothingTimeConstant = 0.7;

      source.connect(analyserNode);
      analyserRef.current = analyserNode;
      setAnalyser(analyserNode);
      setIsListening(true);
      setError(null);

      // FFT Frequency Analysis Loop
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const sampleRate = ctx.sampleRate;
      const binWidth = sampleRate / analyserNode.fftSize;

      // Target bin index for 800Hz
      const targetBin = Math.round(800 / binWidth);
      const binRange = 3; // search +/- 3 bins around 800Hz

      let consecutiveDetections = 0;

      function checkFrequency() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let maxTargetEnergy = 0;
        for (let i = Math.max(0, targetBin - binRange); i <= Math.min(bufferLength - 1, targetBin + binRange); i++) {
          if (dataArray[i] > maxTargetEnergy) {
            maxTargetEnergy = dataArray[i];
          }
        }

        // Calculate background ambient noise level for relative SNR
        let ambientSum = 0;
        for (let i = 10; i < 100; i++) ambientSum += dataArray[i];
        const ambientAvg = ambientSum / 90;

        const normalizedStrength = Math.min(100, Math.round((maxTargetEnergy / 255) * 100));
        setSignalStrength(normalizedStrength);

        // Threshold trigger: high 800Hz spike relative to ambient
        if (maxTargetEnergy > 160 && maxTargetEnergy > ambientAvg * 1.6) {
          consecutiveDetections++;
          if (consecutiveDetections >= 2) {
            const detectionEvent = {
              id: Date.now(),
              frequency: 800,
              strength: normalizedStrength,
              timestamp: new Date().toISOString(),
              message: 'DISTRESS BEACON (800 Hz PEAK DETECTED)'
            };
            setDetectedSignal(detectionEvent);
            if (onDetected) onDetected(detectionEvent);
            consecutiveDetections = 0;
          }
        } else {
          consecutiveDetections = Math.max(0, consecutiveDetections - 1);
        }

        animationFrameRef.current = requestAnimationFrame(checkFrequency);
      }

      checkFrequency();
    } catch (err) {
      console.error('Microphone analysis error:', err);
      setError(err.message);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setAnalyser(null);
    setIsListening(false);
    setSignalStrength(0);
  }, []);

  useEffect(() => {
    return () => {
      stopTransmission();
      stopListening();
    };
  }, [stopTransmission, stopListening]);

  return {
    isTransmitting,
    isListening,
    detectedSignal,
    signalStrength,
    analyser,
    error,
    transmitBeacon,
    stopTransmission,
    startListening,
    stopListening
  };
}

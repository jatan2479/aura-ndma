import { useState, useEffect, useRef, useCallback } from 'react';
import { useTorch } from './useTorch';
import { useAudioSiren } from './useAudioSiren';

/**
 * Dead Hand Safety System Hook (Dead-Man's Switch)
 * Selectable countdown duration (10s test mode / 1hr standard mode)
 * On expiration: triggers physical torch strobing, speaker siren sweep, and critical dispatch callback.
 */
export function useDeadHand({ onCriticalTrigger } = {}) {
  const [isActive, setIsActive] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(10); // default to 10s for fast SIH demo
  const [timeLeft, setTimeLeft] = useState(10);
  const [lastCheckinTime, setLastCheckinTime] = useState(null);
  const [isTriggered, setIsTriggered] = useState(false);

  const { startStrobe, stopStrobe, screenStrobe } = useTorch();
  const { startSiren, stopSiren } = useAudioSiren();

  const timerRef = useRef(null);

  // Check-in / Reset
  const checkIn = useCallback(() => {
    setTimeLeft(durationSeconds);
    setLastCheckinTime(new Date().toISOString());
    if (isTriggered) {
      stopStrobe();
      stopSiren();
      setIsTriggered(false);
    }
  }, [durationSeconds, isTriggered, stopStrobe, stopSiren]);

  // Start Dead Hand monitoring
  const startMonitoring = useCallback((customDuration) => {
    const dur = customDuration || durationSeconds;
    setDurationSeconds(dur);
    setTimeLeft(dur);
    setLastCheckinTime(new Date().toISOString());
    setIsActive(true);
    setIsTriggered(false);
  }, [durationSeconds]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsActive(false);
    setIsTriggered(false);
    stopStrobe();
    stopSiren();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [stopStrobe, stopSiren]);

  // Countdown timer loop
  useEffect(() => {
    if (!isActive || isTriggered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          
          // HARDWARE TRIGGER: Timer Expired (Unchecked state)
          setIsTriggered(true);
          startStrobe(200); // 200ms physical LED strobe
          startSiren();     // dual-tone speaker sweep

          if (onCriticalTrigger) {
            onCriticalTrigger({
              durationSeconds,
              lastCheckinTime,
              timestamp: new Date().toISOString()
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isTriggered, durationSeconds, lastCheckinTime, onCriticalTrigger, startStrobe, startSiren]);

  return {
    isActive,
    isTriggered,
    durationSeconds,
    setDurationSeconds,
    timeLeft,
    lastCheckinTime,
    screenStrobe,
    startMonitoring,
    stopMonitoring,
    checkIn
  };
}

/**
 * Web Audio API Synthesis and Spectrum Helpers for AURA-NDMA
 */

let sharedAudioCtx = null;

export function getAudioContext() {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Plays a discrete tone burst at target frequency (e.g. 800Hz for acoustic Morse beacon)
 */
export function playTone(frequency = 800, durationMs = 200, volume = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return null;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durationMs / 1000));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (durationMs / 1000));

    return osc;
  } catch (err) {
    console.error('Audio tone error:', err);
    return null;
  }
}

/**
 * Generates continuous emergency siren sweep (800Hz to 1200Hz)
 */
export function createEmergencySiren() {
  const ctx = getAudioContext();
  if (!ctx) return null;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.7, ctx.currentTime);

    // Continuous frequency sweep (800Hz to 1200Hz)
    const sweepDuration = 0.6;
    let isRunning = true;

    function scheduleSweep(startTime) {
      if (!isRunning) return;
      osc.frequency.setValueAtTime(800, startTime);
      osc.frequency.linearRampToValueAtTime(1200, startTime + (sweepDuration / 2));
      osc.frequency.linearRampToValueAtTime(800, startTime + sweepDuration);
    }

    let nextTime = ctx.currentTime;
    const interval = setInterval(() => {
      if (!isRunning) {
        clearInterval(interval);
        return;
      }
      if (ctx.currentTime > nextTime - 0.2) {
        scheduleSweep(nextTime);
        nextTime += sweepDuration;
      }
    }, 100);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    return {
      stop: () => {
        isRunning = false;
        clearInterval(interval);
        try {
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          setTimeout(() => {
            try { osc.stop(); osc.disconnect(); } catch {}
          }, 150);
        } catch {}
      }
    };
  } catch (err) {
    console.error('Failed to create siren:', err);
    return null;
  }
}

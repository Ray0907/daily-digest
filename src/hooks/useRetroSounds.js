import { useRef, useCallback } from 'react';

function isSoundEnabled() {
  const val = localStorage.getItem('sound-effects');
  return val === null ? true : val === 'true';
}

export function useRetroSounds() {
  const audioCtxRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playStartupWin95 = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.4);
    });
  }, [getAudioContext]);

  const playStartupMac = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 130;
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.5);
  }, [getAudioContext]);

  const playWindowOpen = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.02; // 20ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }, [getAudioContext]);

  const playWindowClose = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 80;
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }, [getAudioContext]);

  const playError = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.setValueAtTime(0.3, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }, [getAudioContext]);

  const playDialUp = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // White noise burst (first second)
    const noiseLength = ctx.sampleRate * 1;
    const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noiseSource.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);

    // Frequency sweep (second part)
    const osc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 1.5);
    osc.frequency.exponentialRampToValueAtTime(600, now + 2.0);
    sweepGain.gain.setValueAtTime(0.0001, now);
    sweepGain.gain.linearRampToValueAtTime(0.2, now + 0.5);
    sweepGain.gain.setValueAtTime(0.2, now + 1.8);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    osc.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    osc.start(now + 0.5);
    osc.stop(now + 2.0);
  }, [getAudioContext]);

  const playShutdown = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 392.0, 329.63, 261.63]; // C5, G4, E4, C4

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.5);
    });
  }, [getAudioContext]);

  return {
    playStartupWin95,
    playStartupMac,
    playWindowOpen,
    playWindowClose,
    playError,
    playDialUp,
    playShutdown,
  };
}

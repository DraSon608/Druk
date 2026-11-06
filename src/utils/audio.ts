/**
 * Synthesizes crisp POS barcode scanner beep and celebration chimes using Web Audio API.
 * Non-blocking, zero external sound assets needed.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Standard POS barcode scanner laser scan "beep"
 */
export function playBarcodeBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Classic laser scanner high frequency chirp (2300Hz -> 2500Hz)
    osc.frequency.setValueAtTime(2350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2550, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.075);
  } catch {
    // Ignore audio errors on unsupported browsers
  }
}

/**
 * Chime for promotional trigger or successful checkout
 */
export function playPromoChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5 (majestic harmony)
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.26);
    });
  } catch {
    // Ignore audio errors
  }
}

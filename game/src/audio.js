// All sound is synthesised with WebAudio: no audio files, no network.
// Short oscillator blips for coins, the diamond, tools and the alarm pulse,
// plus a little jingle for the getaway and a low sting for getting caught.

/** Make the sound player. It stays silent until the player first interacts. */
export function createAudio() {
  let context = null;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    } catch {
      return null;
    }
    return context;
  }

  function tone(frequency, duration, type, volume, when = 0, slideTo = null) {
    const ctx = ensure();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') void ctx.resume();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + when;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      if (slideTo !== null) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.05);
    } catch {
      // Sound is decoration: never let it break the game.
    }
  }

  return {
    /** Call from any click or key press so the browser allows sound. */
    unlock() { ensure(); },
    coin() { tone(880, 0.12, 'sine', 0.12); tone(1318, 0.16, 'sine', 0.1, 0.06); },
    diamond() { tone(523, 0.14, 'triangle', 0.14); tone(659, 0.14, 'triangle', 0.14, 0.1); tone(784, 0.2, 'triangle', 0.14, 0.2); tone(1046, 0.3, 'sine', 0.12, 0.3); },
    smoke() { tone(300, 0.35, 'sawtooth', 0.06, 0, 90); },
    jammer() { tone(1200, 0.1, 'square', 0.05); tone(900, 0.1, 'square', 0.05, 0.09); },
    spotted() { tone(220, 0.25, 'square', 0.1, 0, 440); },
    caught() { tone(196, 0.5, 'sawtooth', 0.14, 0, 65); tone(98, 0.7, 'sawtooth', 0.12, 0.15, 49); },
    win() { [523, 659, 784, 1046].forEach((note, i) => tone(note, 0.22, 'triangle', 0.13, i * 0.13)); },
    denied() { tone(160, 0.15, 'square', 0.08); },
  };
}

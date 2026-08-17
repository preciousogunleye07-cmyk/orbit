// High-fidelity UI sound system for Orbit Space Web App
// Supports Web Audio API synthesis with zero latency and complete coverage of all buttons.

export type SoundName =
  | 'click'
  | 'tap'
  | 'toggle'
  | 'pop'
  | 'sparkle'
  | 'chime'
  | 'page'
  | 'scan'
  | 'droplet'
  | 'pulse'
  | 'bell'
  | 'success'
  | 'error'
  | string;

let isSoundMuted = false;
let audioCtx: AudioContext | null = null;
let lastPlayedTimestamp = 0;
let lastSoundName = '';

// Get or create shared AudioContext safely
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  // Resume if suspended (browser autoplay policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

// Synthesize tactile UI sound effects
function synthesizeSound(ctx: AudioContext, name: SoundName): void {
  const now = ctx.currentTime;

  switch (name) {
    case 'sparkle': {
      // 3-note bright ascending celestial sparkle
      const notes = [880, 1174.66, 1567.98]; // A5, D6, G6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.05 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.23);
      });
      break;
    }

    case 'chime':
    case 'success': {
      // Harmonic chime bell (two resonant tones)
      const freqs = [659.25, 987.77]; // E5, B5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.14, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.36);
      });
      break;
    }

    case 'toggle':
    case 'switch': {
      // Crisp mechanical switch blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }

    case 'pop':
    case 'droplet': {
      // Bouncy bubble pop tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.03);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
      break;
    }

    case 'page': {
      // Soft airy page transition
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(420, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
      break;
    }

    case 'scan':
    case 'pulse': {
      // Hi-tech scan chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.setValueAtTime(1280, now + 0.02);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }

    case 'error': {
      // Low double-buzz
      [180, 140].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.06);
      });
      break;
    }

    case 'click':
    case 'tap':
    default: {
      // Standard tactile button click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.028);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.033);
      break;
    }
  }
}

/**
 * Play a specific sound effect with debouncing to prevent audio clipping
 */
export function playSound(name: SoundName = 'click'): void {
  if (isSoundMuted) return;

  const nowMs = Date.now();
  // Prevent duplicate trigger within 40ms of the same sound
  if (nowMs - lastPlayedTimestamp < 40 && lastSoundName === name) {
    return;
  }

  lastPlayedTimestamp = nowMs;
  lastSoundName = name;

  try {
    const ctx = getAudioContext();
    if (ctx) {
      synthesizeSound(ctx, name);
    }
  } catch (err) {
    console.debug('Audio playback note:', err);
  }
}

/**
 * Global click listener that attaches to all interactive elements
 */
function attachGlobalButtonSoundListeners(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const handleGlobalInteraction = (e: MouseEvent | TouchEvent) => {
    if (isSoundMuted) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if the clicked target or any ancestor is an interactive control
    const interactiveEl = target.closest<HTMLElement>(
      'button, a, input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], [role="button"], [role="tab"], [role="menuitem"], [role="switch"], summary, [data-clickable="true"]'
    );

    if (interactiveEl) {
      // If element specifies a custom sound via data attribute, use it
      const customSound = interactiveEl.getAttribute('data-sound') as SoundName;
      playSound(customSound || 'click');
    }
  };

  // Attach listener with capture to catch all button interactions reliably across portals/modals
  document.addEventListener('pointerdown', handleGlobalInteraction, { capture: true, passive: true });
}

// Global initialization flag
let isInitialized = false;

/**
 * Initialize sound preferences & global button listeners
 */
export function initSoundSystem(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // Restore saved mute preference if any
  try {
    const savedMute = localStorage.getItem('orbit_sound_muted');
    if (savedMute === 'true') {
      isSoundMuted = true;
    } else {
      isSoundMuted = false;
    }
  } catch {
    isSoundMuted = false;
  }

  // Pre-unlock AudioContext on first interaction
  const unlockAudio = () => {
    getAudioContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });

  // Attach button sound interceptor
  attachGlobalButtonSoundListeners();
}

/**
 * Toggle sound on or off
 */
export function toggleSound(): boolean {
  isSoundMuted = !isSoundMuted;
  try {
    localStorage.setItem('orbit_sound_muted', isSoundMuted ? 'true' : 'false');
  } catch {}

  if (!isSoundMuted) {
    playSound('chime');
  }
  return !isSoundMuted;
}

/**
 * Get current mute status
 */
export function getSoundStatus(): boolean {
  return !isSoundMuted;
}

export function play(name: SoundName): void {
  playSound(name);
}

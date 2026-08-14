import { play, setVolume, setEnabled, bind, SoundName } from 'cuelume';

let isSoundMuted = false;

// Initialize sound volume and default preferences
export function initSoundSystem(): void {
  if (typeof window === 'undefined') return;

  // Restore mute preference if saved
  const savedMute = localStorage.getItem('orbit_sound_muted');
  if (savedMute === 'true') {
    isSoundMuted = true;
    setEnabled(false);
  } else {
    isSoundMuted = false;
    setEnabled(true);
    setVolume(0.45);
  }

  // Bind declarative data-cuelume-* attributes across the whole DOM
  try {
    bind(document);
  } catch (err) {
    console.warn('Failed to bind cuelume listeners:', err);
  }
}

export function playSound(name: SoundName): void {
  if (isSoundMuted) return;
  try {
    play(name);
  } catch (err) {
    console.debug('Cuelume play error:', err);
  }
}

export function toggleSound(): boolean {
  isSoundMuted = !isSoundMuted;
  setEnabled(!isSoundMuted);
  localStorage.setItem('orbit_sound_muted', isSoundMuted ? 'true' : 'false');
  
  if (!isSoundMuted) {
    // Play a friendly confirmation chirp
    playSound('chime');
  }
  return !isSoundMuted;
}

export function getSoundStatus(): boolean {
  return !isSoundMuted;
}

export type { SoundName };
export { play };

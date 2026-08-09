// Simple sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getAudioContext() {
    if (typeof window === 'undefined') return null;

    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }

    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled) return;
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  // Success sound - finding a difference
  playSuccess() {
    if (!this.enabled) return;
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Cheerful ascending tone
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  // Error sound - wrong click
  playError() {
    if (!this.enabled) return;
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Descending tone
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  // Combo sound - consecutive successes
  playCombo(comboLevel: number) {
    const baseFreq = 400 + (comboLevel * 100); // Higher pitch for higher combos

    this.playTone(baseFreq, 0.15, 'square');
  }

  // Soft two-note confirmation when puzzle pieces form a new correct group.
  playTileJoin(connectionCount = 1) {
    if (!this.enabled) return;
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const notes = connectionCount > 1 ? [659.25, 987.77] : [587.33, 783.99];

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const startsAt = now + index * 0.075;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startsAt);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.0001, startsAt);
      gainNode.gain.exponentialRampToValueAtTime(0.16, startsAt + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startsAt + 0.16);
      oscillator.start(startsAt);
      oscillator.stop(startsAt + 0.17);
    });
  }

  // Complete sound - level finished
  playComplete() {
    if (!this.enabled) return;
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Victory fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5-E5-G5-C6
    notes.forEach((freq, index) => {
      oscillator.frequency.setValueAtTime(freq, now + index * 0.15);
    });

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    oscillator.start(now);
    oscillator.stop(now + 0.6);
  }

  // Hint sound
  playHint() {
    this.playTone(600, 0.2, 'sine');
    setTimeout(() => this.playTone(600, 0.2, 'sine'), 250);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

// Singleton instance
export const soundEffects = new SoundEffects();

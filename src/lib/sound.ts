// Web Audio API synthesizer for zero-dependency gothic sound effects
// Off by default on mobile / saved in localStorage as per PRD Section 5

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nevermore_muted');
      // Default to muted on mobile / unmuted if explicitly chosen
      this.muted = saved !== null ? saved === 'true' : true;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('nevermore_muted', String(this.muted));
    }
    if (!this.muted) {
      this.play('chime');
    }
    return this.muted;
  }

  public play(type: 'correct' | 'incorrect' | 'hint' | 'seal' | 'chime' | 'tick') {
    if (this.muted || typeof window === 'undefined') return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      switch (type) {
        // Mystical resonant harp chord
        case 'correct': {
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.001, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.85);
          });
          break;
        }

        // Low minor dissonant brass gong
        case 'incorrect': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'sawtooth';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(146.83, now); // D3
          osc2.frequency.setValueAtTime(155.56, now); // Eb3 (dissonant half-step)

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.75);
          osc2.stop(now + 0.75);
          break;
        }

        // Whispering oracle bell
        case 'hint': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now); // A5
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.55);
          break;
        }

        // Heavy wax seal stamp thud
        case 'seal': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(90, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.45);
          break;
        }

        // Soft candle flicker chime
        case 'chime': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        // Clock tick
        case 'tick': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }
      }
    } catch {
      // AudioContext policy gracefully ignored
    }
  }
}

export const sound = new SoundManager();


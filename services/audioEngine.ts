import { InstrumentType } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5;
    }
  }

  public resumeContext = async () => {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  };

  // Strum a chord (array of frequencies) with slight delay
  public async playChord(frequencies: number[], instrument: InstrumentType = 'guitar') {
    if (!this.ctx) return;
    await this.resumeContext();

    const strumSpeed = 0.05; // 50ms delay between strings
    frequencies.forEach((freq, index) => {
      // Small randomness in timing for human feel
      const timeOffset = (index * strumSpeed) + (Math.random() * 0.01);
      setTimeout(() => {
        this.playTone(freq, 3.5, instrument); // Increased duration for chord resonance
      }, timeOffset * 1000);
    });
  }

  public playTone(frequency: number, duration: number = 1.5, instrument: InstrumentType = 'profelofono') {
    if (!this.ctx || !this.masterGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;

    switch (instrument) {
      case 'piano':
        this.synthPiano(frequency, t, duration);
        break;
      case 'guitar':
        this.synthGuitar(frequency, t, duration + 1.0); // Add tail for reverb feel
        break;
      case 'flute':
        this.synthFlute(frequency, t, duration);
        break;
      case 'profelofono':
      default:
        this.synthMetallophone(frequency, t, duration);
        break;
    }
  }

  // --- SYNTHESIS ALGORITHMS ---

  private synthMetallophone(frequency: number, t: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    
    // Sine wave with slight overtone for metal ring
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, t);

    // Hard attack, long decay
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.6, t + 0.005); 
    env.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(env);
    env.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  private synthPiano(frequency: number, t: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    // To simulate a piano, we use multiple oscillators slightly detuned
    const createOsc = (type: OscillatorType, detune: number, gainVal: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, t);
      osc.detune.value = detune;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(gainVal, t + 0.02); // Hammer hit
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + duration);
    };

    // 1. Fundamental
    createOsc('triangle', 0, 0.4);
    // 2. Slightly sharp sine (body resonance)
    createOsc('sine', 5, 0.3);
    // 3. Slightly flat sine
    createOsc('sine', -5, 0.3);
  }

  private synthGuitar(frequency: number, t: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();

    osc.type = 'sawtooth'; 
    osc.frequency.setValueAtTime(frequency, t);

    // Lowpass filter envelope simulates the string losing brightness
    filter.type = 'lowpass';
    filter.Q.value = 0; // No resonance for acoustic feel
    filter.frequency.setValueAtTime(frequency * 6, t); // Bright pluck
    filter.frequency.exponentialRampToValueAtTime(frequency, t + 0.3); // Quick damping of highs

    // Amplitude envelope with Reverb-like release
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.5, t + 0.015); // Fast attack
    // Longer decay for "Reverb" feel
    env.gain.exponentialRampToValueAtTime(0.1, t + 0.5); // Initial body decay
    env.gain.linearRampToValueAtTime(0, t + duration); // Long tail fade out

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  private synthFlute(frequency: number, t: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, t);

    // Vibrato LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 5; 
    lfoGain.gain.value = 5; // Width
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Breath Noise (White noise buffer)
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = frequency * 2; // Breath follows pitch roughly
    noiseFilter.Q.value = 1;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.05; // Subtle breath

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(env);

    // Main Envelope
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.5, t + 0.1); // Soft attack
    env.gain.setValueAtTime(0.5, t + duration - 0.2);
    env.gain.linearRampToValueAtTime(0, t + duration);

    osc.connect(env);
    env.connect(this.masterGain);

    osc.start(t);
    lfo.start(t);
    noise.start(t);
    
    osc.stop(t + duration);
    lfo.stop(t + duration);
    noise.stop(t + duration);
  }

  public async getMediaStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }
}

export const audioEngine = new AudioEngine();
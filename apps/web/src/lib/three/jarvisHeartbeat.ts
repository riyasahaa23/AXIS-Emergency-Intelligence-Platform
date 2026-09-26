import type { JarvisActivityState } from '../stores/commandStore';

export interface HeartbeatSample {
  time: number;          // Total elapsed animation time
  phase: number;         // Current cycle phase in [0, 1)
  pulse: number;         // Instantaneous organic pulse envelope [0, 1]
  strength: number;      // State-dependent energy multiplier
  period: number;        // Current beat cycle duration in seconds
  bpm: number;           // Calculated beats per minute
  beatCount: number;     // Monotonic beat counter
  timeSinceBeat: number; // Seconds since current beat cycle started
  waveRadius: number;    // Radial distance of outward propagating energy wave
  waveOpacity: number;   // Opacity of propagating energy wave
  isPrimaryBeat: boolean;
  isSecondaryBeat: boolean;
  state: JarvisActivityState;
}

export interface StateHeartbeatProfile {
  period: number;          // Cycle duration in seconds
  strength: number;        // Radial & scale pulse amplitude multiplier
  speedMultiplier: number; // Orbital baseline rotation speed
  waveSpeed: number;       // Speed of outward propagating energy wave
  coreScaleBase: number;
  coreScalePeak: number;
  violetEnergy: number;    // 0 to 1
}

const STATE_PROFILES: Record<JarvisActivityState, StateHeartbeatProfile> = {
  IDLE: {
    period: 1.50,       // ~40 BPM: calm, deep, steady resting rhythm
    strength: 1.0,
    speedMultiplier: 0.85,
    waveSpeed: 8.5,
    coreScaleBase: 1.000,
    coreScalePeak: 1.035,
    violetEnergy: 0.25
  },
  LISTENING: {
    period: 1.25,       // ~48 BPM: alert, responsive, sensitive
    strength: 1.18,
    speedMultiplier: 1.10,
    waveSpeed: 9.5,
    coreScaleBase: 1.020,
    coreScalePeak: 1.055,
    violetEnergy: 0.40
  },
  THINKING: {
    period: 0.88,       // ~68 BPM: rapid cognitive acceleration
    strength: 1.40,
    speedMultiplier: 1.65,
    waveSpeed: 12.0,
    coreScaleBase: 1.030,
    coreScalePeak: 1.075,
    violetEnergy: 0.85
  },
  ANALYSING: {
    period: 0.78,       // ~77 BPM: structured computational precision
    strength: 1.50,
    speedMultiplier: 1.80,
    waveSpeed: 13.5,
    coreScaleBase: 1.035,
    coreScalePeak: 1.085,
    violetEnergy: 0.95
  },
  SIMULATING: {
    period: 0.82,       // ~73 BPM: high-bandwidth simulation pulses
    strength: 1.45,
    speedMultiplier: 1.70,
    waveSpeed: 12.5,
    coreScaleBase: 1.030,
    coreScalePeak: 1.080,
    violetEnergy: 0.90
  },
  RESPONDING: {
    period: 1.65,       // ~36 BPM: expansive, authoritative, resonant wave
    strength: 1.60,
    speedMultiplier: 1.25,
    waveSpeed: 10.0,
    coreScaleBase: 1.040,
    coreScalePeak: 1.110,
    violetEnergy: 0.65
  }
};

/**
 * Calculates the organic double-beat physiological envelope:
 *   Pulse 1: Strong Systolic Peak (phase 0.00 to 0.16)
 *   Notch: Brief Dicrotic Trough (phase 0.16 to 0.20)
 *   Pulse 2: Secondary Diastolic Wave (phase 0.20 to 0.36)
 *   Rest: Extended Diastolic Quiescence (phase 0.36 to 1.00)
 */
export function calculateHeartbeatEnvelope(phase: number): {
  pulse: number;
  isPrimaryBeat: boolean;
  isSecondaryBeat: boolean;
} {
  // 1. Primary Systolic Peak
  if (phase < 0.16) {
    const x = phase / 0.16;
    const sinVal = Math.sin(x * Math.PI);
    return {
      pulse: Math.pow(sinVal, 1.8),
      isPrimaryBeat: true,
      isSecondaryBeat: false
    };
  }

  // 2. Dicrotic Notch / Inter-beat dip
  if (phase < 0.20) {
    const x = (phase - 0.16) / 0.04;
    const val = 0.12 * Math.cos(x * Math.PI * 0.5);
    return {
      pulse: Math.max(0, val),
      isPrimaryBeat: false,
      isSecondaryBeat: false
    };
  }

  // 3. Secondary Diastolic Wave (~48% amplitude of primary)
  if (phase < 0.36) {
    const x = (phase - 0.20) / 0.16;
    const sinVal = Math.sin(x * Math.PI);
    return {
      pulse: 0.48 * Math.pow(sinVal, 1.6),
      isPrimaryBeat: false,
      isSecondaryBeat: true
    };
  }

  // 4. Diastolic Rest Quiescence (calm baseline hum, ~64% of cycle length)
  const restProgress = (phase - 0.36) / 0.64;
  const restingHum = 0.02 * (0.5 + 0.5 * Math.sin(restProgress * Math.PI * 2));
  return {
    pulse: restingHum,
    isPrimaryBeat: false,
    isSecondaryBeat: false
  };
}

export class JarvisHeartbeatController {
  private time = 0;
  private currentPeriod = 1.5;
  private currentStrength = 1.0;
  private beatCount = 0;
  private lastPhase = 0;
  private timeSinceBeat = 0;
  private waveRadius = 0;
  private waveOpacity = 0;
  private currentSample: HeartbeatSample = {
    time: 0,
    phase: 0,
    pulse: 0,
    strength: 1.0,
    period: 1.5,
    bpm: 40,
    beatCount: 0,
    timeSinceBeat: 0,
    waveRadius: 0,
    waveOpacity: 0,
    isPrimaryBeat: false,
    isSecondaryBeat: false,
    state: 'IDLE'
  };

  /**
   * Advances the master heartbeat by delta seconds.
   */
  public update(delta: number, state: JarvisActivityState = 'IDLE'): HeartbeatSample {
    this.time += delta;

    // Smoothly interpolate period and strength toward target profile
    const targetProfile = STATE_PROFILES[state] || STATE_PROFILES.IDLE;
    const lerpRate = Math.min(1.0, delta * 3.5);
    this.currentPeriod += (targetProfile.period - this.currentPeriod) * lerpRate;
    this.currentStrength += (targetProfile.strength - this.currentStrength) * lerpRate;

    // Advance cycle phase
    const cycleTime = this.time % this.currentPeriod;
    const phase = cycleTime / this.currentPeriod;

    // Detect new beat cycle boundary
    if (phase < this.lastPhase) {
      this.beatCount++;
      this.timeSinceBeat = 0;
      this.waveRadius = 0.4;
      this.waveOpacity = 0.95;
    } else {
      this.timeSinceBeat += delta;
    }
    this.lastPhase = phase;

    // Propagate outward energy wave
    const waveSpeed = targetProfile.waveSpeed;
    this.waveRadius += delta * waveSpeed;
    // Fade wave smoothly as it travels outward past radius 5.5
    this.waveOpacity = Math.max(0, 1.0 - (this.waveRadius - 0.4) / 5.2);

    // Calculate organic physiological envelope
    const env = calculateHeartbeatEnvelope(phase);
    const calculatedPulse = env.pulse * this.currentStrength;

    this.currentSample = {
      time: this.time,
      phase,
      pulse: calculatedPulse,
      strength: this.currentStrength,
      period: this.currentPeriod,
      bpm: Math.round(60 / this.currentPeriod),
      beatCount: this.beatCount,
      timeSinceBeat: this.timeSinceBeat,
      waveRadius: this.waveRadius,
      waveOpacity: this.waveOpacity,
      isPrimaryBeat: env.isPrimaryBeat,
      isSecondaryBeat: env.isSecondaryBeat,
      state
    };

    return this.currentSample;
  }

  public getSample(): HeartbeatSample {
    return this.currentSample;
  }

  /**
   * Calculates the radial excitation for an orbital layer at given radius:
   * Returns a normalized pulse excitation in [0, 1] as the wave passes through.
   */
  public getWaveExcitation(layerRadius: number, spread = 0.65): number {
    const dist = Math.abs(layerRadius - this.waveRadius);
    if (dist > spread * 2.5) return 0;
    const gaussian = Math.exp(-Math.pow(dist / spread, 2));
    return gaussian * this.waveOpacity;
  }
}

// Global master instance
export const masterHeartbeat = new JarvisHeartbeatController();

// ============================================
// Constants — Bands, Thresholds, Baselines
// ============================================

export const BANDS = {
  FOCUSED:    { key: 'FOCUSED',    min: 0,  max: 35,  label: 'Focused',    color: '#22c55e', emoji: '🟢' },
  DRIFTING:   { key: 'DRIFTING',   min: 36, max: 60,  label: 'Drifting',   color: '#eab308', emoji: '🟡' },
  OVERLOADED: { key: 'OVERLOADED', min: 61, max: 80,  label: 'Overloaded', color: '#f97316', emoji: '🟠' },
  FATIGUED:   { key: 'FATIGUED',   min: 81, max: 100, label: 'Fatigued',   color: '#ef4444', emoji: '🔴' },
};

export const BAND_ORDER = ['FOCUSED', 'DRIFTING', 'OVERLOADED', 'FATIGUED'];

export const BAND_THRESHOLDS = [
  { band: 'FOCUSED',    min: 0,  max: 35 },
  { band: 'DRIFTING',   min: 36, max: 60 },
  { band: 'OVERLOADED', min: 61, max: 80 },
  { band: 'FATIGUED',   min: 81, max: 100 },
];

export const HYSTERESIS_DURATION_NORMAL = 15;  // seconds
export const HYSTERESIS_DURATION_DEMO   = 5;   // seconds
export const HYSTERESIS_REVERT_MARGIN   = 10;  // points below threshold

export const SNOOZE_DURATION            = 30 * 60;           // 30 min in seconds
export const POPUP_COOLDOWN             = 2 * 60 * 60 * 1000; // 2 hours in ms
export const SIGNAL_WINDOW              = 60;  // seconds
export const MIN_SIGNALS_REQUIRED       = 4;
export const BREAK_DURATION             = 10 * 60; // 10 min in seconds
export const POST_BREAK_FORCED_DURATION = 30 * 60; // 30 min in seconds
export const WEIGHT_LEARNING_RATE       = 0.05;

// CMU keystroke dataset hardcoded baselines (mean, std)
export const SIGNAL_BASELINES = {
  typingSpeedWPM:  { mean: 65,    std: 20   },
  errorRate:       { mean: 0.08,  std: 0.05 },
  holdTimeMs:      { mean: 120,   std: 40   },
  flightTimeMs:    { mean: 160,   std: 55   },
  cursorSpeedPxMs: { mean: 0.45,  std: 0.18 },
  jitterPxMs:      { mean: 0.12,  std: 0.06 },
};

export const SIGNAL_NAMES = {
  typingSpeedWPM:  'Typing Speed',
  errorRate:       'Error Rate',
  holdTimeMs:      'Hold Time',
  flightTimeMs:    'Flight Time',
  cursorSpeedPxMs: 'Cursor Speed',
  jitterPxMs:      'Jitter',
};

export const SIGNAL_UNITS = {
  typingSpeedWPM:  'WPM',
  errorRate:       '%',
  holdTimeMs:      'ms',
  flightTimeMs:    'ms',
  cursorSpeedPxMs: 'px/ms',
  jitterPxMs:      'px/ms',
};

// Default equal weights
export const DEFAULT_SIGNAL_WEIGHTS = {
  typingSpeedWPM:  1.0,
  errorRate:       1.0,
  holdTimeMs:      1.0,
  flightTimeMs:    1.0,
  cursorSpeedPxMs: 1.0,
  jitterPxMs:      1.0,
};

// Popup trigger thresholds
export const POPUP_SUSTAINED_DRAIN_MINUTES  = 25;
export const POPUP_CUMULATIVE_HOURS         = 2;
export const POPUP_CUMULATIVE_THRESHOLD     = 60;
export const POPUP_CRASH_DROP               = 20;
export const POPUP_CRASH_SPIKE              = 80;
export const POPUP_POST_CRASH_DRIFT_MINUTES = 20;
export const POPUP_REPEAT_COUNT             = 3;

// Default comfort settings (all off)
export const DEFAULT_COMFORT_SETTINGS = {
  warmFilter:    false,
  fontBoost:     false,
  reducedMotion: false,
  lowContrast:   false,
  focusMode:     false,
  lineSpacing:   false,
};

// Helper: get band from score
export function getBandFromScore(score, sensitivityOffset = 0) {
  if (score === null || score === undefined) return null;
  const adjusted = score - sensitivityOffset;
  if (adjusted <= 35) return BANDS.FOCUSED;
  if (adjusted <= 60) return BANDS.DRIFTING;
  if (adjusted <= 80) return BANDS.OVERLOADED;
  return BANDS.FATIGUED;
}

// Helper: get band threshold min value
export function getBandThresholdMin(bandKey) {
  return BANDS[bandKey]?.min ?? 0;
}

// ============================================
// localStorage wrapper — mirrors chrome.storage.local API
// ============================================

const PREFIX = 'cfa_';

const DEFAULTS = {
  signal_baselines: null,
  signal_weights: null,
  cost_map_sessions: [],
  feedback_log: [],
  sensitivity: 0,
  snooze_until: null,
  notification_history: [],
  last_popup_time: 0,
  comfort_settings: null,
  popup_counts: {},
  demo_mode: false,
};

export function storageGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return DEFAULTS[key] ?? null;
    return JSON.parse(raw);
  } catch {
    return DEFAULTS[key] ?? null;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

export function storageRemove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function storageClearAll() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

// Convenience for reading specific stores
export const storage = {
  get: storageGet,
  set: storageSet,
  remove: storageRemove,
  clearAll: storageClearAll,
};

export default storage;

// ============================================
// FatigueContext — Global state provider
// ============================================
// Central state: score, band, signals, settings, sessions
// Workflow: Signal listeners attach on mount → feed into rolling 60s window in state

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import useSignalCollector from '../hooks/useSignalCollector';
import useCognitiveScore from '../hooks/useCognitiveScore';
import useHysteresis from '../hooks/useHysteresis';
import useSnooze from '../hooks/useSnooze';
import useSessionTracker from '../hooks/useSessionTracker';
import usePopupTrigger from '../hooks/usePopupTrigger';
import storage from '../utils/storage';
import {
  DEFAULT_SIGNAL_WEIGHTS,
  DEFAULT_COMFORT_SETTINGS,
  BANDS,
  WEIGHT_LEARNING_RATE,
  POST_BREAK_FORCED_DURATION,
} from '../utils/constants';

const FatigueContext = createContext(null);

export function FatigueProvider({ children }) {
  // === Settings from localStorage ===
  const [signalWeights, setSignalWeights] = useState(() => {
    const saved = storage.get('signal_weights');
    if (saved && !saved.hasOwnProperty('typingSpeedWPM')) {
      storage.remove('signal_weights');
      return DEFAULT_SIGNAL_WEIGHTS;
    }
    return saved || DEFAULT_SIGNAL_WEIGHTS;
  });
  const [sensitivity, setSensitivity] = useState(() =>
    storage.get('sensitivity') || 0
  );
  const [demoMode, setDemoMode] = useState(() =>
    storage.get('demo_mode') || false
  );
  const [comfortSettings, setComfortSettings] = useState(() => {
    // Always start with comfort settings entirely disabled
    storage.remove('comfort_settings');
    return DEFAULT_COMFORT_SETTINGS;
  });

  // === Adaptations master toggle — controls whether UI changes apply to website ===
  const [adaptationsEnabled, setAdaptationsEnabled] = useState(() =>
    storage.get('adaptations_enabled') !== false
  );

  // === Score slider (ML_HOOK: replace with model output) ===
  const [sliderValue, setSliderValue] = useState(25);
  
  // === Manual override ===
  const [manualOverrideBand, setManualOverrideBand] = useState(null);

  // === Post-break forced adaptation ===
  const [postBreakUntil, setPostBreakUntil] = useState(null);
  const [postBreakMessage, setPostBreakMessage] = useState(null);

  // === Break screen ===
  const [showBreakScreen, setShowBreakScreen] = useState(false);

  // === Show comfort settings panel ===
  const [showComfortPanel, setShowComfortPanel] = useState(false);

  // === Crash simulation ===
  const crashSimRef = useRef(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // === Signal Collection ===
  const { signals, keyEvents, mouseEvents } = useSignalCollector();

  // === Cognitive Score ===
  // Automatically computes based on live signals, unless a simulation is active
  const { score, computedScore, activeSignalCount, currentSignals } = useCognitiveScore(
    signals, keyEvents, mouseEvents, signalWeights, sliderValue, isSimulating
  );

  // === Snooze ===
  const snooze = useSnooze();

  // === Hysteresis ===
  const effectiveScore = score !== null ? score : null;
  const hysteresis = useHysteresis(
    effectiveScore,
    sensitivity,
    demoMode,
    snooze.isSnoozed,
    manualOverrideBand
  );

  // === Post-break override ===
  const activeConfirmedBand = (() => {
    if (postBreakUntil && Date.now() < postBreakUntil) {
      return BANDS.DRIFTING;
    }
    return hysteresis.confirmedBand;
  })();

  // === Session Tracking ===
  const sessionTracker = useSessionTracker(score);

  // Record score every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (score !== null) {
        sessionTracker.recordScore(score);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [score, sessionTracker]);

  // === Popup Trigger ===
  const popupTrigger = usePopupTrigger(
    score,
    sessionTracker.currentDomain,
    activeConfirmedBand?.key || null
  );

  // === Disabled new tab button (Fatigued band = 5 min lockout) ===
  const [newTabDisabledUntil, setNewTabDisabledUntil] = useState(null);
  useEffect(() => {
    if (activeConfirmedBand?.key === 'FATIGUED' && !newTabDisabledUntil) {
      setNewTabDisabledUntil(Date.now() + 5 * 60 * 1000);
    }
  }, [activeConfirmedBand, newTabDisabledUntil]);

  // === Persist settings ===
  useEffect(() => { storage.set('signal_weights', signalWeights); }, [signalWeights]);
  useEffect(() => { storage.set('sensitivity', sensitivity); }, [sensitivity]);
  useEffect(() => { storage.set('demo_mode', demoMode); }, [demoMode]);
  useEffect(() => { storage.set('comfort_settings', comfortSettings); }, [comfortSettings]);
  useEffect(() => { storage.set('adaptations_enabled', adaptationsEnabled); }, [adaptationsEnabled]);

  // === Auto-toggle comfort settings on overload/fatigue ===
  useEffect(() => {
    if (activeConfirmedBand && (activeConfirmedBand.key === 'OVERLOADED' || activeConfirmedBand.key === 'FATIGUED')) {
      setComfortSettings({
        warmFilter: true,
        fontBoost: true,
        reducedMotion: true,
        lowContrast: true,
        focusMode: true,
        lineSpacing: true,
      });
    }
  }, [activeConfirmedBand]);

  // === Feedback actions ===
  const logFeedback = useCallback((type) => {
    const log = storage.get('feedback_log') || [];
    log.unshift({
      type, // 'false_positive' or 'true_positive'
      timestamp: Date.now(),
      band: activeConfirmedBand?.key,
      score,
    });
    storage.set('feedback_log', log.slice(0, 200));

    // Adjust weights
    const newWeights = { ...signalWeights };
    for (const key of Object.keys(newWeights)) {
      if (type === 'false_positive') {
        newWeights[key] = Math.max(0.1, newWeights[key] - WEIGHT_LEARNING_RATE);
      } else {
        newWeights[key] = Math.min(2.0, newWeights[key] + WEIGHT_LEARNING_RATE);
      }
    }
    setSignalWeights(newWeights);
  }, [signalWeights, activeConfirmedBand, score]);

  // Revert all adaptations (false positive feedback)
  const revertAdaptations = useCallback(() => {
    logFeedback('false_positive');
    hysteresis.forceRevert();
  }, [logFeedback, hysteresis]);

  // Confirm adaptations (true positive feedback)
  const confirmAdaptations = useCallback(() => {
    logFeedback('true_positive');
  }, [logFeedback]);

  // === Break screen handlers ===
  const startBreak = useCallback(() => {
    setShowBreakScreen(true);
    snooze.startSnooze(10 * 60); // 10 min snooze during break
  }, [snooze]);

  const endBreak = useCallback(() => {
    setShowBreakScreen(false);
    snooze.cancelSnooze();
    // Post-break: apply Drifting band for 30 minutes
    setPostBreakUntil(Date.now() + POST_BREAK_FORCED_DURATION * 1000);
    setPostBreakMessage('Welcome back. Your UI has been simplified for the next 30 minutes.');
    // Clear message after 10 seconds
    setTimeout(() => setPostBreakMessage(null), 10000);
    // Log break
    const history = storage.get('notification_history') || [];
    history.unshift({
      timestamp: Date.now(),
      triggerType: 'break_completed',
      domain: sessionTracker.currentDomain || 'N/A',
      action: 'Break',
    });
    storage.set('notification_history', history.slice(0, 100));
  }, [snooze, sessionTracker.currentDomain]);

  // === Crash simulation ===
  const simulateCrash = useCallback(() => {
    setIsSimulating(true);
    setSliderValue(85);
    if (crashSimRef.current) clearTimeout(crashSimRef.current);
    // Wait 20s to allow the full 15s hysteresis countdown to complete, then drop
    crashSimRef.current = setTimeout(() => {
      setSliderValue(45);
      setTimeout(() => {
        setIsSimulating(false);
        crashSimRef.current = null;
      }, 5000); // 5 seconds later return completely to live parsing
    }, 20000);
  }, []);

  // === Clear all data ===
  const clearAllData = useCallback(() => {
    storage.clearAll();
    setSignalWeights(DEFAULT_SIGNAL_WEIGHTS);
    setSensitivity(0);
    setDemoMode(false);
    setComfortSettings(DEFAULT_COMFORT_SETTINGS);
    setSliderValue(25);
    setAdaptationsEnabled(true);
    setManualOverrideBand(null);
    setPostBreakUntil(null);
    setPostBreakMessage(null);
    setNewTabDisabledUntil(null);
    setIsSimulating(false);
    if (crashSimRef.current) clearTimeout(crashSimRef.current);
    hysteresis.forceRevert();
    snooze.cancelSnooze();
  }, [hysteresis, snooze]);

  // === Toggle comfort setting ===
  const toggleComfort = useCallback((key) => {
    setComfortSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const value = {
    // Score
    score: effectiveScore,
    sliderValue,
    setSliderValue,
    computedScore,
    activeSignalCount,
    currentSignals,
    
    // Signals
    signals,
    signalWeights,
    
    // Bands & hysteresis
    confirmedBand: activeConfirmedBand,
    pendingBand: hysteresis.pendingBand,
    countdown: hysteresis.countdown,
    
    // Adaptations toggle
    adaptationsEnabled,
    setAdaptationsEnabled,
    
    // Settings
    sensitivity,
    setSensitivity,
    demoMode,
    setDemoMode,
    comfortSettings,
    setComfortSettings,
    toggleComfort,
    showComfortPanel,
    setShowComfortPanel,
    
    // Manual override
    manualOverrideBand,
    setManualOverrideBand,
    
    // Snooze
    snooze,
    
    // Session tracking
    sessionTracker,
    
    // Popup
    popupTrigger,
    
    // Feedback
    revertAdaptations,
    confirmAdaptations,
    
    // Break screen
    showBreakScreen,
    startBreak,
    endBreak,
    postBreakMessage,
    
    // New tab lockout
    newTabDisabledUntil,
    
    // Test/demo
    simulateCrash,
    clearAllData,
  };

  return (
    <FatigueContext.Provider value={value}>
      {children}
    </FatigueContext.Provider>
  );
}

export function useFatigue() {
  const ctx = useContext(FatigueContext);
  if (!ctx) throw new Error('useFatigue must be used within FatigueProvider');
  return ctx;
}

export default FatigueContext;

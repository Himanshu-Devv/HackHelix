// LiveMonitorTab — Tab 1 container
import React from 'react';
import { useFatigue } from '../../context/FatigueContext';
import ScoreGauge from './ScoreGauge';
import BandIndicator from './BandIndicator';
import HysteresisCountdown from './HysteresisCountdown';
import SignalDebugPanel from './SignalDebugPanel';
import SnoozeButton from './SnoozeButton';
import SensitivitySlider from './SensitivitySlider';
import ManualOverride from './ManualOverride';

export default function LiveMonitorTab() {
  const {
    score,
    activeSignalCount,
    signals,
    confirmedBand,
    pendingBand,
    countdown,
    sensitivity,
    setSensitivity,
    manualOverrideBand,
    setManualOverrideBand,
    snooze,
    postBreakMessage,
  } = useFatigue();

  return (
    <div className="space-y-4 max-w-lg mx-auto" id="live-monitor-tab">
      {/* Post-break welcome message */}
      {postBreakMessage && (
        <div className="glass-card rounded-xl p-3 text-sm text-center text-emerald-300 border-emerald-500/30 bg-emerald-500/10 animate-fade-in">
          🌿 {postBreakMessage}
        </div>
      )}

      {/* Score Gauge + Band */}
      <div className="glass-card rounded-xl p-6 flex flex-col items-center gap-3">
        <ScoreGauge score={score} sensitivity={sensitivity} />
        <BandIndicator band={confirmedBand} />
        <HysteresisCountdown pendingBand={pendingBand} countdown={countdown} />
      </div>

      {/* Controls row */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <SnoozeButton snooze={snooze} />
        </div>

        <div className="border-t border-white/5 pt-3 space-y-3">
          <SensitivitySlider value={sensitivity} onChange={setSensitivity} />
          <ManualOverride value={manualOverrideBand} onChange={setManualOverrideBand} />
        </div>
      </div>

      {/* Signal Debug Panel */}
      <SignalDebugPanel signals={signals} activeSignalCount={activeSignalCount} />
    </div>
  );
}

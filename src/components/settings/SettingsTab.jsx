// SettingsTab — Tab 4 container
import React from 'react';
import { useFatigue } from '../../context/FatigueContext';
import ClearDataButton from './ClearDataButton';
import ComfortSettings from './ComfortSettings';
import TestButtons from './TestButtons';
import SensitivitySlider from '../liveMonitor/SensitivitySlider';

export default function SettingsTab() {
  const {
    sensitivity,
    setSensitivity,
    comfortSettings,
    toggleComfort,
    clearAllData,
    popupTrigger,
    simulateCrash,
  } = useFatigue();

  return (
    <div className="max-w-lg mx-auto space-y-4" id="settings-tab">
      {/* Sensitivity */}
      <div className="glass-card rounded-xl p-4">
        <SensitivitySlider value={sensitivity} onChange={setSensitivity} />
      </div>

      {/* Comfort settings */}
      <div className="glass-card rounded-xl p-4">
        <ComfortSettings settings={comfortSettings} onToggle={toggleComfort} />
      </div>

      {/* Test buttons */}
      <div className="glass-card rounded-xl p-4">
        <TestButtons
          onTriggerPopup={() => popupTrigger.forceTrigger('test', 'slack.com')}
          onSimulateCrash={simulateCrash}
        />
      </div>

      {/* Clear data */}
      <ClearDataButton onClear={clearAllData} />
    </div>
  );
}

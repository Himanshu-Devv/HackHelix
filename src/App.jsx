// ============================================
// App.jsx — Root: tab router + global providers
// ============================================
// Workflow overview (see code comments throughout codebase):
// 1. Signal listeners attach on mount → feed into rolling 60s window in state
// 2. Every second, raw signal values are read from the window
// 3. Z-score per signal: z = (current − mean) / std, clamped via sigmoid to [0,1]
//    // ML_HOOK: this entire step will be replaced by model inference
// 4. 7 z-scores combined with equal weights × 100 = Cognitive Load Score
// 5. Score drives threshold detection with hysteresis timer
// 6. Adaptations fire/revert based on band
// 7. User feedback adjusts signal weights in localStorage
// 8. Session data written to cost map on domain switch

import React from 'react';
import { FatigueProvider } from './context/FatigueContext';
import Dashboard from './components/layout/Dashboard';

export default function App() {
  return (
    <FatigueProvider>
      <Dashboard />
    </FatigueProvider>
  );
}

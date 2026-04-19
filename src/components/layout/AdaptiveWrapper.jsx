// AdaptiveWrapper — Wraps content, applies band-based CSS adaptations
// Applies CSS classes and inline styles based on confirmed band
// Also applies all active comfort settings

import React, { useMemo } from 'react';
import { useFatigue } from '../../context/FatigueContext';

export default function AdaptiveWrapper({ children }) {
  const { confirmedBand, comfortSettings, snooze } = useFatigue();
  const bandKey = confirmedBand?.key || null;
  const isSnoozed = snooze.isSnoozed;

  const adaptationStyles = useMemo(() => {
    const styles = {};
    const classes = [];

    if (!isSnoozed && bandKey) {
      // Band-based adaptations
      if (bandKey === 'DRIFTING' || bandKey === 'OVERLOADED' || bandKey === 'FATIGUED') {
        styles['--adaptation-font-boost'] = '2px';
        classes.push('dim-badges');
      }
      if (bandKey === 'OVERLOADED' || bandKey === 'FATIGUED') {
        styles['--adaptation-line-spacing'] = '1.8';
      }
      if (bandKey === 'FATIGUED') {
        styles['--adaptation-font-boost'] = '3px';
      }
    }

    // Comfort settings (always applied regardless of band)
    if (comfortSettings.warmFilter) classes.push('comfort-warm-filter');
    if (comfortSettings.lowContrast) classes.push('comfort-low-contrast');
    if (comfortSettings.reducedMotion) classes.push('comfort-reduced-motion');
    if (comfortSettings.focusMode) classes.push('focus-mode');
    if (comfortSettings.fontBoost) styles['--comfort-font-boost'] = '3px';
    if (comfortSettings.lineSpacing) styles['--comfort-line-spacing'] = '1.9';

    return { styles, classes };
  }, [bandKey, isSnoozed, comfortSettings]);

  return (
    <div
      className={`adaptive-content ${adaptationStyles.classes.join(' ')}`}
      style={adaptationStyles.styles}
    >
      {children}
    </div>
  );
}

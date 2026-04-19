// ============================================
// useSnooze — 30-minute snooze with countdown
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { SNOOZE_DURATION } from '../utils/constants';
import storage from '../utils/storage';

export default function useSnooze() {
  const [snoozeUntil, setSnoozeUntil] = useState(() => {
    const saved = storage.get('snooze_until');
    if (saved && saved > Date.now()) return saved;
    return null;
  });

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isSnoozed = snoozeUntil !== null && snoozeUntil > Date.now();

  // Update countdown every second
  useEffect(() => {
    if (!snoozeUntil) {
      setRemainingSeconds(0);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.ceil((snoozeUntil - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        setSnoozeUntil(null);
        storage.remove('snooze_until');
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [snoozeUntil]);

  const startSnooze = useCallback((durationSeconds = SNOOZE_DURATION) => {
    const until = Date.now() + durationSeconds * 1000;
    setSnoozeUntil(until);
    storage.set('snooze_until', until);
  }, []);

  const cancelSnooze = useCallback(() => {
    setSnoozeUntil(null);
    storage.remove('snooze_until');
    setRemainingSeconds(0);
  }, []);

  // Format remaining as MM:SS
  const formatRemaining = () => {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    isSnoozed,
    remainingSeconds,
    formattedRemaining: formatRemaining(),
    startSnooze,
    cancelSnooze,
  };
}

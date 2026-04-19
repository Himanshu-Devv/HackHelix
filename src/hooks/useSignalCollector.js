// ============================================
// useSignalCollector.js — Hardware Signal Engine
// ============================================
// Captures precise hardware events tailored for 6 new metrics:
// typingSpeedWPM, errorRate, holdTimeMs, flightTimeMs, cursorSpeedPxMs, jitterPxMs

import { useState, useEffect, useRef } from 'react';

export default function useSignalCollector() {
  const [signals, setSignals] = useState({
    typingSpeedWPM:  null,
    errorRate:       null,
    holdTimeMs:      null,
    flightTimeMs:    null,
    cursorSpeedPxMs: null,
    jitterPxMs:      null,
  });

  const keyEvents = useRef([]);
  const mouseEvents = useRef([]);
  const lastMouseTime = useRef(0);

  // Interval for calculating signals
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Prune old entries (-60000ms)
      keyEvents.current = keyEvents.current.filter(e => now - e.keydownAt < 60000);
      mouseEvents.current = mouseEvents.current.filter(e => now - e.t < 60000);

      const keys = keyEvents.current;
      const mouse = mouseEvents.current;

      let typingSpeedWPM = null;
      let errorRate = null;
      let holdTimeMs = null;
      let flightTimeMs = null;
      let cursorSpeedPxMs = null;
      let jitterPxMs = null;

      // 1. Typing Speed (WPM)
      const validKeys = keys.filter(e => e.key !== 'Backspace' && e.key !== 'Delete');
      if (validKeys.length >= 10) {
        const first = validKeys[0].keydownAt;
        const last = validKeys[validKeys.length - 1].keydownAt;
        const elapsedMinutes = (last - first) / 60000;
        if (elapsedMinutes > 0) {
          typingSpeedWPM = (validKeys.length / 5) / elapsedMinutes;
        }
      }

      // 2. Error / Backspace Rate
      if (keys.length >= 10) {
        const bsCount = keys.filter(e => e.key === 'Backspace' || e.key === 'Delete').length;
        errorRate = bsCount / keys.length;
      }

      // 3. Hold Time (ms)
      const holds = keys
        .map(e => e.keyupAt ? e.keyupAt - e.keydownAt : null)
        .filter(h => h !== null && h <= 2000);
        
      if (holds.length >= 10) {
        holdTimeMs = holds.reduce((a, b) => a + b, 0) / holds.length;
      }

      // 4. Flight Time (ms)
      const flights = [];
      for (let i = 0; i < keys.length - 1; i++) {
        const current = keys[i];
        const next = keys[i+1];
        if (current.keyupAt && next.keydownAt) {
          const flight = next.keydownAt - current.keyupAt;
          if (flight >= 0) flights.push(flight);
        }
      }
      if (flights.length >= 10) {
        flightTimeMs = flights.reduce((a, b) => a + b, 0) / flights.length;
      }

      // 5. Cursor Speed & 6. Jitter
      const speeds = [];
      for (let i = 0; i < mouse.length - 1; i++) {
        const current = mouse[i];
        const next = mouse[i+1];
        const dt = next.t - current.t;
        if (dt > 0) {
          const dx = next.x - current.x;
          const dy = next.y - current.y;
          speeds.push(Math.sqrt(dx*dx + dy*dy) / dt);
        }
      }
      if (speeds.length >= 10) {
        cursorSpeedPxMs = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        jitterPxMs = speeds.reduce((a, s) => a + Math.abs(s - cursorSpeedPxMs), 0) / speeds.length;
      }

      setSignals({
        typingSpeedWPM,
        errorRate,
        holdTimeMs,
        flightTimeMs,
        cursorSpeedPxMs,
        jitterPxMs,
      });

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Hardware event listeners
  useEffect(() => {
    // Store down times loosely inside the closure
    const activeKeys = new Map();

    const handleKeyDown = (e) => {
      if (e.repeat) return; // ignore held-key repeats
      // use e.code for unique maps, but fall back to e.key for mapping
      const keyId = e.code || e.key;
      activeKeys.set(keyId, Date.now());
    };

    const handleKeyUp = (e) => {
      const now = Date.now();
      const keyId = e.code || e.key;
      const downTime = activeKeys.get(keyId) || now; // default to now if missing
      
      keyEvents.current.push({
        key: e.key,
        keydownAt: downTime,
        keyupAt: now,
      });
      activeKeys.delete(keyId);
    };

    const handleMouseMove = (e) => {
      const now = Date.now();
      // Throttle to 10Hz (100ms)
      if (now - lastMouseTime.current >= 100) {
        mouseEvents.current.push({
          x: e.clientX,
          y: e.clientY,
          t: now,
        });
        lastMouseTime.current = now;
      }
    };

    const handleVisibility = () => {
      // Empty stub to obey standard instruction (removed tab metrics)
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return { signals, keyEvents, mouseEvents };
}

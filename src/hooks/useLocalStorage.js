// ============================================
// useLocalStorage — Generic hook for localStorage with JSON
// ============================================

import { useState, useCallback } from 'react';

export default function useLocalStorage(key, defaultValue) {
  const prefixedKey = `cfa_${key}`;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(prefixedKey);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(prefixedKey, JSON.stringify(valueToStore));
    } catch (e) {
      console.warn(`useLocalStorage: failed to set ${prefixedKey}`, e);
    }
  }, [prefixedKey, storedValue]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(prefixedKey);
      setStoredValue(defaultValue);
    } catch (e) {
      console.warn(`useLocalStorage: failed to remove ${prefixedKey}`, e);
    }
  }, [prefixedKey, defaultValue]);

  return [storedValue, setValue, removeValue];
}

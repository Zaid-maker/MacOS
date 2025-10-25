import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for persisting state to localStorage with type safety
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error saving localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Hook to persist window state with debouncing to avoid excessive writes
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  delay = 500
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setInternalValue] = useState<T>(initialValue);
  const [storedValue, setStoredValue] = useLocalStorage(key, initialValue);

  // Initialize from localStorage
  useEffect(() => {
    setInternalValue(storedValue);
  }, []); // Only run once on mount

  // Debounce writes to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setStoredValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, setStoredValue]);

  return [value, setInternalValue];
}

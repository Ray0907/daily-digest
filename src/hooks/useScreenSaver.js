import { useState, useEffect, useRef, useCallback } from 'react';

export function useScreenSaver(timeout_ms = 60000) {
  const [is_active, setIsActive] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsActive(true);
    }, timeout_ms);
  }, [timeout_ms]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Start the initial timer
    timerRef.current = setTimeout(() => {
      setIsActive(true);
    }, timeout_ms);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timerRef.current);
    };
  }, [resetTimer, timeout_ms]);

  return { is_active };
}

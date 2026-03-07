import { useEffect, useRef } from 'react';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export function useKonamiCode(callback) {
  const indexRef = useRef(0);

  useEffect(() => {
    function handleKeyDown(e) {
      const expected = KONAMI_SEQUENCE[indexRef.current];
      if (e.code === expected) {
        indexRef.current += 1;
        if (indexRef.current === KONAMI_SEQUENCE.length) {
          indexRef.current = 0;
          if (callback) callback();
        }
      } else {
        indexRef.current = 0;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}

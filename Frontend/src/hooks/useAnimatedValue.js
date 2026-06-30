import { useEffect, useRef, useState } from 'react';

/**
 * Animates a numeric value from its previous to its current target,
 * producing a smooth count-up / count-down effect.
 *
 * @param {number} target      The real value to converge toward
 * @param {number} durationMs  Animation duration (default 400ms)
 * @returns {number}           The currently displayed (interpolated) value
 */
export function useAnimatedValue(target, durationMs = 400) {
  const [display, setDisplay] = useState(target);
  const rafRef   = useRef(null);
  const startRef = useRef(null);
  const fromRef  = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    const start = performance.now();
    startRef.current = start;

    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const val = from + (target - from) * eased;
      setDisplay(val);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, durationMs]);

  // When the animation finishes, lock fromRef to the latest target
  useEffect(() => { fromRef.current = display; });

  return display;
}

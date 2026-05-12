import { useEffect, useRef, useState } from 'react';

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/**
 * Animates an integer from the last displayed value toward `target`.
 * When `target` is null/undefined, internal state resets to 0 (caller should show a placeholder).
 */
export function useCountUp(
  target: number | null | undefined,
  options?: { durationMs?: number },
): number {
  const durationMs = options?.durationMs ?? 1000;
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    if (target == null || !Number.isFinite(target)) {
      displayRef.current = 0;
      setDisplay(0);
      return;
    }

    const from = displayRef.current;
    const delta = target - from;
    if (delta === 0) {
      setDisplay(target);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const next = Math.round(from + delta * easeOutCubic(t));
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        displayRef.current = target;
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return display;
}

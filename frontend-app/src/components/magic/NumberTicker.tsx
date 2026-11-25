import React, { useEffect, useRef, useState } from 'react';

export interface NumberTickerProps {
  value?: number;
  decimals?: number;
  durationMs?: number;
}

/** Magic UI-inspired animated number ticker. */
export function NumberTicker({ value = 0, decimals = 0, durationMs = 450 }: NumberTickerProps) {
  const [display, setDisplay] = useState<number>(Number(value) || 0);
  const prevRef = useRef<number>(Number(value) || 0);

  useEffect(() => {
    const target = Number(value) || 0;
    const startVal = prevRef.current;
    if (startVal === target) {
      setDisplay(target);
      return;
    }
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = startVal + (target - startVal) * eased;
      setDisplay(decimals > 0 ? Number(current.toFixed(decimals)) : Math.round(current));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, decimals, durationMs]);

  return <span>{decimals > 0 ? display.toFixed(decimals) : display}</span>;
}

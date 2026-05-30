"use client";

import { useState, useEffect, useRef } from "react";

export function usePhraseRotation(
  phrases: readonly string[],
  enabled: boolean
): { phrase: string; isFading: boolean } {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIndex(0);
      setIsFading(false);
      return;
    }

    setIndex(0);
    setIsFading(false);

    const schedule = () => {
      // Varia entre 2800ms e 3800ms para parecer mais orgânico
      const delay = 2800 + Math.random() * 1000;
      intervalRef.current = setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % phrases.length);
          setIsFading(false);
          schedule();
        }, 450);
      }, delay);
    };

    schedule();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, phrases.length]);

  return { phrase: phrases[index], isFading };
}

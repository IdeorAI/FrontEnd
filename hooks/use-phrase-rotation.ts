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

    intervalRef.current = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setIsFading(false);
      }, 400);
    }, 2500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, phrases.length]);

  return { phrase: phrases[index], isFading };
}

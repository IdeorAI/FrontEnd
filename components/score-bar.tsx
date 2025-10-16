// components/score-bar.tsx
"use client";

import { memo, useMemo } from "react";
import { Rocket } from "lucide-react";

type Props = {
  score: number;   // 0..10
  max?: number;    // default 10
  className?: string;
};

export const ScoreBar = memo(function ScoreBar({ score, max = 10, className }: Props) {
  const pct = useMemo(() => {
    const clamped = Math.max(0, Math.min(score, max));
    return (clamped / max) * 100; // 0..100
  }, [score, max]);

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="opacity-70">Score</span>
        <strong>{score.toFixed(1)}</strong>
      </div>

      <div className="relative h-2 w-full rounded bg-muted overflow-visible">
        {/* trilho preenchido */}
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-[width] duration-500 ease-out rounded"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
        {/* foguete */}
        <Rocket
          className="
            absolute -top-3 h-5 w-5 rotate-45
            text-[#8c7dff]
            drop-shadow-md transition-[left] duration-500 ease-out
            z-10
          "
          style={{ left: `calc(${pct}% - 10px)` }} // -10px ~ metade do ícone
          aria-label={`Progresso: ${score.toFixed(1)} de ${max.toFixed(1)}`}
        />
      </div>
    </div>
  );
});

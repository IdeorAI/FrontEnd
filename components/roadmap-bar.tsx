// components/roadmap-bar.tsx
"use client";

import { memo, useMemo } from "react";
import { Rocket } from "lucide-react";

type Props = {
  completed: number;   // 0..8 (número de etapas completas)
  total?: number;      // default 8
  className?: string;
};

export const RoadmapBar = memo(function RoadmapBar({ completed, total = 8, className }: Props) {
  const pct = useMemo(() => {
    const clamped = Math.max(0, Math.min(completed, total));
    return (clamped / total) * 100; // 0..100
  }, [completed, total]);

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="opacity-70">Roadmap</span>
        <strong>{completed}/{total}</strong>
      </div>

      <div className="relative h-2 w-full rounded bg-muted overflow-visible">
        {/* trilho preenchido */}
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-[width] duration-500 ease-out rounded"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
        {/* foguete - centralizado verticalmente e na frente */}
        <Rocket
          className="
            absolute h-5 w-5 rotate-45
            text-[#8c7dff]
            drop-shadow-md transition-[left] duration-500 ease-out
          "
          style={{
            left: `calc(${pct}% - 10px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10
          }}
          aria-label={`Progresso: ${completed} de ${total} etapas`}
        />
      </div>
    </div>
  );
});

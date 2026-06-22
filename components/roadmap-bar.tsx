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
  // Clampa também o número exibido — duplicatas de tasks no banco podiam
  // estourar o total e mostrar "7/6" (texto saía sem clamp, só a barra clampava).
  const displayCompleted = Math.max(0, Math.min(completed, total));
  const pct = useMemo(() => {
    return (displayCompleted / total) * 100; // 0..100
  }, [displayCompleted, total]);

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="opacity-70">Roadmap</span>
        <strong>{displayCompleted}/{total}</strong>
      </div>

      <div className="relative h-2 w-full rounded bg-muted overflow-visible">
        {/* trilho preenchido */}
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-[width] duration-500 ease-out rounded"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
        {/* foguete - horizontal navegando da esquerda para direita */}
        <Rocket
          className="
            absolute h-5 w-5
            text-[#8c7dff]
            drop-shadow-md transition-[left] duration-500 ease-out
          "
          style={{
            left: `calc(${pct}% - 10px)`,
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 10
          }}
          aria-label={`Progresso: ${displayCompleted} de ${total} etapas`}
        />
      </div>
    </div>
  );
});

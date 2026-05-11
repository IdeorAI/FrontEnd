"use client";

import * as React from "react";
import {
  Flag,
  Lightbulb,
  Search,
  Target,
  Briefcase,
  Rocket,
  Check,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface JourneyStage {
  id: string;
  short: string;       // "01" .. "06"
  label: string;       // "Problema"
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export const DEFAULT_STAGES: JourneyStage[] = [
  { id: "etapa0", short: "01", label: "Início",            icon: Flag },
  { id: "etapa1", short: "02", label: "Problema",          icon: Lightbulb },
  { id: "etapa2", short: "03", label: "Pesquisa",          icon: Search },
  { id: "etapa3", short: "04", label: "Proposta de Valor", icon: Target },
  { id: "etapa4", short: "05", label: "Modelo de Negócio", icon: Briefcase },
  { id: "etapa5", short: "06", label: "MVP",               icon: Rocket },
];

interface JourneyStepperProps {
  /** Index (0..stages.length-1) da etapa atualmente em andamento. */
  currentIndex: number;
  /** Indices das etapas concluídas. */
  completed: number[];
  stages?: JourneyStage[];
  onStageClick?: (stage: JourneyStage, index: number) => void;
  className?: string;
}

/**
 * Hero stepper da jornada da startup (Design Handoff).
 * - Linha conectora: trecho concluído com gradient brand
 * - Etapas concluídas: bg brand sólido + check
 * - Etapa ativa: bg surface + 2px brand border + brand-glow
 * - Etapas bloqueadas: dashed border + lock
 */
export function JourneyStepper({
  currentIndex,
  completed,
  stages = DEFAULT_STAGES,
  onStageClick,
  className,
}: JourneyStepperProps) {
  const lastCompletedIdx = Math.max(-1, ...completed);
  // % do conector que deve ser preenchido (gradient brand)
  const fillPct =
    stages.length <= 1
      ? 0
      : Math.max(0, Math.min(1, (lastCompletedIdx + 0.5) / (stages.length - 1))) * 100;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card px-6 py-5 shadow-sm",
        className,
      )}
    >
      {/* Top bar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
            Jornada da Startup
          </div>
          <h2 className="mt-1 text-[18px] font-bold leading-tight text-ink-primary">
            Etapa {currentIndex + 1} de {stages.length}
            {stages[currentIndex] && (
              <span className="text-ink-tertiary"> · {stages[currentIndex].label}</span>
            )}
          </h2>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand-soft bg-brand-subtle px-2.5 py-1 text-[11px] font-semibold text-ink-brand">
          <Sparkles className="h-3 w-3" strokeWidth={2.25} />
          IA acompanhando
        </div>
      </div>

      {/* Stepper rail */}
      <div className="relative">
        {/* Conector base */}
        <div className="absolute left-[22px] right-[22px] top-[22px] h-0.5 -translate-y-1/2 rounded bg-surface-sunken" />
        {/* Conector preenchido (gradient) */}
        <div
          className="absolute left-[22px] top-[22px] h-0.5 -translate-y-1/2 rounded"
          style={{
            width: `calc((100% - 44px) * ${fillPct / 100})`,
            background:
              "linear-gradient(90deg, hsl(var(--purple-400)), hsl(var(--purple-600)))",
          }}
        />

        {/* Steps */}
        <div className="relative flex items-start justify-between">
          {stages.map((stage, i) => {
            const isCompleted = completed.includes(i);
            const isActive = !isCompleted && i === currentIndex;
            const isLocked = !isCompleted && !isActive && i > currentIndex;
            const Icon = stage.icon;
            const clickable = !isLocked && onStageClick;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={clickable ? () => onStageClick!(stage, i) : undefined}
                disabled={!clickable}
                className={cn(
                  "group flex flex-col items-center gap-1.5 outline-none",
                  clickable && "cursor-pointer",
                  !clickable && "cursor-default",
                )}
                aria-label={`${stage.short} ${stage.label}`}
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl transition-all",
                    isCompleted &&
                      "bg-brand text-brand-foreground shadow-sm group-hover:bg-brand-hover",
                    isActive &&
                      "border-2 border-brand bg-card text-ink-brand shadow-purple-md ring-4 ring-brand/12",
                    isLocked &&
                      "border-2 border-dashed border-strong bg-card text-ink-muted",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" strokeWidth={2.5} />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Rocket className="h-5 w-5" strokeWidth={2} />
                  )}
                </span>
                <span className="font-mono text-[10px] font-semibold leading-none text-ink-muted">
                  {stage.short}
                </span>
                <span
                  className={cn(
                    "max-w-[90px] text-center text-xs leading-tight",
                    isActive ? "font-bold text-ink-primary" : "font-medium text-ink-secondary",
                  )}
                >
                  {stage.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

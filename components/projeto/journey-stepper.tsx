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
  ChevronDown,
  FileText,
  Pencil,
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
  currentIndex: number;
  completed: number[];
  stages?: JourneyStage[];
  /** Resumos por stage.id — ex: { "etapa1": "Problema validado com 20 entrevistas..." } */
  stageSummaries?: Partial<Record<string, string>>;
  /** Chamado quando o usuário confirma navegar para a etapa (editar ou iniciar). */
  onStageNavigate?: (stage: JourneyStage, index: number) => void;
  /** Chamado quando o usuário clica em "Gerar Relatório" (spec 014). */
  onReportClick?: (stage: JourneyStage) => void;
  className?: string;
}

export function JourneyStepper({
  currentIndex,
  completed,
  stages = DEFAULT_STAGES,
  stageSummaries = {},
  onStageNavigate,
  onReportClick,
  className,
}: JourneyStepperProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const lastCompletedIdx = Math.max(-1, ...completed);
  const targetIdx = Math.max(lastCompletedIdx, currentIndex);
  const fillPct =
    stages.length <= 1
      ? 0
      : Math.max(0, Math.min(1, targetIdx / (stages.length - 1))) * 100;

  function handleStageClick(stage: JourneyStage, index: number) {
    if (stage.id === "etapa0") return; // Início é informativo
    const isLocked = !completed.includes(index) && index > currentIndex;
    if (isLocked) return;
    setExpandedId(prev => (prev === stage.id ? null : stage.id));
  }

  const expandedStage = stages.find(s => s.id === expandedId);
  const expandedIndex = expandedStage ? stages.indexOf(expandedStage) : -1;
  const expandedSummary = expandedId ? stageSummaries[expandedId] : undefined;
  const expandedCompleted = expandedIndex >= 0 && completed.includes(expandedIndex);

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
      </div>

      {/* Stepper rail */}
      <div className="relative">
        <div className="absolute left-[22px] right-[22px] top-[22px] h-0.5 -translate-y-1/2 rounded bg-surface-sunken" />
        <div
          className="absolute left-[22px] top-[22px] h-0.5 -translate-y-1/2 rounded"
          style={{
            width: `calc((100% - 44px) * ${fillPct / 100})`,
            background:
              "linear-gradient(90deg, hsl(var(--purple-400)), hsl(var(--purple-600)))",
          }}
        />

        <div className="relative flex items-start justify-between">
          {stages.map((stage, i) => {
            const isCompleted = completed.includes(i);
            const isActive = !isCompleted && i === currentIndex;
            const isLocked = !isCompleted && !isActive && i > currentIndex;
            const isExpanded = expandedId === stage.id;
            const clickable = stage.id !== "etapa0" && !isLocked;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={clickable ? () => handleStageClick(stage, i) : undefined}
                disabled={!clickable}
                className={cn(
                  "group flex flex-col items-center gap-1.5 outline-none",
                  clickable && "cursor-pointer",
                  !clickable && "cursor-default",
                )}
                aria-label={`${stage.short} ${stage.label}`}
                aria-current={isActive ? "step" : undefined}
                aria-expanded={isExpanded}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl transition-all",
                    isCompleted &&
                      "bg-brand text-brand-foreground shadow-sm group-hover:bg-brand-hover",
                    isActive &&
                      "border-2 border-brand bg-card text-ink-brand shadow-purple-md ring-4 ring-brand/12 animate-pulse",
                    isLocked &&
                      "border-2 border-dashed border-strong bg-card text-ink-muted",
                    isExpanded && !isCompleted &&
                      "ring-4 ring-brand/20",
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
                {clickable && (
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-ink-muted transition-transform duration-200",
                      isExpanded && "rotate-180",
                    )}
                    strokeWidth={2}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded panel */}
      {expandedStage && (
        <div className="mt-5 rounded-xl border border-brand/30 bg-brand-subtle/40 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-3 flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-ink-muted">{expandedStage.short}</span>
            <span className="text-sm font-bold text-ink-primary">{expandedStage.label}</span>
            {expandedCompleted && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-ink-brand">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
                Concluída
              </span>
            )}
          </div>

          {expandedSummary ? (
            <>
              <p className="text-xs leading-relaxed text-ink-secondary line-clamp-4">
                {expandedSummary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => onStageNavigate?.(expandedStage, expandedIndex)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink-primary transition-colors hover:border-strong hover:bg-surface-raised"
                >
                  <Pencil className="h-3 w-3" strokeWidth={2} />
                  Editar
                </button>
                <button
                  onClick={() => onReportClick?.(expandedStage)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-ink-brand transition-colors hover:bg-brand/20"
                >
                  <FileText className="h-3 w-3" strokeWidth={2} />
                  Gerar Relatório
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs leading-relaxed text-ink-tertiary">
                Esta etapa ainda não foi realizada. Clique em &quot;Desenvolver&quot; para iniciar com o apoio do IdeorAI.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => onStageNavigate?.(expandedStage, expandedIndex)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-brand-foreground transition-colors hover:bg-brand-hover"
                >
                  <Rocket className="h-3 w-3" strokeWidth={2} />
                  Desenvolver Etapa
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

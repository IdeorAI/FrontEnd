"use client";

import * as React from "react";
import {
  Lightbulb,
  Search,
  Target,
  Briefcase,
  Rocket,
  Award,
  Lock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Milestone {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  unlocked: boolean;
}

export const DEFAULT_MILESTONES: Milestone[] = [
  { id: "first-idea",   label: "Primeira Ideia",  icon: Lightbulb, unlocked: false },
  { id: "clear-problem",label: "Problema Claro",  icon: Lightbulb, unlocked: false },
  { id: "researcher",   label: "Pesquisador",     icon: Search,    unlocked: false },
  { id: "value-prop",   label: "Proposta",        icon: Target,    unlocked: false },
  { id: "strategist",   label: "Estrategista",    icon: Briefcase, unlocked: false },
  { id: "builder",      label: "Construtor",      icon: Rocket,    unlocked: false },
  { id: "validated",    label: "Validado",        icon: Award,     unlocked: false },
];

interface MilestoneStripProps {
  milestones: Milestone[];
  onSeeAll?: () => void;
  className?: string;
}

/**
 * Faixa horizontal de marcos (Design Handoff).
 * 7 tiles equal-width. Unlocked = brand-subtle gradient bg + brand border + ícone brand.
 * Locked = sunken bg + dashed border + lock + 50% opacity.
 */
export function MilestoneStrip({ milestones, onSeeAll, className }: MilestoneStripProps) {
  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-ink-primary">Marcos da jornada</span>
          <span className="inline-flex items-center rounded-full bg-brand-subtle px-2 py-0.5 text-[11px] font-bold text-ink-brand tabular-nums">
            {unlockedCount}/{milestones.length}
          </span>
        </div>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-tertiary hover:text-ink-brand"
          >
            Ver todos
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        {milestones.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className={cn(
                "flex min-w-[110px] flex-1 flex-col items-center gap-2 rounded-lg p-3 text-center transition-all",
                m.unlocked
                  ? "border border-brand-soft bg-gradient-brand-subtle"
                  : "border border-dashed border-strong bg-surface-sunken opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  m.unlocked
                    ? "bg-brand text-brand-foreground"
                    : "bg-surface text-ink-muted",
                )}
              >
                {m.unlocked ? (
                  <Icon className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </span>
              <span
                className={cn(
                  "text-[11px] font-semibold leading-tight",
                  m.unlocked ? "text-ink-primary" : "text-ink-tertiary",
                )}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

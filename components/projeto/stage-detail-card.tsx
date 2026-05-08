"use client";

import * as React from "react";
import { ChevronRight, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIHint } from "@/components/ui/ai-hint";

export type StageStatus = "completed" | "in-progress" | "locked";

interface StageDetailCardProps {
  short: string;        // "01"
  label: string;        // "Problema e Oportunidade"
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  status: StageStatus;
  aiHint?: string;
  onAcceptHint?: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * Card de detalhe da etapa (Design Handoff).
 * Layout: ícone colorido (40x40) → conteúdo (mono "0X" + nome + status badge + descrição + AIHint opcional) → chevron.
 * Click → onClick (quem usa decide: abrir modal CardDialog ou navegar).
 */
export function StageDetailCard({
  short,
  label,
  description,
  icon: Icon,
  status,
  aiHint,
  onAcceptHint,
  onClick,
  className,
}: StageDetailCardProps) {
  const isCompleted = status === "completed";
  const isLocked = status === "locked";
  const isActive = status === "in-progress";
  const clickable = !isLocked && !!onClick;

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      aria-disabled={isLocked}
      className={cn(
        "group rounded-xl border border-border bg-card p-5 transition-all duration-200",
        clickable && "cursor-pointer hover:border-strong hover:shadow-md",
        isLocked && "opacity-60",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]",
            isCompleted && "bg-brand-subtle text-ink-brand",
            isActive && "bg-brand-subtle text-ink-brand",
            isLocked && "bg-surface-sunken text-ink-muted",
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              {short}
            </span>
            <span className="text-sm font-bold leading-tight text-ink-primary">
              {label}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Check className="h-3 w-3" strokeWidth={2.5} />
                Concluído
              </span>
            )}
            {isActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-subtle px-2 py-0.5 text-[10px] font-semibold text-ink-brand">
                Em andamento
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                <Lock className="h-2.5 w-2.5" strokeWidth={2} />
                Bloqueado
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-tertiary">
            {description}
          </p>
          {aiHint && !isLocked && (
            <div
              className="mt-3"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <AIHint onAccept={onAcceptHint}>{aiHint}</AIHint>
            </div>
          )}
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 self-center text-ink-muted transition-transform",
            clickable && "group-hover:translate-x-0.5 group-hover:text-ink-tertiary",
          )}
          strokeWidth={2}
        />
      </div>
    </div>
  );
}

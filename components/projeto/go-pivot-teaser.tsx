"use client";

import * as React from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoPivotTeaserProps {
  completedCount: number;
  totalCount: number;
  /** Se já tem avaliação registrada, mostra "Ver veredicto" em vez de "Pendente". */
  hasVerdict?: boolean;
  verdict?: "GO" | "PIVOT" | null;
  onClick?: () => void;
  className?: string;
}

/**
 * Teaser GO or PIVOT (Design Handoff) — right rail.
 * Mostra progresso até liberar a avaliação VC. Quando todas as etapas estão prontas,
 * convida a clicar; quando já avaliado, mostra o veredicto.
 */
export function GoPivotTeaser({
  completedCount,
  totalCount,
  hasVerdict = false,
  verdict = null,
  onClick,
  className,
}: GoPivotTeaserProps) {
  const ready = completedCount >= totalCount;
  const pct = totalCount > 0 ? Math.min(100, (completedCount / totalCount) * 100) : 0;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-all",
        onClick && "cursor-pointer hover:border-strong hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-ink-brand" strokeWidth={2} />
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-tertiary">
          GO or PIVOT
        </span>
      </div>

      {hasVerdict && verdict ? (
        <>
          <div
            className={cn(
              "mt-2 text-2xl font-extrabold tracking-tight",
              verdict === "GO" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
            )}
          >
            {verdict}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-tertiary">
            Veredicto da avaliação VC disponível. Clique para revisar a análise por dimensão.
          </p>
          {onClick && (
            <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-ink-brand">
              Ver veredicto
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mt-1 text-sm font-bold leading-tight tracking-tight text-ink-primary">
            {ready ? "Pronto para avaliação VC" : "Avaliação VC pendente"}
          </div>
          <p className="mt-1 mb-3 text-xs leading-relaxed text-ink-tertiary">
            {ready
              ? "Todas as etapas concluídas. Solicite a avaliação crítica de um VC virtual."
              : `Conclua todas as ${totalCount} etapas para desbloquear a avaliação crítica de um VC virtual.`}
          </p>
          {/* Progress bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-ink-tertiary tabular-nums">
              {completedCount} de {totalCount} etapas
            </span>
            <span className="font-semibold text-ink-brand tabular-nums">
              {Math.round(pct)}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}

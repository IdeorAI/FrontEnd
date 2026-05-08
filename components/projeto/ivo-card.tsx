"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const IvoMiniChart = dynamic(
  () => import("@/app/projeto/dash/ivo-chart").then((m) => ({ default: m.IvoMiniChart })),
  { ssr: false, loading: () => <div className="h-[50px] w-full animate-pulse rounded bg-surface-sunken" /> },
);

interface IvoCardProps {
  /** Valor atual do IVO Index (em BRL). */
  value: number;
  /** Valor anterior (ex: ontem) — usado para delta absoluto. */
  prevValue?: number;
  /** Média da plataforma — usada para comparação. */
  avgValue?: number;
  /** Histórico para sparkline. */
  history?: { date: string; value: number; label: string }[];
  /** Marca o índice como "parcial" (etapas iniciais ainda não preenchidas). */
  partial?: boolean;
  onClick?: () => void;
  className?: string;
}

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

/**
 * IVO Card (Design Handoff) — right rail.
 * Header (trending icon + IVO INDEX + change badge) → big number → sparkline → footer (vs ontem / vs média).
 */
export function IvoCard({
  value,
  prevValue,
  avgValue,
  history = [],
  partial = false,
  onClick,
  className,
}: IvoCardProps) {
  const delta = prevValue !== undefined ? value - prevValue : 0;
  const deltaPct = prevValue && prevValue > 0 ? ((value - prevValue) / prevValue) * 100 : 0;
  const positive = delta >= 0;

  const vsAvgPct =
    avgValue && avgValue > 0 ? ((value - avgValue) / avgValue) * 100 : null;

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-ink-brand" strokeWidth={2} />
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-tertiary">
            IVO Index
          </span>
          {partial && (
            <Info className="h-3 w-3 text-amber-500" strokeWidth={2} aria-label="Índice parcial" />
          )}
        </div>
        {prevValue !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
              positive
                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
            )}
          >
            {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
            {positive ? "+" : ""}
            {deltaPct.toFixed(0)}%
          </span>
        )}
      </div>

      {/* Big number */}
      <div className="mt-3 text-[28px] font-bold leading-none tabular-nums tracking-tight text-ink-primary">
        {formatBRL(value)}
      </div>

      {/* Sparkline */}
      {history.length > 1 && (
        <div className="mt-3 h-[50px]">
          <IvoMiniChart data={history} />
        </div>
      )}

      {/* Footer */}
      {(prevValue !== undefined || vsAvgPct !== null) && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-[11px]">
          {prevValue !== undefined && (
            <div>
              <div className="text-ink-muted">vs. ontem</div>
              <div
                className={cn(
                  "mt-0.5 font-semibold tabular-nums",
                  positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                )}
              >
                {positive ? "+" : ""}
                {formatBRL(delta)}
              </div>
            </div>
          )}
          {vsAvgPct !== null && (
            <div>
              <div className="text-ink-muted">vs. média plataforma</div>
              <div
                className={cn(
                  "mt-0.5 font-semibold tabular-nums",
                  vsAvgPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                )}
              >
                {vsAvgPct >= 0 ? "+" : ""}
                {vsAvgPct.toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

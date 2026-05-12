"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score: number; // 0-100
  onClick?: () => void;
  className?: string;
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 36;
  const stroke = 7;
  const norm = radius - stroke / 2;
  const circumference = 2 * Math.PI * norm;
  const filled = circumference * (score / 100);
  const color = score >= 70 ? "hsl(var(--purple-500))" : score >= 40 ? "hsl(45 90% 55%)" : "hsl(0 72% 60%)";

  return (
    <svg width={radius * 2} height={radius * 2} className="mx-auto mt-3">
      <circle
        cx={radius} cy={radius} r={norm}
        fill="none" stroke="hsl(var(--surface-sunken))" strokeWidth={stroke}
      />
      <circle
        cx={radius} cy={radius} r={norm}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${radius} ${radius})`}
      />
      <text
        x={radius} y={radius + 6}
        textAnchor="middle"
        className="text-[16px] font-bold fill-ink-primary"
        style={{ fontSize: 16, fontWeight: 700 }}
      >
        {score}
      </text>
    </svg>
  );
}

export function ScoreCard({ score, onClick, className }: ScoreCardProps) {
  const label = score >= 70 ? "Forte" : score >= 40 ? "Em desenvolvimento" : "Inicial";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-all",
        onClick && "cursor-pointer hover:border-strong hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-3.5 w-3.5 text-ink-brand" strokeWidth={2} />
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-tertiary">
            Score
          </span>
        </div>
        <span className="text-[10px] font-semibold text-ink-muted">{label}</span>
      </div>

      <ScoreGauge score={score} />

      <div className="mt-3 border-t border-border pt-3 text-[11px] text-center">
        <div className="text-ink-muted">Pontuação geral do projeto</div>
        <div className="mt-0.5 font-semibold tabular-nums text-ink-primary">{score} / 100</div>
      </div>
    </div>
  );
}

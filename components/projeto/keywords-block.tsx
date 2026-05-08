"use client";

import * as React from "react";
import { Sparkles, Plus, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordsBlockProps {
  keywords: string[];
  onEdit?: () => void;
  onAdd?: () => void;
  className?: string;
}

/**
 * Bloco de palavras-chave do projeto (Design Handoff) — right rail.
 */
export function KeywordsBlock({ keywords, onEdit, onAdd, className }: KeywordsBlockProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-ink-brand" strokeWidth={2} />
          <span className="text-[13px] font-bold text-ink-primary">Palavras-chave</span>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-ink-tertiary hover:bg-surface-sunken hover:text-ink-primary"
          >
            <Edit3 className="h-3 w-3" strokeWidth={2} />
            Editar
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {keywords.map((k) => (
          <span
            key={k}
            className="inline-flex items-center rounded-full bg-brand-subtle px-2.5 py-0.5 text-[11px] font-semibold text-ink-brand"
          >
            {k}
          </span>
        ))}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-6 items-center gap-1 rounded-full border border-dashed border-strong px-2.5 text-[11px] font-semibold text-ink-tertiary transition-colors hover:border-brand hover:text-ink-brand"
          >
            <Plus className="h-2.5 w-2.5" strokeWidth={2.5} />
            Adicionar
          </button>
        )}
        {keywords.length === 0 && !onAdd && (
          <span className="text-xs text-ink-tertiary italic">Nenhuma palavra-chave definida</span>
        )}
      </div>
    </div>
  );
}

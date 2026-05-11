"use client";

import * as React from "react";
import { Sparkles, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordsBlockProps {
  keywords: string[];
  onKeywordsChange?: (next: string[]) => void;
  className?: string;
}

/**
 * Bloco de palavras-chave editável — adicionar clicando "+" e remover clicando "×" em cada tag.
 */
export function KeywordsBlock({ keywords, onKeywordsChange, className }: KeywordsBlockProps) {
  const [input, setInput] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const editable = !!onKeywordsChange;

  const commit = () => {
    const trimmed = input.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      onKeywordsChange?.([...keywords, trimmed]);
    }
    setInput("");
    setAdding(false);
  };

  const remove = (k: string) => {
    onKeywordsChange?.(keywords.filter((kw) => kw !== k));
  };

  React.useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-ink-brand" strokeWidth={2} />
        <span className="text-[13px] font-bold text-ink-primary">Palavras-chave</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {keywords.map((k) => (
          <span
            key={k}
            className="inline-flex items-center gap-1 rounded-full bg-brand-subtle px-2.5 py-0.5 text-[11px] font-semibold text-ink-brand"
          >
            {k}
            {editable && (
              <button
                type="button"
                onClick={() => remove(k)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-brand/20 transition-colors"
                aria-label={`Remover ${k}`}
              >
                <X className="h-2.5 w-2.5" strokeWidth={2.5} />
              </button>
            )}
          </span>
        ))}

        {editable && adding ? (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commit(); }
              if (e.key === "Escape") { setInput(""); setAdding(false); }
            }}
            onBlur={commit}
            placeholder="Nova palavra…"
            className="h-6 w-32 rounded-full border border-brand bg-card px-2.5 text-[11px] font-semibold text-ink-primary outline-none ring-1 ring-brand/30"
          />
        ) : editable ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-6 items-center gap-1 rounded-full border border-dashed border-strong px-2.5 text-[11px] font-semibold text-ink-tertiary transition-colors hover:border-brand hover:text-ink-brand"
          >
            <Plus className="h-2.5 w-2.5" strokeWidth={2.5} />
            Adicionar
          </button>
        ) : null}

        {keywords.length === 0 && !editable && (
          <span className="text-xs text-ink-tertiary italic">Nenhuma palavra-chave definida</span>
        )}
      </div>
    </div>
  );
}

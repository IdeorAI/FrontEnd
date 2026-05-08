"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIHintProps {
  children: React.ReactNode;
  onAccept?: () => void;
  onDismiss?: () => void;
  acceptLabel?: string;
  dismissLabel?: string;
  className?: string;
}

/**
 * Caixa de sugestão da IA inline (Design Handoff).
 * Visual: gradient brand-subtle + brand-soft border + sparkles + Aplicar/Dispensar.
 */
export function AIHint({
  children,
  onAccept,
  onDismiss,
  acceptLabel = "Aplicar",
  dismissLabel = "Dispensar",
  className,
}: AIHintProps) {
  return (
    <div
      className={cn(
        "relative rounded-[10px] border border-brand-soft bg-gradient-brand-subtle px-3 py-2.5",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground"
          aria-hidden
        >
          <Sparkles className="h-3 w-3" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-primary">
            Sugestão da IA
          </div>
          <p className="mt-0.5 text-xs leading-snug text-ink-secondary">{children}</p>
          {(onAccept || onDismiss) && (
            <div className="mt-2 flex items-center gap-2">
              {onAccept && (
                <button
                  type="button"
                  onClick={onAccept}
                  className="inline-flex h-6 items-center rounded-md bg-brand px-2.5 text-[11px] font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
                >
                  {acceptLabel}
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold text-ink-tertiary transition-colors hover:bg-surface-sunken hover:text-ink-primary"
                >
                  {dismissLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

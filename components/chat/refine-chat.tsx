"use client";

import { useState } from "react";
import { Check, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { refineDocument, RefineError } from "@/lib/api/refine";
import type { ChatContext } from "@/lib/api/chat";

interface RefineChatProps {
  stageContent: string;
  stageName: string;
  ctx: ChatContext;
  onApply: (newContent: string) => void;
  className?: string;
}

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getOriginalValue(stageContent: string, key: string): string {
  try {
    const parsed = JSON.parse(stageContent);
    return typeof parsed[key] === "string"
      ? parsed[key]
      : JSON.stringify(parsed[key] ?? "");
  } catch {
    return "";
  }
}

export function RefineChat({
  stageContent,
  stageName,
  ctx,
  onApply,
  className,
}: RefineChatProps) {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diffSections, setDiffSections] = useState<Record<
    string,
    string
  > | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [acceptedKeys, setAcceptedKeys] = useState<Set<string>>(new Set());
  const [rejectedKeys, setRejectedKeys] = useState<Set<string>>(new Set());

  async function handleSubmit() {
    if (!feedback.trim() || isLoading) return;
    setIsLoading(true);
    setDiffSections(null);
    setDiffError(null);

    try {
      const sections = await refineDocument({
        projectId: ctx.projectId ?? "",
        stageContent,
        userFeedback: feedback,
        stageName: stageName ?? ctx.stageName ?? "",
      });

      if (Object.keys(sections).length === 0) {
        setDiffError(
          "A IA não identificou seções para refinar. Tente ser mais específico na instrução."
        );
        return;
      }

      setDiffSections(sections);
      setAcceptedKeys(new Set(Object.keys(sections)));
      setRejectedKeys(new Set());
    } catch (err) {
      if (err instanceof RefineError) {
        setDiffError(err.serverError);
      } else {
        setDiffError("Erro inesperado ao refinar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function toggleKey(key: string, action: "accept" | "reject") {
    if (action === "accept") {
      setAcceptedKeys((prev) => new Set([...prev, key]));
      setRejectedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } else {
      setRejectedKeys((prev) => new Set([...prev, key]));
      setAcceptedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  function acceptAll() {
    if (!diffSections) return;
    setAcceptedKeys(new Set(Object.keys(diffSections)));
    setRejectedKeys(new Set());
  }

  function applyAccepted() {
    if (!diffSections || acceptedKeys.size === 0) return;

    let original: Record<string, unknown> = {};
    try {
      original = JSON.parse(stageContent);
    } catch {
      // stageContent não é JSON — improvável mas protege
    }

    const accepted: Record<string, string> = {};
    for (const key of acceptedKeys) {
      accepted[key] = diffSections[key];
    }

    const merged = { ...original, ...accepted };
    onApply(JSON.stringify(merged));

    // Reset após aplicar
    setDiffSections(null);
    setFeedback("");
    setAcceptedKeys(new Set());
    setRejectedKeys(new Set());
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input de feedback */}
      <div className="space-y-2">
        <textarea
          placeholder={`Ex: "Detalhe mais o problema de dor" ou "Torne o mercado-alvo mais específico"`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          disabled={isLoading}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!feedback.trim() || isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refinando…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Refinar com IA
            </>
          )}
        </button>
      </div>

      {/* Erro */}
      {diffError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {diffError}
        </div>
      )}

      {/* Diff cards */}
      {diffSections && Object.keys(diffSections).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {Object.keys(diffSections).length} seção
              {Object.keys(diffSections).length > 1 ? "ões" : ""} modificada
              {Object.keys(diffSections).length > 1 ? "s" : ""}
            </p>
            <button
              onClick={acceptAll}
              className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
            >
              Aceitar tudo
            </button>
          </div>

          {Object.entries(diffSections).map(([key, refined]) => {
            const isAccepted = acceptedKeys.has(key);
            const isRejected = rejectedKeys.has(key);
            const original = getOriginalValue(stageContent, key);

            return (
              <div
                key={key}
                className={cn(
                  "overflow-hidden rounded-lg border transition-colors",
                  isAccepted && "border-green-500/60",
                  isRejected && "border-red-400/50 opacity-60",
                  !isAccepted && !isRejected && "border-border"
                )}
              >
                {/* Header */}
                <div className="border-b bg-muted/50 px-3 py-2 text-sm font-semibold">
                  {humanizeKey(key)}
                </div>

                {/* Colunas Original / Refinado */}
                <div className="grid grid-cols-2 divide-x text-sm">
                  <div className="p-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Original
                    </p>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {original || "—"}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 dark:bg-green-950/20">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
                      Refinado
                    </p>
                    <p className="whitespace-pre-wrap">{refined}</p>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-2 border-t bg-muted/20 p-2">
                  <button
                    onClick={() => toggleKey(key, "accept")}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                      isAccepted
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "border hover:bg-muted"
                    )}
                  >
                    <Check className="h-3 w-3" /> Aceitar
                  </button>
                  <button
                    onClick={() => toggleKey(key, "reject")}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                      isRejected
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "border hover:bg-muted"
                    )}
                  >
                    <X className="h-3 w-3" /> Rejeitar
                  </button>
                </div>
              </div>
            );
          })}

          {/* Botão aplicar */}
          <button
            onClick={applyAccepted}
            disabled={acceptedKeys.size === 0}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            Aplicar {acceptedKeys.size} alteração
            {acceptedKeys.size !== 1 ? "ões" : ""} aceita
            {acceptedKeys.size !== 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}

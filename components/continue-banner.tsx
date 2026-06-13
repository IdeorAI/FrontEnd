// components/continue-banner.tsx
// Spec 025 (slide 12) — faixa "Continue de onde parou" no dash do projeto.
// Mostra a próxima etapa pendente e leva à sua tela de desenvolvimento.
"use client";

import { ArrowRight, Zap } from "lucide-react";

const STAGE_LABELS: Record<number, string> = {
  1: "Problema e Oportunidade",
  2: "Pesquisa de Mercado",
  3: "Proposta de Valor",
  4: "Modelo de Negócio",
  5: "MVP",
};

/**
 * Renderiza a faixa de continuação.
 * - `completedStages`: números de etapas concluídas (0 = Início).
 * - Se todas as 5 etapas (1..5) estão concluídas, não renderiza nada.
 */
export function ContinueBanner({
  completedStages,
  onContinue,
}: {
  completedStages: number[];
  onContinue: (stageNum: number) => void;
}) {
  // Próxima etapa pendente = menor etapaN (1..5) não concluída.
  let nextStage = -1;
  for (let n = 1; n <= 5; n++) {
    if (!completedStages.includes(n)) {
      nextStage = n;
      break;
    }
  }
  if (nextStage === -1) return null; // jornada completa → sem faixa

  return (
    <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-amber-400/40 bg-amber-50/60 p-5 dark:bg-amber-950/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-amber-400/20 text-amber-600 dark:text-amber-400">
          <Zap className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-bold text-ink-primary">Continue de onde parou</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Avance para a próxima etapa da jornada e continue desenvolvendo seu projeto.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Próxima etapa:
          </p>
          <p className="text-sm font-semibold text-ink-primary">
            {STAGE_LABELS[nextStage]}
          </p>
        </div>
        <button
          onClick={() => onContinue(nextStage)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          Continuar a desenvolver
        </button>
      </div>
    </div>
  );
}

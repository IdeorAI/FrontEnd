// app/idea/onboarding/describe-step.tsx
// Spec 025 — slide 8 (condicional): descrições geradas pela IA.
// Só é alcançado quando approach !== "keep" (ver buildStepSequence).
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import categories from "@/lib/data/categories.json";
import { suggestAndSaveIdeas } from "@/lib/gemini-api";
import { LlmLoadingOverlay } from "@/components/ui/llm-loading-overlay";
import { log } from "@/lib/logger";

import type { StepProps } from "./page";
import { OnboardingHeader, OnboardingFooter } from "./_components";
import { persistOnboardingPatch } from "./_persistence";
import { CATEGORY_UNDEFINED } from "./_types";

const cats = categories as { value: string; label: string }[];

/**
 * Monta a "descrição de segmento" enviada ao gerador de ideias a partir do
 * contexto coletado nos slides 3-7. Funciona como contexto para a LLM.
 */
function buildSegmentContext(state: StepProps["state"]): string {
  const parts: string[] = [];
  if (state.category && state.category !== CATEGORY_UNDEFINED) {
    const label = cats.find((c) => c.value === state.category)?.label;
    if (label) parts.push(`Área: ${label}`);
  }
  if (state.businessType && state.businessType !== "nao-sei") {
    parts.push(`Tipo de negócio: ${state.businessType}`);
  }
  if (state.targetAudience && state.targetAudience !== "Não sei/prefiro não definir") {
    parts.push(`Cliente: ${state.targetAudience}`);
  }
  if (state.region.trim()) parts.push(`Região: ${state.region.trim()}`);
  if (state.constraints.trim()) parts.push(`Restrições: ${state.constraints.trim()}`);

  // Intenção conforme o slide 2.
  if (state.approach === "improve") {
    parts.push(
      "Instrução: reescreva a ideia original melhorando apenas a clareza e a redação, alterando o mínimo possível o significado."
    );
  } else if (state.approach === "suggest") {
    parts.push(
      "Instrução: proponha variações de ideia baseadas na ideia inicial e no contexto."
    );
  } else if (state.noIdea) {
    parts.push(
      "Instrução: o usuário ainda não tem uma ideia; proponha oportunidades de negócio a partir do contexto."
    );
  }
  return parts.join(". ") || "Contexto não informado";
}

export function DescribeStep({
  state,
  patchState,
  onBack,
  onNext,
  projectId,
  user,
  setError,
}: StepProps) {
  const [loading, setLoading] = useState(false);
  const startedRef = useRef(false);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await suggestAndSaveIdeas({
        ownerId: user.id,
        projectId,
        seedIdea: state.idea.trim() || undefined,
        segmentDescription: buildSegmentContext(state),
        count: 3,
      });
      const ideas = Array.isArray(res.ideas) ? res.ideas : [];
      patchState({
        generatedOptions: ideas,
        // pré-seleciona a primeira se ainda não havia escolha
        chosenDescription: state.chosenDescription ?? ideas[0] ?? null,
      });
    } catch (e) {
      log.error("[onboarding] geração de descrições falhou:", e);
      setError(
        e instanceof Error ? e.message : "Não foi possível gerar as descrições."
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, user.id, state, patchState, setError]);

  // Gera ao entrar no passo se ainda não há opções (cache sobrevive ao Voltar).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (state.generatedOptions.length === 0) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = async () => {
    if (!state.chosenDescription) return;
    setLoading(true);
    setError(null);
    // A descrição final cabe em 400 (CHECK).
    const desc = state.chosenDescription.slice(0, 400);
    const { error } = await persistOnboardingPatch(projectId, {
      description: desc,
    });
    setLoading(false);
    if (error) return setError(error);
    patchState({ chosenDescription: desc });
    onNext();
  };

  return (
    <>
      <LlmLoadingOverlay isVisible={loading} />
      <OnboardingHeader
        title="Agora, escolha a melhor descrição do seu projeto..."
        subtitle="Selecione o texto que melhor descreve a sua proposta de startup."
      />
      <div className="space-y-3">
        {state.generatedOptions.length === 0 && !loading && (
          <p className="text-center text-sm text-muted-foreground">
            Nenhuma descrição gerada ainda.
          </p>
        )}
        {state.generatedOptions.map((opt, i) => {
          const selected = state.chosenDescription === opt;
          return (
            <button
              key={i}
              type="button"
              onClick={() => patchState({ chosenDescription: opt })}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/15 text-primary"
                }`}
              >
                {i + 1}
              </span>
              <span className="text-sm">{opt}</span>
            </button>
          );
        })}
      </div>
      <OnboardingFooter
        onBack={onBack}
        onNext={handleNext}
        loading={loading}
        nextDisabled={!state.chosenDescription}
        extra={
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="min-w-[140px] rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
          >
            Gerar novamente
          </button>
        }
      />
    </>
  );
}

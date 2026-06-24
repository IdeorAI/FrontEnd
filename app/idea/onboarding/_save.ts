// app/idea/onboarding/_save.ts
// Spec 025 — save final do onboarding (slide 10) + transição para o dash (slide 11).
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { persistOnboardingPatch } from "./_persistence";
import type { OnboardingState } from "./_types";

/**
 * Hook do "Salvar" do slide 10:
 * 1) grava name + description (≤400) + current_phase='fase2';
 * 2) redireciona DIRETO ao dash do projeto criado (slide 11).
 *
 * Não cria task "Início": o card Início (etapa 0) do dash lê project.description
 * e já conta como concluído (completedStages inicia em [0]). A próxima etapa
 * pendente (faixa do slide 12) é derivada no dash como a primeira etapaN não-evaluated.
 */
export function useOnboardingSave(
  projectId: string,
  state: OnboardingState,
  setError: (msg: string | null) => void
) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    const name = state.name.trim();
    const description = (state.chosenDescription ?? state.idea).trim().slice(0, 400);
    if (!name) return setError("O nome do projeto é obrigatório.");
    if (!description) return setError("A descrição do projeto é obrigatória.");

    // Spec 028 — tags de contexto: normaliza (trim, dedup, máx. 10) e exige mín. 2
    // para garantir contexto suficiente para ancorar a LLM.
    const keywords = Array.from(
      new Set(state.keywords.map((t) => t.trim()).filter(Boolean)),
    ).slice(0, 10);
    if (keywords.length < 2) {
      return setError("Adicione ao menos 2 tags de contexto antes de criar o projeto.");
    }

    setSaving(true);
    setError(null);
    const { error } = await persistOnboardingPatch(projectId, {
      name,
      description,
      keywords,
      current_phase: "fase2",
    });
    if (error) {
      setSaving(false);
      return setError(error);
    }
    // Vai direto para o dash do projeto recém-criado (não para o /dashboard geral).
    router.replace(`/projeto/dash?project_id=${projectId}`);
  }, [projectId, state, setError, router]);

  return { save, saving };
}

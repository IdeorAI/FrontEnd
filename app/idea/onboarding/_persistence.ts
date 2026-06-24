// app/idea/onboarding/_persistence.ts
// Spec 025 — persistência incremental do onboarding em `projects`.
// Reusa as colunas existentes + creation_mode/business_type (Fase 1).

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";
import {
  CATEGORY_UNDEFINED,
  initialOnboardingState,
  type OnboardingState,
} from "./_types";

type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

/**
 * Persiste um patch parcial do estado nas colunas de `projects`.
 * `category` traduz o sentinela "nao-sei" → null (o CHECK só aceita os 12 values ou null).
 */
export async function persistOnboardingPatch(
  projectId: string,
  patch: ProjectUpdate
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", projectId);
  return { error: error?.message ?? null };
}

/** Converte a `category` da UI para o valor aceito pela coluna (sentinela → null). */
export function categoryForDb(category: string | null): string | null {
  if (!category || category === CATEGORY_UNDEFINED) return null;
  return category;
}

/** Lê o rascunho salvo e reidrata o estado (usado no mount / refresh / Voltar). */
export async function loadOnboardingDraft(
  projectId: string
): Promise<OnboardingState> {
  const supabase = createClient();
  const { data } = await supabase
    .from("projects")
    .select(
      "name, description, category, business_type, target_audience, region, constraints, generated_options, creation_mode, keywords"
    )
    .eq("id", projectId)
    .maybeSingle();

  if (!data) return { ...initialOnboardingState };

  return {
    ...initialOnboardingState,
    // A ideia bruta não persiste literal (CHECK ≤ 400). description guarda a versão final.
    chosenDescription: data.description ?? null,
    category: data.category ?? null,
    businessType: (data.business_type as OnboardingState["businessType"]) ?? null,
    targetAudience:
      (data.target_audience as OnboardingState["targetAudience"]) ?? null,
    region: data.region ?? "",
    constraints: data.constraints ?? "",
    generatedOptions: Array.isArray(data.generated_options)
      ? (data.generated_options as string[])
      : [],
    workMode: (data.creation_mode as OnboardingState["workMode"]) ?? null,
    name: data.name?.startsWith("Novo projeto") ? "" : data.name ?? "",
    keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
  };
}

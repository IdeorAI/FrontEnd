// app/idea/onboarding/_types.ts
// Spec 025 — estado e sequência condicional do onboarding (Fase 1).

/** Como o usuário quer que o Ideor trate a ideia (slide 2). */
export type IdeaApproach =
  | "keep" // 1 - manter a ideia exatamente como está → pula slide 8
  | "improve" // 2 - manter a ideia, melhorar a escrita → slide 8 (variação mínima)
  | "suggest"; // 3 - gerar outras sugestões a partir da ideia → slide 8 (amplo)

/** Modo de trabalho (slide 9) → grava projects.creation_mode. */
export type WorkMode = "ai" | "manual"; // Assistido | Colaborativo

/** Tipo de negócio (slide 4) → projects.business_type. */
export type BusinessType =
  | "startup-digital"
  | "negocio-local"
  | "ecommerce"
  | "produto-fisico-marca"
  | "negocio-hibrido"
  | "nao-sei";

/** Cliente principal (slide 5) → projects.target_audience (valores do CHECK). */
export type TargetAudience =
  | "B2B (empresas/organizações)"
  | "B2C (consumidores finais)"
  | "Híbrido (B2B2C)"
  | "Governo (B2G)"
  | "Não sei/prefiro não definir";

/** Sentinela para "Não sei / Quero que o Ideor defina" em category. */
export const CATEGORY_UNDEFINED = "nao-sei" as const;

/** Estado acumulado do onboarding. */
export interface OnboardingState {
  /** slide 1 — texto da ideia (vazio quando noIdea=true). */
  idea: string;
  /** slide 1 — "Ainda não tenho uma ideia". */
  noIdea: boolean;
  /** slide 2 — como seguir. */
  approach: IdeaApproach | null;
  /** slide 3 — área (value das 12 categorias) ou CATEGORY_UNDEFINED. */
  category: string | null;
  /** slide 4 — tipo de negócio. */
  businessType: BusinessType | null;
  /** slide 5 — cliente principal. */
  targetAudience: TargetAudience | null;
  /** slide 6 — país/região (texto livre). */
  region: string;
  /** slide 7 — restrição (texto livre, ≤ 500). */
  constraints: string;
  /** slide 8 — descrição final escolhida (também alimenta description). */
  chosenDescription: string | null;
  /** slide 8 — opções geradas pela IA (cache para "Voltar"). */
  generatedOptions: string[];
  /** slide 9 — modo de trabalho. */
  workMode: WorkMode | null;
  /** slide 10 — nome do projeto. */
  name: string;
}

export const initialOnboardingState: OnboardingState = {
  idea: "",
  noIdea: false,
  approach: null,
  category: null,
  businessType: null,
  targetAudience: null,
  region: "",
  constraints: "",
  chosenDescription: null,
  generatedOptions: [],
  workMode: null,
  name: "",
};

/** Identificadores estáveis de cada passo (independem da posição na sequência). */
export type StepId =
  | "idea" // slide 1
  | "approach" // slide 2
  | "area" // slide 3
  | "businessType" // slide 4
  | "audience" // slide 5
  | "region" // slide 6
  | "constraints" // slide 7
  | "describe" // slide 8 (condicional)
  | "workMode" // slide 9
  | "review"; // slide 10

/**
 * Sequência condicional de passos, derivada do estado.
 * - slide 8 ("describe") só aparece quando approach !== "keep".
 *   (Com noIdea=true, "keep" fica indisponível no slide 2, então approach
 *   será "improve"/"suggest" e o slide 8 sempre aparece — coerente com a spec.)
 */
export function buildStepSequence(state: OnboardingState): StepId[] {
  const steps: StepId[] = [
    "idea",
    "approach",
    "area",
    "businessType",
    "audience",
    "region",
    "constraints",
  ];
  if (state.approach !== "keep") {
    steps.push("describe");
  }
  steps.push("workMode", "review");
  return steps;
}

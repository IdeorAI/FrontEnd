// app/idea/onboarding/steps.tsx
// Spec 025 — componentes de cada passo declarativo do onboarding (slides 1-7, 9, 10).
// O slide 8 (descrições geradas) vive em describe-step.tsx (Fase 4).
"use client";

import { useState, useEffect, useRef } from "react";
import { KeywordsBlock } from "@/components/projeto/keywords-block";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Sparkles, Loader2 } from "lucide-react";
import categories from "@/lib/data/categories.json";
import { streamChat } from "@/lib/api/chat";
import { toast } from "sonner";

import type { StepProps } from "./page";
import { OnboardingHeader, OnboardingFooter } from "./_components";
import { persistOnboardingPatch, categoryForDb } from "./_persistence";
import { firstNameOf } from "./_helpers";
import {
  CATEGORY_UNDEFINED,
  type BusinessType,
  type IdeaApproach,
  type TargetAudience,
  type WorkMode,
} from "./_types";

const cats = categories as { value: string; label: string; description?: string }[];

// ─── Slide 1 — Descreva a startup ──────────────────────────────────────────────
export function IdeaStep({ state, patchState, onBack, onNext, user }: StepProps) {
  const name = firstNameOf(user);
  const canContinue = state.noIdea || state.idea.trim().length > 0;

  return (
    <>
      <OnboardingHeader
        title={`Ei, ${name}. Descreva a startup que deseja criar...`}
      />
      <Textarea
        value={state.idea}
        onChange={(e) => patchState({ idea: e.target.value })}
        disabled={state.noIdea}
        rows={5}
        placeholder="Ex: Quero criar uma plataforma que une criadores de porcos domésticos."
        className="resize-none rounded-2xl text-base"
      />
      <label className="mt-4 flex items-center justify-center gap-2 text-sm">
        <Checkbox
          checked={state.noIdea}
          onCheckedChange={(v) =>
            patchState({ noIdea: v === true, ...(v === true ? { idea: "" } : {}) })
          }
        />
        <span>
          <strong>Ainda não tenho uma ideia.</strong> Quero sugestões do Ideor.
        </span>
      </label>
      <OnboardingFooter
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!canContinue}
        nextLabel="Próxima etapa"
      />
    </>
  );
}

// ─── Slide 2 — Como deseja seguir? ─────────────────────────────────────────────
const APPROACH_OPTIONS: { value: IdeaApproach; label: string }[] = [
  { value: "keep", label: "Quero que o Ideor mantenha a ideia exatamente como está." },
  { value: "improve", label: "Desejo que o Ideor mantenha a ideia, mas melhore a escrita." },
  {
    value: "suggest",
    label: "Baseado na minha ideia inicial, quero que o Ideor me dê outras sugestões.",
  },
];

export function ApproachStep({ state, patchState, onBack, onNext }: StepProps) {
  return (
    <>
      {!state.noIdea && state.idea.trim() && (
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            Sobre a sua ideia de startup:
          </p>
          <p className="mt-1 text-primary">{state.idea.trim()}</p>
        </div>
      )}
      <OnboardingHeader title="Como deseja seguir?" />
      <div className="space-y-3">
        {APPROACH_OPTIONS.map((opt, i) => {
          // "Manter exatamente" fica indisponível quando o usuário não tem ideia.
          const disabled = opt.value === "keep" && state.noIdea;
          const selected = state.approach === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => patchState({ approach: opt.value })}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40"
              } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
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
              <span className="text-sm">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <OnboardingFooter
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!state.approach}
      />
    </>
  );
}

// ─── Slide 3 — Qual a área do seu projeto? (12 categorias) ──────────────────────
export function AreaStep({ state, patchState, onBack, onNext, projectId, setError }: StepProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Sem ideia: "Não sei" não vale — exige escolher a área (combobox sempre visível).
  const undefinedChecked = !state.noIdea && state.category === CATEGORY_UNDEFINED;
  const selectedLabel = cats.find((c) => c.value === state.category)?.label;

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    const { error } = await persistOnboardingPatch(projectId, {
      category: categoryForDb(state.category),
    });
    setSaving(false);
    if (error) return setError(error);
    onNext();
  };

  return (
    <>
      <OnboardingHeader title="Qual a área do seu projeto?" />
      {/* "Não sei" indisponível quando o usuário não tem ideia: a IA precisa
          da área para sugerir do zero (Spec 025 update 150626). */}
      {!state.noIdea && (
        <label className="mb-5 flex items-center justify-center gap-2 text-sm">
          <Checkbox
            checked={undefinedChecked}
            onCheckedChange={(v) =>
              patchState({ category: v === true ? CATEGORY_UNDEFINED : null })
            }
          />
          <span>
            <strong>Não sei /</strong> Quero que o Ideor defina
          </span>
        </label>
      )}
      {!undefinedChecked && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between rounded-xl"
            >
              {selectedLabel ?? "Selecione uma categoria..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar categoria..." />
              <CommandList>
                <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                <CommandGroup>
                  {cats.map((c) => (
                    <CommandItem
                      key={c.value}
                      value={c.label}
                      onSelect={() => {
                        patchState({ category: c.value });
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          state.category === c.value ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <div className="flex flex-col">
                        <span>{c.label}</span>
                        {c.description && (
                          <span className="text-xs text-muted-foreground">
                            {c.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      <OnboardingFooter
        onBack={onBack}
        onNext={handleNext}
        loading={saving}
        nextDisabled={
          // Sem ideia exige uma área REAL (não o sentinela "Não sei").
          !state.category || (state.noIdea && state.category === CATEGORY_UNDEFINED)
        }
      />
    </>
  );
}

// ─── Slide 4 — Tipo de negócio (5 + não sei) ───────────────────────────────────
const BUSINESS_TYPES: { value: BusinessType; label: string; desc: string }[] = [
  {
    value: "startup-digital",
    label: "Startup Digital",
    desc: "Apps, SaaS, plataformas online, marketplaces, IA, fintechs, edtechs, healthtechs, comunidades digitais, APIs e negócios escaláveis com forte componente tecnológico.",
  },
  {
    value: "negocio-local",
    label: "Negócio Local",
    desc: "Lojas físicas, restaurantes, clínicas, academias, salões, escolas presenciais, franquias, hotéis e negócios com operação predominantemente presencial.",
  },
  {
    value: "ecommerce",
    label: "E-commerce",
    desc: "Lojas virtuais, dropshipping, venda online de produtos físicos, marcas D2C, produtos artesanais, assinaturas e comércio eletrônico em geral.",
  },
  {
    value: "produto-fisico-marca",
    label: "Produto Físico ou Marca",
    desc: "Marcas próprias, cosméticos, alimentos e bebidas, suplementos, moda, eletrônicos, equipamentos, manufatura leve e desenvolvimento de produtos físicos.",
  },
  {
    value: "negocio-hibrido",
    label: "Negócio Híbrido",
    desc: "Modelos que combinam operação física e digital: clínicas com plataforma, academias com app, restaurantes com delivery, comunidades pagas com eventos presenciais.",
  },
];

export function BusinessTypeStep({ state, patchState, onBack, onNext, projectId, setError }: StepProps) {
  const [saving, setSaving] = useState(false);
  // Sem ideia: "Não sei" não vale — exige escolher o tipo de negócio.
  const undefinedChecked = !state.noIdea && state.businessType === "nao-sei";

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    const { error } = await persistOnboardingPatch(projectId, {
      business_type: state.businessType,
    });
    setSaving(false);
    if (error) return setError(error);
    onNext();
  };

  return (
    <>
      <OnboardingHeader title="Que categoria melhor representa seu negócio?" />
      {/* "Não sei" indisponível quando o usuário não tem ideia (Spec 025 update 150626). */}
      {!state.noIdea && (
        <label className="mb-5 flex items-center justify-center gap-2 text-sm">
          <Checkbox
            checked={undefinedChecked}
            onCheckedChange={(v) =>
              patchState({ businessType: v === true ? "nao-sei" : null })
            }
          />
          <span>
            <strong>Não sei /</strong> Quero que o Ideor defina
          </span>
        </label>
      )}
      {!undefinedChecked && (
        <div className="space-y-3">
          {BUSINESS_TYPES.map((t) => {
            const selected = state.businessType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => patchState({ businessType: t.value })}
                className={`block w-full rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <p className="font-semibold">{t.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              </button>
            );
          })}
        </div>
      )}
      <OnboardingFooter
        onBack={onBack}
        onNext={handleNext}
        loading={saving}
        nextDisabled={
          !state.businessType || (state.noIdea && state.businessType === "nao-sei")
        }
      />
    </>
  );
}

// ─── Slide 5 — Cliente principal (B2B/B2C/B2B2C/B2G + não sei) ──────────────────
const AUDIENCES: { value: TargetAudience; label: string }[] = [
  { value: "B2B (empresas/organizações)", label: "Empresas e organizações (B2B)" },
  { value: "B2C (consumidores finais)", label: "Consumidores finais (B2C)" },
  { value: "Híbrido (B2B2C)", label: "Empresas e consumidores (B2B2C)" },
  { value: "Governo (B2G)", label: "Governo (B2G)" },
];

export function AudienceStep({ state, patchState, onBack, onNext, projectId, setError }: StepProps) {
  const [saving, setSaving] = useState(false);
  const undefinedChecked = state.targetAudience === "Não sei/prefiro não definir";

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    const { error } = await persistOnboardingPatch(projectId, {
      target_audience: state.targetAudience,
    });
    setSaving(false);
    if (error) return setError(error);
    onNext();
  };

  return (
    <>
      <OnboardingHeader title="Quem será o principal cliente deste projeto?" />
      <label className="mb-5 flex items-center justify-center gap-2 text-sm">
        <Checkbox
          checked={undefinedChecked}
          onCheckedChange={(v) =>
            patchState({
              targetAudience: v === true ? "Não sei/prefiro não definir" : null,
            })
          }
        />
        <span>
          <strong>Não sei /</strong> Quero que o Ideor defina
        </span>
      </label>
      {!undefinedChecked && (
        <div className="space-y-3">
          {AUDIENCES.map((a) => {
            const selected = state.targetAudience === a.value;
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => patchState({ targetAudience: a.value })}
                className={`block w-full rounded-2xl border p-4 text-left font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      )}
      <OnboardingFooter
        onBack={onBack}
        onNext={handleNext}
        loading={saving}
        nextDisabled={!state.targetAudience}
      />
    </>
  );
}

// ─── Slide 6 — País / região (select com busca) ────────────────────────────────
// Lista de mercados-alvo. O valor gravado em projects.region é a própria string
// (sem CHECK no banco). Inclui agregados regionais + principais países.
const REGION_OPTIONS: string[] = [
  "Brasil",
  "América Latina",
  "América do Norte",
  "Europa",
  "África",
  "Ásia",
  "Oriente Médio",
  "Oceania",
  "Global (vários países)",
  "Argentina",
  "Bolívia",
  "Chile",
  "Colômbia",
  "Equador",
  "Paraguai",
  "Peru",
  "Uruguai",
  "Venezuela",
  "México",
  "Estados Unidos",
  "Canadá",
  "Portugal",
  "Espanha",
  "França",
  "Reino Unido",
  "Alemanha",
  "Itália",
  "China",
  "Japão",
  "Índia",
  "Angola",
  "Moçambique",
];

export function RegionStep({ state, patchState, onBack, onNext, projectId, setError }: StepProps) {
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    const { error } = await persistOnboardingPatch(projectId, {
      region: state.region.trim() || null,
    });
    setSaving(false);
    if (error) return setError(error);
    onNext();
  };

  return (
    <>
      <OnboardingHeader title="Em qual país ou região você pretende iniciar a operação?" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between rounded-xl"
          >
            {state.region || "Selecione o país ou região..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          sideOffset={6}
          collisionPadding={16}
          avoidCollisions
        >
          <Command>
            <CommandInput placeholder="Buscar país ou região..." />
            {/* max-h limita a altura e habilita rolagem — sem isso a lista abria
                alta e o topo (Brasil) ficava cortado atrás do header. */}
            <CommandList className="max-h-[240px] overflow-y-auto">
              <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
              <CommandGroup>
                {REGION_OPTIONS.map((r) => (
                  <CommandItem
                    key={r}
                    value={r}
                    onSelect={() => {
                      patchState({ region: r });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        state.region === r ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {r}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <OnboardingFooter
        onBack={onBack}
        onNext={handleNext}
        loading={saving}
        nextDisabled={!state.region.trim()}
      />
    </>
  );
}

// ─── Slide 7 — Restrição específica ────────────────────────────────────────────
const CONSTRAINTS_MAX = 500;
export function ConstraintsStep({ state, patchState, onBack, onNext, projectId, setError }: StepProps) {
  const [saving, setSaving] = useState(false);
  const handleNext = async () => {
    setSaving(true);
    setError(null);
    const { error } = await persistOnboardingPatch(projectId, {
      constraints: state.constraints.trim() || null,
    });
    setSaving(false);
    if (error) return setError(error);
    onNext();
  };
  return (
    <>
      <OnboardingHeader title="Existe alguma restrição específica?" />
      <Textarea
        value={state.constraints}
        onChange={(e) =>
          patchState({ constraints: e.target.value.slice(0, CONSTRAINTS_MAX) })
        }
        rows={4}
        placeholder="Ex: Orçamento inicial de R$ 5.000, prazo de 3 meses, regulamentações específicas..."
        className="resize-none rounded-2xl"
      />
      <p className="mt-1 text-right text-xs text-muted-foreground">
        {state.constraints.length}/{CONSTRAINTS_MAX} caracteres
      </p>
      <OnboardingFooter onBack={onBack} onNext={handleNext} loading={saving} />
    </>
  );
}

// ─── Slide 9 — Modo de trabalho (Assistido / Colaborativo) ──────────────────────
const WORK_MODES: {
  value: WorkMode;
  title: string;
  desc: string;
  note: string;
}[] = [
  {
    value: "ai",
    title: "O Ideor desenvolve comigo (Modo Assistido)",
    desc: "O Ideor sugere, estrutura e produz os conteúdos de cada etapa para minha aprovação e ajustes.",
    note: "Ideal para quem deseja mais velocidade, orientação e apoio durante a construção do projeto.",
  },
  {
    value: "manual",
    title: "Eu desenvolvo e o Ideor apoia (Modo Colaborativo)",
    desc: "Eu preencho as informações e utilizo o Ideor para revisar, complementar e sugerir melhorias quando necessário.",
    note: "Ideal para quem já possui experiência, um projeto mais maduro ou deseja maior controle sobre o conteúdo.",
  },
];

export function WorkModeStep({ state, patchState, onBack, onNext, projectId, setError }: StepProps) {
  const [saving, setSaving] = useState(false);
  const handleNext = async () => {
    if (!state.workMode) return;
    setSaving(true);
    setError(null);
    const { error } = await persistOnboardingPatch(projectId, {
      creation_mode: state.workMode,
    });
    setSaving(false);
    if (error) return setError(error);
    onNext();
  };
  return (
    <>
      <OnboardingHeader title="Como você deseja trabalhar com o Ideor?" />
      <div className="space-y-3">
        {WORK_MODES.map((m, i) => {
          const selected = state.workMode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => patchState({ workMode: m.value })}
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
              <span>
                <span className="block font-semibold">{m.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {m.desc}
                </span>
                <span className="mt-1 block text-xs italic text-muted-foreground">
                  ({m.note})
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <OnboardingFooter
        onBack={onBack}
        onNext={handleNext}
        loading={saving}
        nextDisabled={!state.workMode}
      />
    </>
  );
}

// ─── Slide 10 — Revisão final ──────────────────────────────────────────────────
// O onSave real (gravar nome + fase2 + Início + redirect) entra na Fase 5.
export function ReviewStep({
  state,
  patchState,
  onBack,
  projectId,
  onSave,
  saving,
}: StepProps & { onSave: () => void; saving: boolean }) {
  const [suggesting, setSuggesting] = useState(false);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const tagsAutoTried = useRef(false);
  const NAME_MAX = 100;
  const TAGS_MIN = 2;
  const TAGS_MAX = 10;
  const categoryLabel =
    state.category === CATEGORY_UNDEFINED
      ? "A definir pelo Ideor"
      : cats.find((c) => c.value === state.category)?.label ?? "—";
  const description = state.chosenDescription ?? state.idea;

  // Spec 028 — sugere de 5 a 10 tags de contexto via streamChat (mesma infra do nome).
  // Idioma pt-BR no topo do prompt + descrição truncada (evita 400 e idioma errado).
  const TAGS_SUGGEST_MIN = 5;

  const requestTags = async (): Promise<string[]> => {
    // O /api/chat rejeita message > 500 chars (400). Mantemos o texto-base enxuto
    // e truncamos descrição+categoria para o total caber com folga.
    const descForPrompt = description.slice(0, 160);
    const catForPrompt = categoryLabel.slice(0, 40);
    const prompt = `Responda em pt-BR. Liste ${TAGS_SUGGEST_MIN} a ${TAGS_MAX} palavras-chave curtas (1-3 palavras) que resumem este projeto, separadas por vírgula. Mínimo ${TAGS_SUGGEST_MIN}. Só as palavras-chave, sem numeração.\n\nDescrição: ${descForPrompt}\nCategoria: ${catForPrompt}`;
    let full = "";
    for await (const ev of streamChat(prompt, [], { mode: "guide", projectId })) {
      if (typeof ev === "string") full += ev;
    }
    return Array.from(
      new Set(
        full
          .split(/[,\n;•|]+/)
          .map((t) => t.replace(/^[\d.\-)\s]+/, "").trim())
          .filter((t) => t.length > 0 && t.length <= 40),
      ),
    ).slice(0, TAGS_MAX);
  };

  const suggestTags = async () => {
    if (!description || suggestingTags) return;
    setSuggestingTags(true);
    try {
      let parsed = await requestTags();
      // Garante o mínimo de 5: se a 1ª resposta vier curta, tenta mais uma vez e
      // mescla os resultados (dedup) — sem laço infinito (no máx. 2 tentativas).
      if (parsed.length < TAGS_SUGGEST_MIN) {
        const retry = await requestTags();
        parsed = Array.from(new Set([...parsed, ...retry])).slice(0, TAGS_MAX);
      }
      if (parsed.length === 0) {
        toast.error("Não consegui sugerir tags agora. Adicione manualmente.");
      } else {
        patchState({ keywords: parsed });
        if (parsed.length < TAGS_SUGGEST_MIN) {
          toast.info(`Sugeri ${parsed.length} tags. Você pode adicionar mais para um contexto melhor.`);
        }
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Falha ao sugerir tags. Adicione manualmente.",
      );
    } finally {
      setSuggestingTags(false);
    }
  };

  // Auto-sugestão na 1ª vez que a tela aparece sem tags. Depende de `description`
  // para não disparar com texto vazio/desatualizado no 1º render (o guard
  // tagsAutoTried garante que roda só UMA vez, mesmo com a descrição mudando).
  useEffect(() => {
    if (tagsAutoTried.current) return;
    if (state.keywords.length === 0 && description) {
      tagsAutoTried.current = true;
      void suggestTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  const handleSuggestName = async () => {
    if (!description || suggesting) return;
    setSuggesting(true);
    patchState({ name: "" });
    try {
      // O endpoint /api/chat rejeita message > 500 chars (400). A descrição pode
      // ser longa (≤400) e o texto-base já tem ~230 chars, então truncamos a
      // descrição para o prompt total caber no limite.
      const descForPrompt = description.slice(0, 220);
      const prompt = `Sugira um nome criativo, curto e memorável (máx. 5 palavras) para este projeto de startup. Responda APENAS com o nome, sem explicações, aspas ou pontuação final.\n\nDescrição: ${descForPrompt}\nCategoria: ${categoryLabel}`;
      let full = "";
      for await (const ev of streamChat(prompt, [], {
        mode: "guide",
        projectId,
      })) {
        // streamChat pode emitir objetos (diff/erro) além de strings (deltas):
        // só concatenamos os deltas de texto.
        if (typeof ev === "string") {
          full += ev;
          patchState({ name: full.trim().slice(0, NAME_MAX) });
        }
      }
      if (!full.trim()) {
        toast.error("Não consegui sugerir um nome agora. Digite manualmente.");
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Falha ao sugerir nome. Digite manualmente."
      );
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <>
      <OnboardingHeader
        title="Revise seu projeto antes de criar"
        subtitle="Você poderá alterar tudo isso depois."
      />
      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-semibold">
            Dê um nome ao seu projeto
          </label>
          <div className="flex gap-2">
            <Input
              value={state.name}
              maxLength={NAME_MAX}
              onChange={(e) => patchState({ name: e.target.value })}
              placeholder="Digite o nome do projeto"
              className="rounded-xl"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSuggestName}
              disabled={suggesting || !description}
              aria-label="Sugerir nome com IA"
              className="rounded-xl"
            >
              {suggesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {state.name.length}/{NAME_MAX}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Descrição</label>
          <Textarea
            value={description}
            onChange={(e) =>
              patchState({ chosenDescription: e.target.value.slice(0, 400) })
            }
            rows={4}
            className="resize-none rounded-xl"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {description.length}/400
          </p>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-semibold">
              Tags de contexto
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={suggestTags}
              disabled={suggestingTags || !description}
              className="h-7 gap-1.5 text-xs"
            >
              {suggestingTags ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Sugerir com IA
            </Button>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Exclua ou adicione palavras- chave para manter o IdeorAI focado em sua ideia. ({TAGS_MIN} a {TAGS_MAX}).
          </p>
          <KeywordsBlock
            keywords={state.keywords}
            onKeywordsChange={(next) => patchState({ keywords: next.slice(0, TAGS_MAX) })}
            max={TAGS_MAX}
          />
          {state.keywords.length < TAGS_MIN && !suggestingTags && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Adicione ao menos {TAGS_MIN} tags para criar o projeto.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">
            Categoria selecionada
          </label>
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
            {categoryLabel}
          </div>
        </div>
      </div>
      <OnboardingFooter
        onBack={onBack}
        onNext={onSave}
        loading={saving}
        nextLabel="Salvar"
        nextDisabled={
          !state.name.trim() ||
          !description.trim() ||
          state.keywords.length < TAGS_MIN
        }
      />
    </>
  );
}

// app/idea/onboarding/steps.tsx
// Spec 025 — componentes de cada passo declarativo do onboarding (slides 1-7, 9, 10).
// O slide 8 (descrições geradas) vive em describe-step.tsx (Fase 4).
"use client";

import { useState } from "react";
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
import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import categories from "@/lib/data/categories.json";
import { streamChat } from "@/lib/api/chat";

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
  const undefinedChecked = state.category === CATEGORY_UNDEFINED;
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
        nextDisabled={!state.category}
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
  const undefinedChecked = state.businessType === "nao-sei";

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
        nextDisabled={!state.businessType}
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

// ─── Slide 6 — País / região ───────────────────────────────────────────────────
const REGION_MAX = 100;
export function RegionStep({ state, patchState, onBack, onNext, projectId, setError }: StepProps) {
  const [saving, setSaving] = useState(false);
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
      <Textarea
        value={state.region}
        onChange={(e) => patchState({ region: e.target.value.slice(0, REGION_MAX) })}
        rows={3}
        placeholder="Ex: Brasil, América Latina, Europa..."
        className="resize-none rounded-2xl"
      />
      <p className="mt-1 text-right text-xs text-muted-foreground">
        {state.region.length}/{REGION_MAX}
      </p>
      <OnboardingFooter onBack={onBack} onNext={handleNext} loading={saving} />
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
  onSave,
  saving,
}: StepProps & { onSave: () => void; saving: boolean }) {
  const [suggesting, setSuggesting] = useState(false);
  const NAME_MAX = 100;
  const categoryLabel =
    state.category === CATEGORY_UNDEFINED
      ? "A definir pelo Ideor"
      : cats.find((c) => c.value === state.category)?.label ?? "—";
  const description = state.chosenDescription ?? state.idea;

  const handleSuggestName = async () => {
    if (!description || suggesting) return;
    setSuggesting(true);
    patchState({ name: "" });
    try {
      const prompt = `Com base na descrição a seguir, sugira um nome criativo, curto e memorável (máx. 5 palavras) para este projeto de startup. Responda APENAS com o nome, sem explicações, sem aspas, sem pontuação final.\n\nDescrição: ${description}\nCategoria: ${categoryLabel}`;
      let full = "";
      for await (const delta of streamChat(prompt, [], { mode: "guide" })) {
        full += delta;
        patchState({ name: full.trim().slice(0, NAME_MAX) });
      }
    } catch {
      // silencioso — usuário pode digitar manualmente
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
              <Sparkles className="h-4 w-4" />
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
        nextDisabled={!state.name.trim() || !description.trim()}
      />
    </>
  );
}

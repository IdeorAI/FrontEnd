# Onboarding Experience — Plano de Implementação

> **Para Claude:** SUB-SKILL OBRIGATÓRIO: Use superpowers:executing-plans para implementar este plano tarefa por tarefa.

**Goal:** Implementar o fluxo de onboarding P0 do IdeorAI: Welcome Flow (RF-01), Progress Checklist (RF-03) e Tooltips Contextuais (RF-04).

**Architecture:** Fluxo de 3 telas: (1) Welcome Flow em `/onboarding` exibido apenas na primeira sessão, controlado pelo flag `onboarding_completed` na tabela `profiles` do Supabase; (2) Checklist lateral no dashboard ao criar o primeiro projeto; (3) Tooltips de primeira vez no Etapa 1 com flags por tooltip em `seen_tooltips` JSONB no perfil.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui (RadioGroup, Tooltip, Sheet), Supabase Auth + PostgreSQL, Server Actions.

**Escopo — O QUE NÃO IMPLEMENTAR:**
- RF-02 (Projeto Demo automático) — COMENTADO NO PRD, deixar para depois
- RF-05 a RF-11 (P1/P2) — COMENTADOS NO PRD, deixar para depois

---

## Pré-requisito: Corrigir bug Hero (bloqueia deploy no Vercel)

**Arquivo:** `app/page.tsx`

**Problema:** `Module not found: Can't resolve '@/components/Hero'`

**Passo 1: Verificar o import quebrado**

```bash
grep -n "Hero" FrontEnd/ideor/app/page.tsx
```

**Passo 2: Corrigir o import**

Procurar no arquivo `app/page.tsx` o import `@/components/Hero` e verificar se:
- O componente existe com nome diferente (ex: `hero.tsx`, `HeroSection.tsx`)
- Ou se foi removido e o import deve ser deletado

**Passo 3: Build local**

```bash
cd FrontEnd/ideor
npm run build
```
Esperado: Build sem erros.

**Passo 4: Commit**

```bash
git add app/page.tsx
git commit -m "fix: corrige import Hero quebrado que bloqueia build no Vercel"
```

---

## Task 1: Migração do Banco de Dados (Supabase)

**Arquivos:**
- Criar: `supabase/migrations/20260311_onboarding_fields.sql`

**Contexto:** A tabela `profiles` já existe no Supabase (criada pelo trigger de auth). Precisa adicionar 3 colunas para suportar o onboarding.

**Passo 1: Criar o arquivo de migração**

```sql
-- supabase/migrations/20260311_onboarding_fields.sql

-- Flag para saber se o usuário já completou o onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Respostas do Welcome Flow (3 perguntas)
-- Formato: { "has_idea": "sim_especifica" | "algumas_ideias" | "descobrindo",
--            "objetivo": "saber_valor" | "primeiros_clientes" | "pitch",
--            "socios": "solo" | "com_socios" }
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_answers jsonb;

-- Tooltips já vistos pelo usuário
-- Formato: { "ideia_descricao": true, "gerar_button": true, "veredito": true }
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS seen_tooltips jsonb NOT NULL DEFAULT '{}';
```

**Passo 2: Executar no Supabase Dashboard**

Ir em SQL Editor no painel do Supabase e executar o SQL acima. Verificar que as 3 colunas aparecem na tabela `profiles`.

**Passo 3: Commit**

```bash
git add supabase/migrations/20260311_onboarding_fields.sql
git commit -m "feat: adiciona colunas de onboarding na tabela profiles"
```

---

## Task 2: Server Action para Salvar Onboarding (RF-01)

**Arquivos:**
- Criar: `app/onboarding/actions.ts`

**Contexto:** Server Action que recebe as respostas das 3 perguntas, salva no perfil e marca `onboarding_completed = true`. Next.js 14 App Router usa `"use server"` para Server Actions.

**Passo 1: Criar o arquivo de actions**

```typescript
// app/onboarding/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface OnboardingAnswers {
  has_idea: "sim_especifica" | "algumas_ideias" | "descobrindo";
  objetivo: "saber_valor" | "primeiros_clientes" | "pitch";
  socios: "solo" | "com_socios";
}

export async function completeOnboarding(answers: OnboardingAnswers) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      onboarding_answers: answers,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Erro ao salvar onboarding:", error);
    throw new Error("Falha ao salvar configurações");
  }

  redirect("/dashboard");
}
```

**Passo 2: Verificar que `createClient` de `@/lib/supabase/server` está configurado corretamente**

```bash
cat FrontEnd/ideor/lib/supabase/server.ts
```

Deve exportar `createClient` com cookies do Next.js. Se não existir, criar seguindo o padrão do projeto.

**Passo 3: Commit**

```bash
git add app/onboarding/actions.ts
git commit -m "feat: server action para completar onboarding e salvar respostas"
```

---

## Task 3: Página do Welcome Flow (RF-01)

**Arquivos:**
- Criar: `app/onboarding/page.tsx`
- Criar: `app/onboarding/welcome-form.tsx`

**Contexto:** A página `/onboarding` é um Server Component que verifica se o usuário já completou o onboarding (redirect para dashboard se sim). O formulário é um Client Component separado que usa `useTransition` para chamar a Server Action.

**Passo 1: Criar o Client Component do formulário**

```typescript
// app/onboarding/welcome-form.tsx
"use client";

import { useTransition, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "./actions";

const perguntas = [
  {
    id: "has_idea",
    texto: "Você já tem uma ideia clara de negócio?",
    opcoes: [
      { valor: "sim_especifica", label: "Sim, tenho uma ideia específica" },
      { valor: "algumas_ideias", label: "Tenho algumas ideias" },
      { valor: "descobrindo", label: "Ainda estou descobrindo" },
    ],
  },
  {
    id: "objetivo",
    texto: "Qual é o seu objetivo com o IdeorAI?",
    opcoes: [
      { valor: "saber_valor", label: "Saber se minha ideia vale a pena" },
      { valor: "primeiros_clientes", label: "Conseguir meus primeiros clientes" },
      { valor: "pitch", label: "Preparar um pitch para investidores" },
    ],
  },
  {
    id: "socios",
    texto: "Você tem sócios ou está solo?",
    opcoes: [
      { valor: "solo", label: "Solo por enquanto" },
      { valor: "com_socios", label: "Tenho um ou mais sócios" },
    ],
  },
];

export function WelcomeForm() {
  const [isPending, startTransition] = useTransition();
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const todasRespondidas = perguntas.every((p) => respostas[p.id]);

  function handleSubmit() {
    if (!todasRespondidas) {
      setErroGeral("Por favor, responda todas as perguntas.");
      return;
    }
    setErroGeral(null);
    startTransition(async () => {
      await completeOnboarding(respostas as Parameters<typeof completeOnboarding>[0]);
    });
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">Configuração rápida</p>
        <p className="text-xs text-muted-foreground">Leva menos de 1 minuto</p>
      </div>

      {perguntas.map((pergunta, index) => (
        <div key={pergunta.id} className="space-y-3">
          <p className="font-medium text-sm">
            {index + 1}. {pergunta.texto}
          </p>
          <RadioGroup
            value={respostas[pergunta.id] || ""}
            onValueChange={(valor) =>
              setRespostas((prev) => ({ ...prev, [pergunta.id]: valor }))
            }
          >
            {pergunta.opcoes.map((opcao) => (
              <div key={opcao.valor} className="flex items-center space-x-2">
                <RadioGroupItem value={opcao.valor} id={`${pergunta.id}-${opcao.valor}`} />
                <Label htmlFor={`${pergunta.id}-${opcao.valor}`} className="cursor-pointer">
                  {opcao.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}

      {erroGeral && (
        <p className="text-sm text-red-500">{erroGeral}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-[#8c7dff] hover:bg-[#7c6def]"
      >
        {isPending ? "Salvando..." : "Começar →"}
      </Button>
    </div>
  );
}
```

**Passo 2: Criar a página Server Component**

```typescript
// app/onboarding/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WelcomeForm } from "./welcome-form";

export const metadata = {
  title: "Bem-vindo ao IdeorAI",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Se já completou o onboarding, vai direto para o dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Bem-vindo ao IdeorAI</h1>
          <p className="text-muted-foreground text-sm">
            Antes de começar, conta pra gente um pouco sobre você.
          </p>
        </div>
        <WelcomeForm />
      </div>
    </div>
  );
}
```

**Passo 3: Testar manualmente**

- Acessar `/onboarding` sem estar logado → deve redirecionar para `/auth/login`
- Logar e acessar `/onboarding` → deve mostrar as 3 perguntas
- Responder e clicar "Começar" → deve redirecionar para `/dashboard`
- Acessar `/onboarding` novamente → deve redirecionar para `/dashboard` (flag já marcado)

**Passo 4: Commit**

```bash
git add app/onboarding/page.tsx app/onboarding/welcome-form.tsx
git commit -m "feat(RF-01): página de onboarding com 3 perguntas de segmentação"
```

---

## Task 4: Redirecionar Novos Usuários para Onboarding (RF-01)

**Arquivos:**
- Modificar: `app/auth/callback/page.tsx`

**Contexto:** Atualmente o callback sempre redireciona para `/dashboard`. Precisamos checar se é novo usuário (onboarding não completado) e redirecionar para `/onboarding` nesses casos.

**Passo 1: Ler o arquivo atual**

```
app/auth/callback/page.tsx (linha 38)
// Linha atual:
router.replace("/dashboard");
```

**Passo 2: Modificar para checar perfil**

Substituir a linha `router.replace("/dashboard")` pelo bloco abaixo:

```typescript
// Verificar se é novo usuário (sem onboarding)
const supabase = createClient();
const { data: { user: currentUser } } = await supabase.auth.getUser();

if (currentUser) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", currentUser.id)
    .single();

  if (!profile?.onboarding_completed) {
    router.replace("/onboarding");
    return;
  }
}

router.replace("/dashboard");
```

O arquivo completo `doExchange` deve ficar assim:

```typescript
const doExchange = async () => {
  const code = searchParams.get("code");
  if (!code) {
    router.replace("/auth/login?error=missing_code");
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    router.replace(
      `/auth/login?error=${encodeURIComponent(error.message)}`
    );
    return;
  }

  // Checar se novo usuário precisa do onboarding
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (currentUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", currentUser.id)
      .single();

    if (!profile?.onboarding_completed) {
      router.replace("/onboarding");
      return;
    }
  }

  router.replace("/dashboard");
};
```

**Passo 3: Testar**

- Criar nova conta → deve ir para `/onboarding`
- Completar onboarding → deve ir para `/dashboard`
- Fazer logout e login novamente → deve ir direto para `/dashboard` (onboarding já feito)

**Passo 4: Commit**

```bash
git add app/auth/callback/page.tsx
git commit -m "feat(RF-01): redireciona novos usuários para /onboarding após cadastro"
```

---

## Task 5: Componente Progress Checklist (RF-03)

**Arquivos:**
- Criar: `components/progress-checklist.tsx`

**Contexto:** Card exibido no dashboard mostrando a jornada do usuário com os 2 primeiros itens já marcados (Endowed Progress Effect). Usa dados reais de tarefas do projeto para marcar os demais.

**Passo 1: Criar o componente**

```typescript
// components/progress-checklist.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ETAPAS_CHECKLIST = [
  { id: "conta", label: "Conta criada", fase: null },
  { id: "ideia", label: "Primeira ideia descrita", fase: null },
  { id: "mercado", label: "Entenda o potencial do seu mercado", fase: "fase2" },
  { id: "proposta", label: "Valide sua proposta de valor", fase: "fase3" },
  { id: "modelo", label: "Defina seu modelo de negócio", fase: "fase4" },
  { id: "mvp", label: "Construa seu MVP", fase: "fase5" },
  { id: "equipe", label: "Monte sua equipe", fase: "fase6" },
  { id: "pitch", label: "Crie seu Pitch Deck", fase: "fase7" },
];

interface ProgressChecklistProps {
  // Número de etapas concluídas no projeto principal do usuário
  // Os 2 primeiros (conta + ideia) sempre estão completos
  etapasConcluidas: number;
}

export function ProgressChecklist({ etapasConcluidas }: ProgressChecklistProps) {
  const [aberto, setAberto] = useState(true);

  // Índice da próxima etapa a ser completada (após as 2 fixas + etapasConcluidas reais)
  const totalConcluido = 2 + etapasConcluidas;
  const proximaIndex = Math.min(totalConcluido, ETAPAS_CHECKLIST.length - 1);

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Sua jornada</span>
          <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {totalConcluido}/{ETAPAS_CHECKLIST.length}
          </span>
        </div>
        {/* Botão colapsar em mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 md:hidden"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar checklist" : "Abrir checklist"}
        >
          {aberto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Lista */}
      <div className={`space-y-2 ${!aberto ? "hidden md:block" : ""}`}>
        {ETAPAS_CHECKLIST.map((etapa, index) => {
          const concluido = index < totalConcluido;
          const isProximo = index === proximaIndex && !concluido;

          return (
            <div
              key={etapa.id}
              className={`flex items-center gap-2 text-sm ${
                concluido
                  ? "text-muted-foreground line-through"
                  : isProximo
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {concluido ? (
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <Circle
                  className={`h-4 w-4 flex-shrink-0 ${
                    isProximo ? "text-primary" : "text-muted-foreground/50"
                  }`}
                />
              )}
              <span>{etapa.label}</span>
              {isProximo && (
                <ArrowRight className="h-3 w-3 text-primary ml-auto flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Passo 2: Commit**

```bash
git add components/progress-checklist.tsx
git commit -m "feat(RF-03): componente ProgressChecklist com endowed progress effect"
```

---

## Task 6: Integrar Checklist no Dashboard (RF-03)

**Arquivos:**
- Modificar: `app/dashboard/page.tsx`

**Contexto:** O dashboard já busca `tasks` de cada projeto. Queremos exibir o checklist quando o usuário tem pelo menos 1 projeto, usando as etapas concluídas do primeiro projeto.

**Passo 1: Ler o arquivo para entender onde inserir**

O arquivo `app/dashboard/page.tsx` já tem:
- Linha 168-170: cálculo de `completedTasks` baseado em tasks com status `evaluated`
- Linha 297: estado vazio quando `projects.length === 0`

**Passo 2: Adicionar o import**

No topo do arquivo, adicionar:
```typescript
import { ProgressChecklist } from "@/components/progress-checklist";
```

**Passo 3: Calcular etapas concluídas globais do usuário**

Após a query (linha 125), adicionar:

```typescript
// Etapas concluídas no primeiro projeto (para o checklist)
const primeiroProjetoTasks = projects?.[0]?.tasks ?? [];
const etapasConcluidas = Array.isArray(primeiroProjetoTasks)
  ? primeiroProjetoTasks.filter(
      (t: { status?: string }) => t.status === "evaluated"
    ).length
  : 0;
```

**Passo 4: Exibir o checklist acima dos cards**

Dentro do `return`, antes da `<div className="grid...">` dos cards, adicionar:

```tsx
{/* Progress Checklist — aparece quando há projetos */}
{(projects?.length ?? 0) > 0 && (
  <ProgressChecklist etapasConcluidas={etapasConcluidas} />
)}
```

**Passo 5: Verificar visualmente**

- Criar um projeto → checklist aparece com 2 itens marcados
- Completar uma etapa no projeto → terceiro item deve marcar

**Passo 6: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat(RF-03): exibe checklist de progresso no dashboard ao ter projetos"
```

---

## Task 7: Componente First-Time Tooltip (RF-04)

**Arquivos:**
- Criar: `components/first-time-tooltip.tsx`
- Criar: `lib/supabase/update-seen-tooltip.ts`

**Contexto:** Wrapper sobre o Tooltip do shadcn que:
1. Busca `seen_tooltips` do perfil do usuário (via props passadas do Server Component pai)
2. Se o tooltip já foi visto, não exibe
3. Ao fechar, chama Server Action para salvar o flag no perfil

**Passo 1: Server Action para marcar tooltip como visto**

```typescript
// lib/supabase/update-seen-tooltip.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function markTooltipSeen(tooltipKey: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Usa o operador jsonb || do Postgres para fazer merge sem sobrescrever outros tooltips
  await supabase.rpc("merge_seen_tooltip", {
    user_id: user.id,
    tooltip_key: tooltipKey,
  });
}
```

**Passo 2: Criar a função RPC no Supabase**

Executar no SQL Editor do Supabase:

```sql
-- Função para fazer merge seguro no JSONB seen_tooltips
CREATE OR REPLACE FUNCTION public.merge_seen_tooltip(user_id uuid, tooltip_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET seen_tooltips = seen_tooltips || jsonb_build_object(tooltip_key, true)
  WHERE id = user_id;
END;
$$;
```

**Passo 3: Criar o componente Client**

```typescript
// components/first-time-tooltip.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { markTooltipSeen } from "@/lib/supabase/update-seen-tooltip";

interface FirstTimeTooltipProps {
  // Chave única para este tooltip (ex: "ideia_descricao")
  tooltipKey: string;
  // Se true, o tooltip já foi visto (passado pelo Server Component pai)
  jaVisto: boolean;
  // Mensagem exibida no tooltip
  mensagem: string;
  children: React.ReactNode;
}

export function FirstTimeTooltip({
  tooltipKey,
  jaVisto,
  mensagem,
  children,
}: FirstTimeTooltipProps) {
  const [aberto, setAberto] = useState(false);
  const [descartado, setDescartado] = useState(jaVisto);

  // Abre automaticamente após 500ms na primeira visita (desktop only)
  useEffect(() => {
    if (descartado) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const timer = setTimeout(() => setAberto(true), 500);
    return () => clearTimeout(timer);
  }, [descartado]);

  function fechar() {
    setAberto(false);
    setDescartado(true);
    markTooltipSeen(tooltipKey);
  }

  if (descartado) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip open={aberto} onOpenChange={(open) => !open && fechar()}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-sm p-3 cursor-pointer"
          onClick={fechar}
        >
          <p>{mensagem}</p>
          <p className="text-xs text-muted-foreground mt-1">Clique para fechar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

**Passo 4: Commit**

```bash
git add components/first-time-tooltip.tsx lib/supabase/update-seen-tooltip.ts
git commit -m "feat(RF-04): componente FirstTimeTooltip com flag por usuário no Supabase"
```

---

## Task 8: Aplicar Tooltips no Etapa 1 (RF-04)

**Arquivos:**
- Modificar: `app/projeto/[id]/fase2/etapa1/page.tsx`

**Contexto:** O Etapa 1 é um Client Component. Precisamos:
1. Buscar `seen_tooltips` do perfil no Server (ou via API)
2. Passar para o componente de tooltip

**Problema:** Etapa 1 é Client Component mas precisa dos dados de `seen_tooltips`. Solução: criar um Server Component wrapper.

**Passo 1: Criar layout wrapper para Etapa 1**

A página atual em `etapa1/page.tsx` é um Client Component. Refatorar assim:

1. Renomear `etapa1/page.tsx` → `etapa1/etapa1-client.tsx`
2. Criar novo `etapa1/page.tsx` como Server Component que busca `seen_tooltips` e passa como prop

```typescript
// app/projeto/[id]/fase2/etapa1/page.tsx (novo — Server Component)
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Etapa1Client } from "./etapa1-client";

export default async function Etapa1Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("seen_tooltips")
    .eq("id", user.id)
    .single();

  const seenTooltips: Record<string, boolean> = profile?.seen_tooltips ?? {};

  return <Etapa1Client seenTooltips={seenTooltips} />;
}
```

**Passo 2: Ajustar o Client Component renomeado**

No arquivo renomeado `etapa1-client.tsx`:
- Adicionar `export function Etapa1Client` (de default export para named export)
- Adicionar prop `seenTooltips: Record<string, boolean>`
- Envolver o campo "ideia" com `<FirstTimeTooltip>`

No início da função `Etapa1Client`, adicionar recepção da prop:

```typescript
interface Etapa1ClientProps {
  seenTooltips: Record<string, boolean>;
}

export function Etapa1Client({ seenTooltips }: Etapa1ClientProps) {
  // ... resto do código existente
```

**Passo 3: Envolver campo de ideia com o tooltip**

Dentro do render do `Etapa1Client`, envolver o `<StageForm>` ou o campo específico de ideia:

```tsx
import { FirstTimeTooltip } from "@/components/first-time-tooltip";

// Dentro do JSX, envolver o StageForm:
<FirstTimeTooltip
  tooltipKey="ideia_descricao"
  jaVisto={seenTooltips["ideia_descricao"] ?? false}
  mensagem='Seja específico. "App de delivery para academias em SP" funciona melhor que "App de delivery".'
>
  <div> {/* wrapper obrigatório para o TooltipTrigger */}
    <StageForm fields={FORM_FIELDS} ... />
  </div>
</FirstTimeTooltip>
```

**Passo 4: Testar**

- Acessar Etapa 1 pela primeira vez → tooltip aparece após 0.5s
- Clicar para fechar → tooltip desaparece
- Recarregar → tooltip não aparece mais

**Passo 5: Commit**

```bash
git add app/projeto/[id]/fase2/etapa1/
git commit -m "feat(RF-04): tooltip de primeira vez no campo ideia da Etapa 1"
```

---

## Task 9: Tooltip no Botão Gerar (RF-04)

**Arquivos:**
- Modificar: `app/projeto/[id]/fase2/[etapa]/page.tsx`

**Contexto:** O tooltip no botão "Gerar" aparece na primeira vez em qualquer etapa. Verificar como o botão de gerar está implementado na página genérica de etapa.

**Passo 1: Ler a página de etapa genérica**

```
app/projeto/[id]/fase2/[etapa]/page.tsx
```

Identificar o elemento/botão que dispara a geração por IA.

**Passo 2: Aplicar o mesmo padrão Server/Client**

Seguindo o mesmo padrão da Task 8:
1. Extrair o Client Component existente para `etapa-client.tsx`
2. Criar `page.tsx` como Server Component que passa `seenTooltips`
3. Envolver o botão de gerar com `<FirstTimeTooltip tooltipKey="gerar_button" ...>`

```tsx
<FirstTimeTooltip
  tooltipKey="gerar_button"
  jaVisto={seenTooltips["gerar_button"] ?? false}
  mensagem="A IA vai analisar sua ideia com honestidade — incluindo os riscos e pontos fracos."
>
  <div>
    {/* Botão de gerar existente aqui */}
  </div>
</FirstTimeTooltip>
```

**Passo 3: Commit**

```bash
git add app/projeto/[id]/fase2/[etapa]/
git commit -m "feat(RF-04): tooltip de primeira vez no botão gerar análise de IA"
```

---

## Task 10: Verificação Final e Deploy

**Passo 1: Build local completo**

```bash
cd FrontEnd/ideor
npm run build
```
Esperado: Build sem erros.

**Passo 2: Checklist de verificação manual**

- [ ] Novo usuário cadastrado → vai para `/onboarding`
- [ ] Welcome Flow exibe 3 perguntas com RadioGroup
- [ ] Clicar "Começar" sem responder tudo → mensagem de erro
- [ ] Completar onboarding → redireciona para `/dashboard`
- [ ] Voltar para `/onboarding` após completar → redireciona para `/dashboard`
- [ ] Usuário com projetos → ProgressChecklist aparece no dashboard
- [ ] 2 primeiros itens do checklist marcados por padrão
- [ ] Etapa 1 → tooltip aparece na primeira visita, não na segunda
- [ ] Botão gerar → tooltip aparece na primeira vez
- [ ] Build no Vercel sem erros (Hero bug corrigido)

**Passo 3: Commit final**

```bash
git add -A
git commit -m "feat: onboarding P0 completo — RF-01 Welcome Flow, RF-03 Checklist, RF-04 Tooltips"
```

---

## Resumo das Decisões Técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Armazenar `onboarding_completed` | Tabela `profiles` existente | Simples, sem nova tabela |
| Armazenar respostas do Welcome Flow | Coluna `onboarding_answers jsonb` | Flexível, sem schema rígido |
| Flags de tooltips | Coluna `seen_tooltips jsonb` | Suporta N tooltips futuros sem migração |
| Update de tooltip | Função RPC com `||` operator | Merge atômico seguro no JSONB |
| Etapa 1 com tooltips | Server Component wrapper | Client Component não pode buscar do servidor diretamente |
| Checklist no dashboard | Baseado em tasks com status `evaluated` | Já existente, sem dado novo |
| Welcome Flow collapsível mobile | `hidden md:block` | Simple, sem biblioteca extra |

---

## Arquivos Criados/Modificados

| Arquivo | Tipo | Task |
|---|---|---|
| `supabase/migrations/20260311_onboarding_fields.sql` | Criar | 1 |
| `app/onboarding/actions.ts` | Criar | 2 |
| `app/onboarding/page.tsx` | Criar | 3 |
| `app/onboarding/welcome-form.tsx` | Criar | 3 |
| `app/auth/callback/page.tsx` | Modificar | 4 |
| `components/progress-checklist.tsx` | Criar | 5 |
| `app/dashboard/page.tsx` | Modificar | 6 |
| `lib/supabase/update-seen-tooltip.ts` | Criar | 7 |
| `components/first-time-tooltip.tsx` | Criar | 7 |
| `app/projeto/[id]/fase2/etapa1/page.tsx` | Modificar | 8 |
| `app/projeto/[id]/fase2/etapa1/etapa1-client.tsx` | Criar | 8 |
| `app/projeto/[id]/fase2/[etapa]/page.tsx` | Modificar | 9 |

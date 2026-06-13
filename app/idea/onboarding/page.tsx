// app/idea/onboarding/page.tsx
// Spec 025 — wizard de onboarding (Fase 1). Substitui os 3 cards de idea/create.
// Estrutura: estado central + sequência condicional de passos + persistência incremental.
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/supabase/use-user";
import { createDraftProject } from "../create/actions";
import { log } from "@/lib/logger";
import { RocketLoading } from "@/components/rocket-loading";

import {
  buildStepSequence,
  initialOnboardingState,
  type OnboardingState,
  type StepId,
} from "./_types";
import { loadOnboardingDraft } from "./_persistence";
import { OnboardingCard, OnboardingProgress } from "./_components";
import {
  IdeaStep,
  ApproachStep,
  AreaStep,
  BusinessTypeStep,
  AudienceStep,
  RegionStep,
  ConstraintsStep,
  WorkModeStep,
  ReviewStep,
} from "./steps";
import { DescribeStep } from "./describe-step";
import { useOnboardingSave } from "./_save";

function OnboardingWizard() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, loading: userLoading } = useUser();

  const [projectId, setProjectId] = useState<string | null>(
    sp.get("project_id")
  );
  const [state, setState] = useState<OnboardingState>(initialOnboardingState);
  const [stepIndex, setStepIndex] = useState(0);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sequência de passos derivada do estado (slide 8 é condicional).
  const sequence = useMemo(() => buildStepSequence(state), [state]);
  const currentStep: StepId = sequence[Math.min(stepIndex, sequence.length - 1)];

  // Atualiza um pedaço do estado (sem persistir — persistência é por passo).
  const patchState = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Boot: garante rascunho de projeto + reidrata estado salvo.
  useEffect(() => {
    if (userLoading) return;
    let cancelled = false;
    (async () => {
      try {
        let pid = projectId;
        if (!pid) {
          const result = await createDraftProject();
          if (result.error) throw new Error(result.error);
          pid = result.projectId!;
          // Mantém o project_id na URL para sobreviver a refresh.
          router.replace(`/idea/onboarding?project_id=${pid}`);
        }
        const draft = await loadOnboardingDraft(pid);
        if (cancelled) return;
        setProjectId(pid);
        setState(draft);
      } catch (e) {
        log.error("[onboarding] boot falhou:", e);
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Erro ao iniciar o onboarding"
          );
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading]);

  const goBack = useCallback(() => {
    if (stepIndex === 0) {
      router.replace("/dashboard");
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
  }, [stepIndex, router]);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(sequence.length - 1, i + 1));
  }, [sequence.length]);

  if (booting || userLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RocketLoading />
      </div>
    );
  }

  if (error || !projectId || !user) {
    return (
      <OnboardingCard>
        <p
          role="alert"
          className="rounded-lg bg-red-950/20 p-4 text-center text-sm text-red-400"
        >
          {error ?? "Falha de contexto do projeto."}
        </p>
      </OnboardingCard>
    );
  }

  // Props comuns repassadas a cada step.
  const stepProps: StepProps = {
    state,
    patchState,
    projectId,
    user,
    onBack: goBack,
    onNext: goNext,
    setError,
  };

  return (
    <OnboardingCard>
      <StepRouter step={currentStep} props={stepProps} />
      <OnboardingProgress current={stepIndex} total={sequence.length} />
    </OnboardingCard>
  );
}

/** Tipos das props que cada componente de step recebe (Fase 3). */
export interface StepProps {
  state: OnboardingState;
  patchState: (patch: Partial<OnboardingState>) => void;
  projectId: string;
  user: NonNullable<ReturnType<typeof useUser>["user"]>;
  onBack: () => void;
  onNext: () => void;
  setError: (msg: string | null) => void;
}

/** Roteador de passos → componente real de cada slide. */
function StepRouter({ step, props }: { step: StepId; props: StepProps }) {
  const { save, saving } = useOnboardingSave(props.projectId, props.state, props.setError);

  switch (step) {
    case "idea":
      return <IdeaStep {...props} />;
    case "approach":
      return <ApproachStep {...props} />;
    case "area":
      return <AreaStep {...props} />;
    case "businessType":
      return <BusinessTypeStep {...props} />;
    case "audience":
      return <AudienceStep {...props} />;
    case "region":
      return <RegionStep {...props} />;
    case "constraints":
      return <ConstraintsStep {...props} />;
    case "describe":
      return <DescribeStep {...props} />;
    case "workMode":
      return <WorkModeStep {...props} />;
    case "review":
      return <ReviewStep {...props} onSave={save} saving={saving} />;
    default:
      return null;
  }
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <RocketLoading />
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}

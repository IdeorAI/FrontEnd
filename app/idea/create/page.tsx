// app/idea/create/page.tsx
// Spec 025 — a entrada de criação foi reformulada para o onboarding por perguntas.
// Esta rota agora apenas redireciona para /idea/onboarding (preserva project_id),
// cobrindo bookmarks e qualquer link remanescente para a antiga tela de 3 cards.
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RocketLoading } from "@/components/rocket-loading";

function CreateRedirect() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const pid = sp.get("project_id");
    router.replace(
      pid ? `/idea/onboarding?project_id=${pid}` : "/idea/onboarding"
    );
  }, [router, sp]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <RocketLoading message="Preparando seu novo projeto..." />
    </div>
  );
}

export default function IdeaCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <RocketLoading />
        </div>
      }
    >
      <CreateRedirect />
    </Suspense>
  );
}

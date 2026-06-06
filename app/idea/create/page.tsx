// app/idea/create/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, Rocket, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/lib/supabase/use-user";
import { createDraftProject } from "./actions";
import { LlmLoadingOverlay } from "@/components/ui/llm-loading-overlay";
import { log } from "@/lib/logger";
import type { LucideIcon } from "lucide-react";

type OptionConfig = {
  key: "assisted" | "self" | "manual";
  icon: LucideIcon;
  title: string;
  subtitle: string;
  cta: string;
};

const OPTIONS: OptionConfig[] = [
  {
    key: "assisted",
    icon: Sparkles,
    title: "Descobrir oportunidades",
    subtitle:
      "Ainda não tenho uma ideia definida e quero que o Ideor sugira oportunidades de negócio para eu explorar.",
    cta: "CRIAR DO ZERO",
  },
  {
    key: "self",
    icon: Lightbulb,
    title: "Tenho uma ideia inicial",
    subtitle:
      "Já tenho uma ideia, mas ainda não desenvolvi e quero que o Ideor me ajude a refiná-la e estruturá-la em um passo a passo.",
    cta: "DESENVOLVER MINHA IDEIA",
  },
  {
    key: "manual",
    icon: Rocket,
    title: "Já possuo um projeto de startup",
    subtitle:
      "Eu tenho uma ideia bem definida. Desejo apenas organizar o projeto de forma manual, contando com o Ideor para um eventual apoio estratégico.",
    cta: "LANÇAR MINHA STARTUP",
  },
];

export default function IdeaCreatePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, loading } = useUser();
  const [pid, setPid] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restaurar project_id da URL se já existir (navegação de volta)
  useEffect(() => {
    const existingPid = sp.get("project_id");
    if (existingPid) setPid(existingPid);
  }, [sp]);

  // Cria o projeto apenas quando o usuário escolhe uma opção
  const createAndNavigate = async (destination: "self" | "assisted" | "manual") => {
    if (isCreatingProject) return;
    setIsCreatingProject(true);
    setError(null);
    try {
      const targetPid = pid ?? await (async () => {
        log.debug("Client: Chamando Server Action para criar projeto");
        const result = await createDraftProject();
        if (result.error) throw new Error(result.error);
        log.debug("Client: Projeto criado:", result.projectId);
        setPid(result.projectId!);
        return result.projectId!;
      })();

      const path =
        destination === "self"
          ? `/idea/questions-self?project_id=${targetPid}`
          : destination === "assisted"
          ? `/idea/questions-assisted?project_id=${targetPid}`
          : `/idea/questions-self?project_id=${targetPid}&next=manual`;
      router.push(path);
    } catch (error) {
      log.error("Client: Erro ao criar projeto:", error);
      setError(error instanceof Error ? error.message : "Erro inesperado ao criar projeto");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const isDisabled = loading || isCreatingProject || !user;

  return (
    <div className="relative w-full mx-auto px-4">
      {/* Overlay com foguete + frases rotativas (mesma usada nas etapas da fase 2) */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <LlmLoadingOverlay isVisible={isCreatingProject} />
      </div>

      <Card className="mx-auto w-full max-w-5xl rounded-3xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 pb-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Lightbulb className="h-5 w-5" />
            </span>
            Criar novo projeto
          </h1>
          <CardTitle className="text-base sm:text-lg font-semibold text-primary pt-2">
            {loading
              ? "Carregando..."
              : isCreatingProject
              ? "Criando seu projeto..."
              : "Como você gostaria de começar?"}
          </CardTitle>
          <CardDescription className="text-sm">
            Escolha a opção que melhor representa o estágio atual da sua ideia.
          </CardDescription>
          {error && (
            <p className="text-sm text-red-400 bg-red-950/20 p-3 rounded-lg mt-2">
              {error}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            {OPTIONS.map(({ key, icon: Icon, title, subtitle, cta }) => (
              <div
                key={key}
                className="flex flex-col rounded-2xl border border-white/10 bg-background/40 p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-col items-center text-center gap-3 flex-1">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {subtitle}
                  </p>
                </div>
                <Button
                  size="lg"
                  className="mt-5 w-full font-semibold rounded-lg shadow-md bg-gradient-hero hover:shadow-glow transition-all duration-300 transform hover:scale-105 text-[#1e2830] drop-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={() => createAndNavigate(key)}
                  disabled={isDisabled}
                >
                  {cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

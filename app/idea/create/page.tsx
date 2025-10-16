// app/idea/create/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/supabase/use-user";
import { createDraftProject } from "./actions";
import { RocketLoading } from "@/components/rocket-loading";

export default function IdeaCreatePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, loading } = useUser();
  const [pid, setPid] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // cria rascunho se não existir project_id
  useEffect(() => {
    const existingPid = sp.get("project_id");

    // Se já tem project_id na URL, usa ele
    if (existingPid) {
      setPid(existingPid);
      return;
    }

    // Se ainda está carregando user ou não tem user, retorna
    if (loading || !user) return;

    // Se não tem pid e tem user, cria projeto
    if (!pid && !isCreatingProject) {
      setIsCreatingProject(true);
      setError(null);
      (async () => {
        try {
          console.log("Client: Chamando Server Action para criar projeto");
          const result = await createDraftProject();

          if (result.error) {
            console.error("Client: Erro retornado:", result.error);
            setError(result.error);
            return;
          }

          if (result.projectId) {
            console.log("Client: Projeto criado:", result.projectId);
            setPid(result.projectId);
            router.replace(`/idea/create?project_id=${result.projectId}`);
          }
        } catch (error) {
          console.error("Client: Erro ao criar projeto:", error);
          setError("Erro inesperado ao criar projeto");
        } finally {
          setIsCreatingProject(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, sp]);

  const goToDescribe = () =>
    pid && router.push(`/idea/questions-self?project_id=${pid}`);
  const goToIdeor = () => pid && router.push(`/idea/questions-assisted?project_id=${pid}`);

  const isDisabled = loading || isCreatingProject || !pid;

  // Debug
  console.log({
    loading,
    isCreatingProject,
    pid,
    isDisabled,
    hasUser: !!user,
    error,
  });

  // Mostrar RocketLoading quando estiver criando projeto
  if (isCreatingProject) {
    return <RocketLoading message="Criando seu novo projeto..." />;
  }

  return (
    <div className="w-full mx-auto px-4">
      <div className="mx-auto w-full max-w-[640px] py-4">
        <div className="flex items-center justify-between ">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Criar novo projeto
          </h1>
        </div>
      </div>
      <Card className="mx-auto w-full max-w-[640px] rounded-3xl border-white/10  shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold">
            {loading
              ? "Carregando..."
              : isCreatingProject
              ? "Criando seu projeto..."
              : error
              ? "Erro ao criar projeto"
              : "Inicie sua nova Startup"}
          </CardTitle>
          {error && (
            <p className="text-sm text-red-400 bg-red-950/20 p-3 rounded-lg">
              {error}
            </p>
          )}
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs opacity-50">
              Debug: loading={String(loading)}, creating=
              {String(isCreatingProject)}, pid={pid || "null"}, error=
              {error || "null"}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <Button
              size="lg"
              className="w-full font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#07f7eb] to-[#9B6CFF] hover:shadow-glow transition-all duration-300 text-[#1e2830] transform hover:scale-105 drop-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={goToDescribe}
              disabled={isDisabled}
            >
              JÁ TENHO UMA IDEIA INICIAL
            </Button>
          </div>
          <div className="space-y-1">
            <Button
              size="lg"
              className="w-full font-semibold rounded-lg shadow-md bg-gradient-hero hover:shadow-glow transition-all duration-300 transform hover:scale-105 text-[#1e2830] drop-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={goToIdeor}
              disabled={isDisabled}
            >
              COMEÇAR COM A AJUDA DO IDEOR ✨
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

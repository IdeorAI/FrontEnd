"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StageForm, FormField } from "@/components/stage-form";
import { StageContextPanel } from "@/components/StageContextPanel";
import { generateDocument } from "@/lib/api/documents";
import { getStageSummaries, StageSummary } from "@/lib/api/stage-summaries";
import { RocketLoading } from "@/components/rocket-loading";
import { STAGE_CONFIGS } from "@/lib/stage-configs";
import { useUser } from "@/lib/supabase/use-user";
import { FirstTimeTooltip } from "@/components/first-time-tooltip";
import { toast } from "sonner";
import { StageStatusBadge } from "@/components/stage-status-badge";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { MvpPromptPanel } from "@/components/projeto/mvp-prompt-panel";
import { LlmLoadingOverlay } from "@/components/ui/llm-loading-overlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { DocumentViewer } from "@/components/document-viewer";
import { refineSectionAuthHeaders } from "@/lib/api/refine-section";

interface EtapaClientProps {
  seenTooltips: Record<string, boolean>;
}

/** Remove markdown fences e tenta extrair JSON limpo */
function stripJsonFences(raw: string): string {
  let s = raw.trim();
  // Remove ```json ... ``` ou ``` ... ```
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return s.trim();
}

/** Converte JSON (ou texto puro) para texto legível formatado */
function contentToDisplayText(content: string): string {
  const cleaned = stripJsonFences(content);

  // Tenta parse direto
  try {
    const parsed = JSON.parse(cleaned);
    // Se o parse resultou em string (double-encoded), tenta de novo
    if (typeof parsed === "string") {
      try {
        const inner = JSON.parse(stripJsonFences(parsed));
        if (typeof inner === "object" && inner !== null) return jsonToText(inner);
      } catch { /* ignore */ }
      return parsed; // era string pura dentro de JSON
    }
    return jsonToText(parsed);
  } catch {
    // Não é JSON — retorna como texto
    return content;
  }
}

function jsonToText(obj: unknown, depth = 0): string {
  if (obj === null || obj === undefined) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);

  if (Array.isArray(obj)) {
    return (obj as unknown[])
      .map((item) => {
        const text = jsonToText(item, depth + 1);
        // Se item é objeto, exibe como bloco; senão como bullet
        return typeof item === "object" && item !== null && !Array.isArray(item)
          ? text
          : `  - ${text}`;
      })
      .join("\n");
  }

  if (typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([key, value]) => {
        const label = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        // Valor simples: inline. Valor complexo: próxima linha.
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          return `${label}: ${value}`;
        }
        const valueText = jsonToText(value, depth + 1);
        return `${label}:\n${valueText}`;
      })
      .join("\n\n");
  }
  return String(obj);
}

export function EtapaClient({ seenTooltips }: EtapaClientProps) {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const etapa = params?.etapa as string;
  const { user, loading: userLoading } = useUser();

  const stageConfig = STAGE_CONFIGS[etapa];
  const currentStageNumber = parseInt(etapa.replace("etapa", "")) || 0;

  const [userId, setUserId] = useState<string>("");
  const [projectIdea, setProjectIdea] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [projectCategory, setProjectCategory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [stageSummaries, setStageSummaries] = useState<StageSummary[]>([]);
  const [currentStageSaved, setCurrentStageSaved] = useState<boolean | null>(null);
  const [previousStageSummary, setPreviousStageSummary] = useState<string | null>(null);

  // Carrega dados diretamente do Supabase (confiável, independente do backend)
  useEffect(() => {
    if (userLoading) return;

    const realUserId = user?.id ?? "";
    if (!realUserId) {
      router.push("/auth/login");
      return;
    }

    const fetchData = async () => {
      setUserId(realUserId);
      setHasError(false);

      try {
        const supabase = createClient();

        // 1. Buscar descrição do projeto (fase 1) diretamente do Supabase
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .select("description, name, category")
          .eq("id", projectId)
          .eq("owner_id", realUserId)
          .single();

        if (projectError || !project) {
          throw new Error("Projeto não encontrado ou acesso negado.");
        }
        setProjectIdea(project.description || "");
        setProjectName(project.name || "");
        setProjectCategory(project.category || null);

        // 2. Verificar se já existe task gerada para esta etapa
        const { data: existingTask } = await supabase
          .from("tasks")
          .select("id, content")
          .eq("project_id", projectId)
          .eq("phase", etapa)
          .maybeSingle();

        if (existingTask?.content) {
          setTaskId(existingTask.id);
          setGeneratedContent(existingTask.content);
        }

        // 3. Buscar resumos das etapas (contexto acumulado) — não-bloqueante
        try {
          const summaries = await getStageSummaries(projectId, realUserId);
          setStageSummaries(summaries);

          // Resumo da etapa ANTERIOR como sugestão de preenchimento
          if (currentStageNumber > 1) {
            const previousSummary = summaries.find(
              (s) => s.stageNumber === currentStageNumber - 1
            );
            if (previousSummary) {
              setPreviousStageSummary(previousSummary.summary);
            }
          }
        } catch {
          // Resumos são contexto opcional, não bloqueiam a página
        }
      } catch (error) {
        console.error("[EtapaPage] Error fetching data:", error);
        const msg = error instanceof Error ? error.message : "Erro desconhecido";
        setErrorMessage(msg);
        setHasError(true);
        toast.error("Erro ao carregar dados do projeto.", {
          description: "Verifique sua conexão e tente novamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, etapa, currentStageNumber, user, userLoading, router]);

  // Sugestão para o campo "ideia":
  // etapa1 → usa a descrição do projeto (fase 1)
  // etapa2+ → usa o resumo da etapa anterior
  const ideaSuggestion =
    currentStageNumber === 1 ? projectIdea : previousStageSummary;

  const formFieldsWithSuggestions: FormField[] =
    stageConfig?.fields.map((field: FormField) => {
      if (field.name === "ideia" && ideaSuggestion) {
        return { ...field, suggestion: ideaSuggestion, maxLength: 800 };
      }
      if (field.type === "textarea") {
        return { ...field, maxLength: field.maxLength || 800 };
      }
      return field;
    }) || [];

  const handleGenerate = async (values: Record<string, string>) => {
    if (!userId) return;
    setIsGenerating(true);

    try {
      const inputs = {
        ideia: values.ideia || projectIdea || "",
        ...values,
      };

      const response = await generateDocument(
        projectId,
        { phase: etapa, inputs },
        userId
      );

      setTaskId(response.taskId);
      setGeneratedContent(response.generatedContent);

      if (response.stageSaved === false) {
        toast.warning("Atenção: Resumo não persistido", {
          description:
            "O documento foi gerado, mas o resumo para contexto futuro não foi salvo. Recomendamos regenerar.",
          duration: 6000,
        });
        setCurrentStageSaved(false);
      } else {
        setCurrentStageSaved(true);
        toast.success("Documento gerado e contexto salvo com sucesso!");
      }

      // Atualizar resumos após geração
      try {
        const summaries = await getStageSummaries(projectId, userId);
        setStageSummaries(summaries);
      } catch {
        // não-bloqueante
      }
      // Invalida o layout Server Component para atualizar a barra de progresso
      router.refresh();
    } catch (error) {
      console.error("[EtapaPage] Erro ao gerar documento:", error);
      toast.error("Falha ao gerar documento", {
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getNextEtapa = () => {
    if (currentStageNumber < 5) return `etapa${currentStageNumber + 1}`;
    return null;
  };

  const getPreviousEtapa = () => {
    if (currentStageNumber > 1) return `etapa${currentStageNumber - 1}`;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RocketLoading />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="font-semibold text-lg">
            Não foi possível carregar os dados do projeto.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {errorMessage || "Verifique sua conexão e tente novamente."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!stageConfig) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Etapa inválida: {etapa}</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <LlmLoadingOverlay isVisible={isGenerating} />

      {/* Botão voltar para o projeto */}
      <button
        onClick={() => router.push(`/projeto/dash?project_id=${projectId}`)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o projeto
      </button>

      {/* Badge de status */}
      {currentStageSaved === false && (
        <StageStatusBadge
          status="pending"
          message="Contexto não salvo - precisa ser regerado"
        />
      )}

      {/* Painel de Contexto Acumulado */}
      {!generatedContent && stageSummaries.length > 0 && (
        <StageContextPanel
          stages={stageSummaries}
          currentStage={currentStageNumber}
        />
      )}

      {/* Formulário (quando não há conteúdo gerado) */}
      {!generatedContent && (
        <FirstTimeTooltip
          tooltipKey="gerar_button"
          jaVisto={seenTooltips["gerar_button"] ?? false}
          mensagem="A IA vai analisar sua ideia com honestidade — incluindo os riscos e pontos fracos."
        >
          <div>
            <StageForm
              title={stageConfig.title}
              description={stageConfig.description}
              fields={formFieldsWithSuggestions}
              onSubmit={handleGenerate}
              isSubmitting={isGenerating}
            />
          </div>
        </FirstTimeTooltip>
      )}

      {/* Conteúdo Gerado — visualização e edição por seção */}
      {generatedContent && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#8c7dff] mb-4">
              {stageConfig.title}
            </h3>

            <DocumentViewer
              content={generatedContent}
              stageName={stageConfig.title}
              onSectionSave={async (key, newValue) => {
                if (!taskId || !generatedContent) return;

                let parsed: Record<string, unknown>;
                try {
                  parsed = JSON.parse(generatedContent);
                } catch {
                  parsed = {};
                }
                parsed[key] = newValue;
                const updated = JSON.stringify(parsed, null, 2);

                const supabase = createClient();
                const { error } = await supabase
                  .from("tasks")
                  .update({ content: updated, updated_at: new Date().toISOString() })
                  .eq("id", taskId);

                if (error) throw new Error("Falha ao salvar no banco de dados");

                setGeneratedContent(updated);
                toast.success("Seção salva com sucesso");
              }}
              onSectionRefine={async (key, sectionTitle, currentValue, feedback) => {
                const headers = await refineSectionAuthHeaders();
                const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

                const res = await fetch(`${API_BASE}/api/chat/refine-section`, {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    projectId,
                    stageName: stageConfig.title,
                    sectionKey: key,
                    sectionTitle,
                    sectionContent: currentValue,
                    userFeedback: feedback,
                  }),
                });

                if (res.status === 429) throw new Error("Limite de mensagens por hora atingido");
                if (res.status === 422) {
                  const body = await res.json().catch(() => ({ error: "Erro ao refinar" }));
                  throw new Error(body.error ?? "Erro ao refinar");
                }
                if (!res.ok) throw new Error(`Erro ${res.status} ao refinar seção`);

                const data = await res.json();
                return (data.refinedContent ?? data.RefinedContent) as string;
              }}
            />
          </Card>
        </div>
      )}

      {/* Painel MVP NoCode — apenas na Etapa 5 */}
      {currentStageNumber === 5 && (
        <MvpPromptPanel
          projectName={projectName}
          projectCategory={projectCategory}
          stage5Content={generatedContent ? contentToDisplayText(generatedContent) : null}
        />
      )}

      {/* Navegação entre etapas */}
      {generatedContent && (
        <div className="flex justify-between">
          {getPreviousEtapa() && (
            <button
              onClick={() =>
                router.push(
                  `/projeto/${projectId}/fase2/${getPreviousEtapa()}`
                )
              }
              className="px-6 py-3 border border-[#8c7dff] text-[#8c7dff] hover:bg-[#8c7dff] hover:text-white rounded-lg font-medium transition-colors"
            >
              ← Etapa Anterior
            </button>
          )}
          {getNextEtapa() && (
            <button
              onClick={() => router.push(`/projeto/${projectId}/fase2/${getNextEtapa()}`)}
              className="ml-auto px-6 py-3 bg-[#8c7dff] hover:bg-[#7a6de6] text-white rounded-lg font-medium transition-colors"
            >
              Próxima Etapa →
            </button>
          )}
          {!getNextEtapa() && (
            <button
              onClick={() => router.push(`/projeto/dash?project_id=${projectId}`)}
              className="ml-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Finalizar Fase Projeto ✓
            </button>
          )}
        </div>
      )}
    </div>
  );
}

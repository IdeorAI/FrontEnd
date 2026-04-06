"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StageForm, FormField } from "@/components/stage-form";
import { DocumentViewer } from "@/components/document-viewer";
import { StageContextPanel } from "@/components/StageContextPanel";
import { regenerateDocument, refineDocument, generateDocument } from "@/lib/api/documents";
import { getProjectTasks } from "@/lib/api/tasks";
import { getProject } from "@/lib/api/projects";
import { getStageSummaries, StageSummary } from "@/lib/api/stage-summaries";
import { RocketLoading } from "@/components/rocket-loading";
import { STAGE_CONFIGS } from "@/lib/stage-configs";
import { useUser } from "@/lib/supabase/use-user";
import { FirstTimeTooltip } from "@/components/first-time-tooltip";
import { toast } from "sonner";
import { StageStatusBadge } from "@/components/stage-status-badge";

interface EtapaClientProps {
  seenTooltips: Record<string, boolean>;
}

export function EtapaClient({ seenTooltips }: EtapaClientProps) {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const etapa = params?.etapa as string;
  const { user } = useUser();

  const stageConfig = STAGE_CONFIGS[etapa];

  const [userId, setUserId] = useState<string>("");
  const [projectIdea, setProjectIdea] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stageSummaries, setStageSummaries] = useState<StageSummary[]>([]);
  const [currentStageSaved, setCurrentStageSaved] = useState<boolean | null>(null);
  const [previousStageSummary, setPreviousStageSummary] = useState<string | null>(null);

  // Fetch user ID, project idea, check if document exists, and fetch stage summaries
  useEffect(() => {
    const fetchData = async () => {
      const realUserId = user?.id ?? "";
      if (!realUserId) return;
      setUserId(realUserId);

      try {
        // Buscar a ideia do projeto (description)
        const project = await getProject(projectId, realUserId);
        setProjectIdea(project.description || "");

        // Check if task already exists
        const tasks = await getProjectTasks(projectId, realUserId);
        const existingTask = tasks.find((t) => t.phase === etapa);

        if (existingTask) {
          setTaskId(existingTask.id);
          setGeneratedContent(existingTask.content || null);
        }

        // Buscar resumos das etapas anteriores
        try {
          const summaries = await getStageSummaries(projectId, realUserId);
          setStageSummaries(summaries);

          // Buscar resumo da etapa anterior para usar como sugestão
          const currentStageNumber = parseInt(etapa.replace("etapa", "")) || 0;
          if (currentStageNumber > 1) {
            const previousSummary = summaries.find(
              (s) => s.stageNumber === currentStageNumber - 1
            );
            if (previousSummary) {
              setPreviousStageSummary(previousSummary.summary);
            }
          }
        } catch (summaryError) {
          console.log("[EtapaPage] Stage summaries not available yet:", summaryError);
        }
      } catch (error) {
        console.error("[EtapaPage] Error fetching data:", error);
        alert("Erro ao carregar dados do projeto. Tente recarregar a página.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, etapa, user]);

  // Preparar campos do formulário com sugestão da etapa anterior
  const formFieldsWithSuggestions: FormField[] = stageConfig?.fields.map((field: FormField) => {
    // Adicionar sugestão apenas para o campo "ideia" se houver resumo anterior
    if (field.name === "ideia" && previousStageSummary) {
      return {
        ...field,
        suggestion: previousStageSummary,
        maxLength: 800, // Limite de caracteres para o input do usuário
      };
    }
    // Adicionar limite de caracteres para textareas
    if (field.type === "textarea") {
      return {
        ...field,
        maxLength: field.maxLength || 800,
      };
    }
    return field;
  }) || [];

  const handleGenerate = async (values: Record<string, string>) => {
    if (!userId) return;

    setIsGenerating(true);

    try {
      // Preparar inputs para o backend
      const inputs = {
        ideia: values.ideia || projectIdea || "",
        ...values,
      };

      // Chamar o backend para gerar com contexto acumulado
      const response = await generateDocument(projectId, {
        phase: etapa,
        inputs: inputs
      }, userId);

      // Atualizar UI
      setTaskId(response.taskId);
      setGeneratedContent(response.generatedContent);

      // F-01: Toast de erro/sucesso no salvamento
      if (response.stageSaved === false) {
        toast.warning("Atenção: Resumo não persistido", {
          description: "O documento foi gerado, mas o resumo para contexto futuro não foi salvo. Recomendamos regenerar.",
          duration: 6000,
        });
        setCurrentStageSaved(false);
      } else {
        setCurrentStageSaved(true);
        toast.success("Documento gerado e contexto salvo com sucesso!");
      }

      // Atualizar a lista de resumos para o painel de contexto
      const summaries = await getStageSummaries(projectId, userId);
      setStageSummaries(summaries);

    } catch (error) {
      console.error("[EtapaPage] Erro ao gerar documento:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Falha ao gerar documento", {
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!taskId || !userId) return;

    setIsRegenerating(true);
    try {
      const response = await regenerateDocument(taskId, {}, userId);
      setGeneratedContent(response.generatedContent);
    } catch (error) {
      console.error("Error regenerating document:", error);
      alert("Erro ao regenerar documento.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRefine = async (feedback: string) => {
    if (!taskId || !userId) return;

    setIsRefining(true);
    try {
      const response = await refineDocument(taskId, feedback, userId);
      setGeneratedContent(response.generatedContent);
    } catch (error) {
      console.error("Error refining document:", error);
      alert("Erro ao refinar documento.");
    } finally {
      setIsRefining(false);
    }
  };

  const getNextEtapa = () => {
    const etapaNumber = parseInt(etapa.replace("etapa", ""));
    // MVP: apenas 5 etapas (etapa1 a etapa5)
    if (etapaNumber < 5) {
      return `etapa${etapaNumber + 1}`;
    }
    return null;
  };

  const getPreviousEtapa = () => {
    const etapaNumber = parseInt(etapa.replace("etapa", ""));
    if (etapaNumber > 1) {
      return `etapa${etapaNumber - 1}`;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RocketLoading />
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

  const currentStageNumber = parseInt(etapa.replace("etapa", "")) || 0;

  return (
    <div className="space-y-6">
      {/* Badge de status da etapa (F-02) */}
      {currentStageSaved === false && (
        <StageStatusBadge 
          status="pending" 
          message="Contexto não salvo - precisa ser regerado" 
        />
      )}

      {/* Painel de Contexto Acumulado (F-04) */}
      {!generatedContent && stageSummaries.length > 0 && (
        <StageContextPanel
          stages={stageSummaries}
          currentStage={currentStageNumber}
        />
      )}

      {/* Formulário */}
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

      {/* Documento Gerado */}
      {generatedContent && (
        <DocumentViewer
          content={generatedContent}
          onRegenerate={handleRegenerate}
          onRefine={handleRefine}
          isRegenerating={isRegenerating}
          isRefining={isRefining}
        />
      )}

      {/* Navegação */}
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
              onClick={() =>
                router.push(`/projeto/${projectId}/fase2/${getNextEtapa()}`)
              }
              className="ml-auto px-6 py-3 bg-[#8c7dff] hover:bg-[#7a6de6] text-white rounded-lg font-medium transition-colors"
            >
              Próxima Etapa →
            </button>
          )}
          {!getNextEtapa() && (
            <button
              onClick={() => router.push(`/projeto/${projectId}/dash`)}
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

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StageForm } from "@/components/stage-form";
import { DocumentViewer } from "@/components/document-viewer";
import {
  generateDocument,
  regenerateDocument,
  refineDocument,
} from "@/lib/api/documents";
import { getProjectTasks } from "@/lib/api/tasks";
import { RocketLoading } from "@/components/rocket-loading";
import { STAGE_CONFIGS } from "@/lib/stage-configs";

export default function EtapaPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const etapa = params?.etapa as string;

  const stageConfig = STAGE_CONFIGS[etapa];

  const [userId, setUserId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user ID and check if document already exists
  useEffect(() => {
    const fetchData = async () => {
      // Get user from Supabase
      // TODO: Implementar auth corretamente
      const mockUserId = "user-id-mock";
      setUserId(mockUserId);

      // Check if task already exists
      try {
        const tasks = await getProjectTasks(projectId, mockUserId);
        const existingTask = tasks.find((t) => t.phase === etapa);

        if (existingTask) {
          setTaskId(existingTask.id);
          setGeneratedContent(existingTask.content || null);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, etapa]);

  const handleGenerate = async (values: Record<string, string>) => {
    if (!userId) return;

    setIsGenerating(true);
    try {
      const response = await generateDocument(
        projectId,
        {
          phase: etapa,
          inputs: values,
        },
        userId
      );

      setTaskId(response.taskId);
      setGeneratedContent(response.generatedContent);
    } catch (error) {
      console.error("Error generating document:", error);
      alert("Erro ao gerar documento. Tente novamente.");
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
    if (etapaNumber < 7) {
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

  return (
    <div className="space-y-6">
      {/* Formulário */}
      {!generatedContent && (
        <StageForm
          title={stageConfig.title}
          description={stageConfig.description}
          fields={stageConfig.fields}
          onSubmit={handleGenerate}
          isSubmitting={isGenerating}
        />
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

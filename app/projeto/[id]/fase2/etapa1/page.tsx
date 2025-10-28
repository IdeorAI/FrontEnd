"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StageForm, FormField } from "@/components/stage-form";
import { DocumentViewer } from "@/components/document-viewer";
import { generateDocument, regenerateDocument, refineDocument } from "@/lib/api/documents";
import { getProjectTasks } from "@/lib/api/tasks";
import { RocketLoading } from "@/components/rocket-loading";

const FORM_FIELDS: FormField[] = [
  {
    name: "ideia",
    label: "Ideia Inicial",
    type: "textarea",
    placeholder: "Descreva sua ideia em 2-3 frases...",
    required: true,
  },
  {
    name: "mercado",
    label: "Mercado/Segmento-alvo",
    type: "text",
    placeholder: "Ex: saúde digital para clínicas pequenas",
    required: false,
  },
  {
    name: "regiao",
    label: "Região/País de Atuação",
    type: "text",
    placeholder: "Ex: Brasil",
    defaultValue: "Brasil",
    required: true,
  },
  {
    name: "recursos",
    label: "Restrições e Recursos",
    type: "textarea",
    placeholder: "Ex: orçamento limitado, equipe de 2 pessoas, no-code permitido",
    required: false,
  },
];

export default function Etapa1Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

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
      // Get user from Supabase (implementar conforme seu auth)
      // Por enquanto, usando mock
      const mockUserId = "user-id-mock"; // TODO: Pegar do Supabase auth
      setUserId(mockUserId);

      // Check if task already exists
      try {
        const tasks = await getProjectTasks(projectId, mockUserId);
        const existingTask = tasks.find((t) => t.phase === "etapa1");

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
  }, [projectId]);

  const handleGenerate = async (values: Record<string, string>) => {
    if (!userId) return;

    setIsGenerating(true);
    try {
      const response = await generateDocument(
        projectId,
        {
          phase: "etapa1",
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
      // TODO: Capturar novos inputs do usuário
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RocketLoading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário */}
      {!generatedContent && (
        <StageForm
          title="Etapa 1: Problema e Oportunidade"
          description="Vamos clarificar a dor central, público-alvo e contexto competitivo através de pesquisa estruturada."
          fields={FORM_FIELDS}
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
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push(`/projeto/${projectId}/fase2/etapa2`)}
            className="px-6 py-3 bg-[#8c7dff] hover:bg-[#7a6de6] text-white rounded-lg font-medium transition-colors"
          >
            Próxima Etapa →
          </button>
        </div>
      )}
    </div>
  );
}

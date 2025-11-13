"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StageForm, FormField } from "@/components/stage-form";
import { DocumentViewer } from "@/components/document-viewer";
import { regenerateDocument, refineDocument } from "@/lib/api/documents";
import { getProjectTasks } from "@/lib/api/tasks";
import { getProject } from "@/lib/api/projects";
import { RocketLoading } from "@/components/rocket-loading";
import { generateDocumentByStage } from "@/lib/gemini-documents";
import { saveGeneratedDocument } from "@/lib/supabase-tasks";

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
  const [projectIdea, setProjectIdea] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user ID, project idea and check if document already exists
  useEffect(() => {
    const fetchData = async () => {
      // Get user from Supabase (implementar conforme seu auth)
      // Por enquanto, usando mock
      const mockUserId = "user-id-mock"; // TODO: Pegar do Supabase auth
      setUserId(mockUserId);

      try {
        // Buscar a ideia do projeto (description)
        const project = await getProject(projectId, mockUserId);
        setProjectIdea(project.description || "");
        console.log("[Etapa1Page] Ideia do projeto carregada:", project.description);

        // Check if task already exists
        const tasks = await getProjectTasks(projectId, mockUserId);
        const existingTask = tasks.find((t) => t.phase === "etapa1");

        if (existingTask) {
          setTaskId(existingTask.id);
          setGeneratedContent(existingTask.content || null);
          console.log("[Etapa1Page] Documento existente encontrado:", existingTask.id);
        }
      } catch (error) {
        console.error("[Etapa1Page] Error fetching data:", error);
        alert("Erro ao carregar dados do projeto. Tente recarregar a página.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGenerate = async (_values: Record<string, string>) => {
    if (!userId) return;

    if (!projectIdea) {
      alert("Erro: Ideia do projeto não encontrada. Recarregue a página.");
      return;
    }

    setIsGenerating(true);
    console.log("[Etapa1Page] Iniciando geração direta via Gemini...", {
      projectId,
      userId,
      ideiaLength: projectIdea.length
    });

    try {
      // 1. Gerar conteúdo diretamente via Gemini (frontend)
      console.log("[Etapa1Page] Chamando Gemini API...");
      const geminiResponse = await generateDocumentByStage(
        "etapa1",
        projectIdea,
        userId
      );

      console.log("[Etapa1Page] Gemini respondeu:", {
        contentLength: geminiResponse.content.length,
        tokensUsed: geminiResponse.tokensUsed,
        elapsedMs: geminiResponse.elapsedMs
      });

      // 2. Salvar resultado no Supabase
      console.log("[Etapa1Page] Salvando no Supabase...");
      const saveResponse = await saveGeneratedDocument({
        projectId,
        userId,
        stage: "etapa1",
        content: geminiResponse.content
      });

      console.log("[Etapa1Page] Documento salvo com sucesso:", saveResponse.taskId);

      // 3. Atualizar UI
      setTaskId(saveResponse.taskId);
      setGeneratedContent(geminiResponse.content);

      alert(`✅ Documento gerado com sucesso!\n\nTokens usados: ${geminiResponse.tokensUsed}\nTempo: ${(geminiResponse.elapsedMs / 1000).toFixed(1)}s`);
    } catch (error) {
      console.error("[Etapa1Page] Erro ao gerar documento:", error);

      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      alert(`Erro ao gerar documento:\n\n${errorMessage}`);
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

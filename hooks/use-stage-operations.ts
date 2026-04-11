"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateDocument } from "@/lib/api/documents";
import { log } from "@/lib/logger";

type EtapaId = "etapa1" | "etapa2" | "etapa3" | "etapa4" | "etapa5";

interface UseStageOperationsOptions {
  projectId: string | null;
}

interface UseStageOperationsReturn {
  etapaContent: Record<string, string>;
  completedStages: number[];
  currentStage: number;
  setEtapaContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCompletedStages: React.Dispatch<React.SetStateAction<number[]>>;
  setCurrentStage: React.Dispatch<React.SetStateAction<number>>;
  generateStage: (etapaId: EtapaId, idea: string) => Promise<string>;
  saveStage: (etapaId: string, content: string) => Promise<void>;
}

export function useStageOperations({
  projectId,
}: UseStageOperationsOptions): UseStageOperationsReturn {
  const [etapaContent, setEtapaContent] = useState<Record<string, string>>({});
  const [completedStages, setCompletedStages] = useState<number[]>([0]);
  const [currentStage, setCurrentStage] = useState(1);

  const generateStage = useCallback(
    async (etapaId: EtapaId, idea: string): Promise<string> => {
      if (!projectId) {
        throw new Error("Project ID ou usuário não encontrado");
      }

      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser?.id) {
        throw new Error("Usuário não autenticado");
      }

      log.info("[useStageOperations] Gerando documento via backend...", {
        etapaId,
        ideaLength: idea.length,
      });

      const response = await generateDocument(
        projectId,
        { phase: etapaId, inputs: { ideia: idea } },
        currentUser.id
      );

      log.info("[useStageOperations] Backend respondeu:", {
        contentLength: response.generatedContent.length,
        tokensUsed: response.tokensUsed,
        stageSaved: response.stageSaved,
      });

      return response.generatedContent;
    },
    [projectId]
  );

  const saveStage = useCallback(
    async (etapaId: string, content: string): Promise<void> => {
      if (!projectId) {
        throw new Error("Project ID ou usuário não encontrado");
      }

      const supabase = createClient();

      const { data: existingTask, error: searchError } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", projectId)
        .eq("phase", etapaId)
        .maybeSingle();

      if (searchError) {
        log.error("Erro ao buscar task existente:", searchError);
        throw new Error(`Erro ao buscar task: ${searchError.message}`);
      }

      let result;
      if (existingTask) {
        log.info("Atualizando task existente:", existingTask.id);
        result = await supabase
          .from("tasks")
          .update({
            content,
            status: "evaluated",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingTask.id)
          .select();
      } else {
        log.info("Criando nova task para fase:", etapaId);
        result = await supabase
          .from("tasks")
          .insert({
            project_id: projectId,
            phase: etapaId,
            content,
            title: `Etapa ${etapaId}`,
            description: `Documento gerado para ${etapaId}`,
            status: "evaluated",
          })
          .select();
      }

      if (result.error) {
        throw new Error(`Erro ao salvar: ${result.error.message}`);
      }

      log.info("Conteúdo salvo com sucesso:", result.data);

      setEtapaContent((prev) => ({ ...prev, [etapaId]: content }));

      const etapaNum = parseInt(etapaId.replace("etapa", ""));
      setCompletedStages((prev) => {
        if (!prev.includes(etapaNum)) {
          const newCompleted = [...prev, etapaNum].sort((a, b) => a - b);
          const maxCompleted = Math.max(...newCompleted.filter((n) => n > 0));
          setCurrentStage(maxCompleted < 5 ? maxCompleted + 1 : 5);
          return newCompleted;
        }
        return prev;
      });
    },
    [projectId]
  );

  return {
    etapaContent,
    completedStages,
    currentStage,
    setEtapaContent,
    setCompletedStages,
    setCurrentStage,
    generateStage,
    saveStage,
  };
}

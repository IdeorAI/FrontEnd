// API client para stage summaries (resumos das etapas)
import { authHeaders } from './auth-headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface StageSummary {
  stageNumber: number;
  stageName: string;
  summary: string;
  generatedAt: string;
}

export interface StageSummariesResponse {
  projectId: string;
  summaries: StageSummary[];
}

export interface StageStatus {
  stageNumber: number;
  hasSummary: boolean;
  isValid: boolean;
  status: 'valid' | 'pending' | 'invalidated';
}

export interface StageStatusesResponse {
  projectId: string;
  stages: StageStatus[];
}

/**
 * Busca todos os resumos salvos de um projeto
 */
export async function getStageSummaries(
  projectId: string,
  userId: string
): Promise<StageSummary[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/stage-summaries`, {
    headers: await authHeaders(userId),
  });

  if (!res.ok) {
    // Se endpoint não existir ainda, retorna array vazio
    if (res.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch stage summaries');
  }

  const data: StageSummariesResponse = await res.json();
  return data.summaries;
}

/**
 * Busca o status de todas as etapas (para badges)
 * Retorna informação sobre quais etapas precisam ser regeradas
 */
export async function getStageStatuses(
  projectId: string,
  userId: string
): Promise<StageStatus[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/stage-statuses`, {
    headers: await authHeaders(userId),
  });

  if (!res.ok) {
    // Se endpoint não existir ainda, retorna array vazio
    if (res.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch stage statuses');
  }

  const data: StageStatusesResponse = await res.json();
  return data.stages;
}

/**
 * Fallback: Calcula status das etapas baseado nas tasks existentes
 * Usado quando o endpoint de stage-summaries não está disponível
 */
export function calculateStageStatus(
  completedStages: number[],
  hasSummaries: number[]
): StageStatus[] {
  const allStages = [1, 2, 3, 4, 5];
  
  return allStages.map((stageNum) => {
    const hasContent = completedStages.includes(stageNum);
    const hasSummary = hasSummaries.includes(stageNum);
    
    if (!hasContent) {
      return {
        stageNumber: stageNum,
        hasSummary: false,
        isValid: false,
        status: 'valid' as const, // Etapa não iniciada = sem badge
      };
    }
    
    if (!hasSummary) {
      return {
        stageNumber: stageNum,
        hasSummary: false,
        isValid: false,
        status: 'pending' as const, // Contexto pendente (amarelo)
      };
    }
    
    // Verifica se etapas posteriores foram regeneradas
    const laterStagesRegenerated = allStages
      .filter(s => s > stageNum)
      .some(s => completedStages.includes(s) && !hasSummaries.includes(s));
    
    if (laterStagesRegenerated) {
      return {
        stageNumber: stageNum,
        hasSummary: true,
        isValid: false,
        status: 'invalidated' as const, // Precisa ser regerada (vermelho)
      };
    }
    
    return {
      stageNumber: stageNum,
      hasSummary: true,
      isValid: true,
      status: 'valid' as const, // Tudo OK
    };
  });
}

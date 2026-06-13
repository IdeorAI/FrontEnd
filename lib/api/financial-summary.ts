import { authHeaders } from './auth-headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/** Síntese financeira canônica (Spec 022 v2) — os 6 números do card Resumo Financeiro. */
export interface FinancialSummary {
  receitaBrutaAnual: number;
  deducoesAnual: number;
  receitaLiquidaAnual: number;
  lucroBrutoAnual: number;
  opexMensalMedia: number;
  lucroLiquidoAnual: number;
  fromCache: boolean;
}

/** Busca o Resumo Financeiro já gerado. Retorna null se ainda não existe. */
export async function getFinancialSummary(
  projectId: string,
  userId: string,
): Promise<FinancialSummary | null> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/financial-summary`, {
    headers: await authHeaders(userId),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Resumo Financeiro fetch failed: ${res.status}`);
  return res.json();
}

/** Gera (ou recalcula) o Resumo Financeiro a partir da DRE da Etapa 4. */
export async function triggerFinancialSummary(
  projectId: string,
  userId: string,
): Promise<FinancialSummary> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/financial-summary`, {
    method: 'POST',
    headers: await authHeaders(userId),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Geração falhou: ${res.status}`);
  }
  return res.json();
}

/**
 * Spec 024 — preenche a DRE por IA no modo manual (uso único).
 * O backend gera a DRE a partir do contexto do projeto (desvinculado da etapa 4)
 * e marca a flag de uso único. Lança em 422 se já preenchida.
 */
export async function aiFillFinancialSummary(
  projectId: string,
  userId: string,
): Promise<FinancialSummary> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/financial-summary/ai-fill`, {
    method: 'POST',
    headers: await authHeaders(userId),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Preenchimento por IA falhou: ${res.status}`);
  }
  return res.json();
}

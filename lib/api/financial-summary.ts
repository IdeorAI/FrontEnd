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

/**
 * Spec 027 — write-back das variáveis financeiras ao editar a DRE.
 * Chamado APÓS salvar a DRE: o backend recalcula as âncoras (receita/custos médios),
 * trava (locked) e reescreve a etapa 4 (marcando-a desatualizada). Best-effort:
 * nunca lança — uma falha aqui não deve impedir o save da DRE.
 */
export async function syncFinancialVariables(
  projectId: string,
  userId: string,
  dre: unknown,
): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/projects/${projectId}/financial-summary/sync-variables`, {
      method: 'POST',
      headers: { ...(await authHeaders(userId)), 'Content-Type': 'application/json' },
      body: JSON.stringify({ dre: JSON.stringify(dre) }),
    });
  } catch (err) {
    console.warn('[FinVars] sync-variables falhou (não crítico):', err);
  }
}

/**
 * Spec 022 — baixa o Resumo Financeiro (tabela DRE atualizada) em PDF.
 * Dispara o download no navegador.
 */
export async function downloadFinancialSummaryPdf(
  projectId: string,
  userId: string,
  filename = `IdeorAI-resumo-financeiro-${projectId}.pdf`,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/projects/${projectId}/financial-summary/pdf`,
    { headers: await authHeaders(userId) },
  );
  if (res.status === 404) throw new Error('Resumo Financeiro ainda não foi gerado.');
  if (!res.ok) throw new Error(`Erro ${res.status} ao gerar o PDF.`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
